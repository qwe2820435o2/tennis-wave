"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, MapPin, Users, User, MessageCircle, Edit, Trash2 } from "lucide-react";
import { tennisBookingService } from "@/services/tennisBookingService";
import { 
  TennisBooking, 
  BookingRequest,
  getBookingTypeLabel, 
  getBookingStatusLabel, 
  getBookingStatusColor,
  getSkillLevelLabel,
  getSkillLevelColor,
  CreateBookingRequestDto,
  RespondToRequestDto,
  RequestStatus,
  CreateBookingDto
} from "@/types/tennisBooking";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { RootState } from "@/store";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

export default function BookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.user);
  
  const [booking, setBooking] = useState<TennisBooking | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [requestMessage, setRequestMessage] = useState("");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<CreateBookingDto | null>(null);

  const bookingId = parseInt(params.id as string);

  const isCreator = booking?.creatorId === userId;
  const isParticipant = booking?.participants.some(p => p.userId === userId);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      loadRequests();
    }
  }, [bookingId]);

  // 自动进入编辑模式
  useEffect(() => {
    if (searchParams.get("edit") === "1" && isCreator && booking) {
      setIsEditing(true);
      setEditFormData({ ...booking });
    }
  }, [searchParams, isCreator, booking]);

  const loadBooking = async () => {
    try {
      dispatch(showLoading());
      const data = await tennisBookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to load booking");
        }
      }
    } finally {
      dispatch(hideLoading());
    }
  };

  const loadRequests = async () => {
    try {
      const data = await tennisBookingService.getBookingRequests(bookingId);
      setRequests(data);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to load requests");
        }
      }
    }
  };

  const handleJoinBooking = async () => {
    try {
      await tennisBookingService.joinBooking(bookingId);
      toast.success("Successfully joined booking");
      loadBooking();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to join booking");
        }
      }
    }
  };

  const handleLeaveBooking = async () => {
    try {
      await tennisBookingService.leaveBooking(bookingId);
      toast.success("Successfully left booking");
      loadBooking();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to leave booking");
        }
      }
    }
  };

  const handleRequestToJoin = async () => {
    if (!requestMessage.trim()) {
      toast.error("Please enter the request message");
      return;
    }

    try {
      const dto: CreateBookingRequestDto = {
        bookingId,
        message: requestMessage
      };
      await tennisBookingService.requestToJoin(bookingId, dto);
      toast.success("Request sent successfully");
      setIsRequestDialogOpen(false);
      setRequestMessage("");
      loadRequests();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to send request");
        }
      }
    }
  };

  const handleRespondToRequest = async (status: RequestStatus) => {
    try {
      const dto: RespondToRequestDto = {
        status,
        responseMessage: responseMessage.trim() || undefined
      };
      await tennisBookingService.respondToRequest(selectedRequest!.id, dto);
      toast.success(status === RequestStatus.Accepted ? "Request accepted" : "Request rejected");
      setIsResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage("");
      loadRequests();
      loadBooking();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to respond to request");
        }
      }
    }
  };

  const handleDeleteBooking = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await tennisBookingService.deleteBooking(bookingId);
      toast.success("Booking deleted successfully");
      router.push("/bookings");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to delete booking");
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canJoin = !isCreator && !isParticipant && (booking?.currentParticipants ?? 0) < (booking?.maxParticipants ?? 0);

  const handleEditInputChange = (field: keyof CreateBookingDto, value: string | number | boolean | undefined) => {
    setEditFormData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    try {
      dispatch(showLoading());
      await tennisBookingService.updateBooking(bookingId, editFormData);
      toast.success("Booking updated successfully!");
      setIsEditing(false);
      loadBooking();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to update the booking, please try again");
        }
      }
    } finally {
      dispatch(hideLoading());
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/bookings" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Booking Hall
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{booking.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getBookingStatusColor(booking.status)}>
                  {getBookingStatusLabel(booking.status)}
                </Badge>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {getBookingTypeLabel(booking.type)}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {isCreator && (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditFormData({...booking}) }} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeleteBooking} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              {canJoin && (
                <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" onClick={handleJoinBooking}>
                  Join Booking
                </Button>
              )}
              {isParticipant && !isCreator && (
                <Button variant="outline" onClick={handleLeaveBooking} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Leave Booking
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Edit Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Booking Title *</Label>
                        <Input
                          id="title"
                          value={editFormData?.title || ""}
                          onChange={(e) => handleEditInputChange("title", e.target.value)}
                          placeholder="e.g. Weekend leisure booking"
                          required
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Booking Description *</Label>
                        <Textarea
                          id="description"
                          value={editFormData?.description || ""}
                          onChange={(e) => handleEditInputChange("description", e.target.value)}
                          placeholder="Detailed description of the booking content, requirements, etc."
                          rows={3}
                          required
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Booking Type</Label>
                          <Select value={editFormData?.type?.toString() || ""} onValueChange={(value) => handleEditInputChange("type", parseInt(value))}>
                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                              <SelectItem value="1">Casual Booking</SelectItem>
                              <SelectItem value="2">Training</SelectItem>
                              <SelectItem value="3">Competition</SelectItem>
                              <SelectItem value="4">Doubles</SelectItem>
                              <SelectItem value="5">Singles</SelectItem>
                              <SelectItem value="6">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="maxParticipants" className="text-gray-700 dark:text-gray-300">Max Participants</Label>
                          <Input
                            id="maxParticipants"
                            type="number"
                            min="1"
                            max="20"
                            value={editFormData?.maxParticipants || 1}
                            onChange={(e) => handleEditInputChange("maxParticipants", parseInt(e.target.value))}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Time and Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
                        <Calendar className="w-5 h-5 mr-2" />
                        Time and Location
                      </h3>
                      <div>
                        <Label htmlFor="bookingTime" className="text-gray-700 dark:text-gray-300">Booking Time *</Label>
                        <Input
                          id="bookingTime"
                          type="datetime-local"
                          value={editFormData?.bookingTime ? editFormData.bookingTime.slice(0, 16) : ""}
                          onChange={(e) => handleEditInputChange("bookingTime", e.target.value)}
                          required
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location *</Label>
                        <Input
                          id="location"
                          value={editFormData?.location || ""}
                          onChange={(e) => handleEditInputChange("location", e.target.value)}
                          placeholder="e.g. City Sports Center Tennis Court"
                          required
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latitude" className="text-gray-700 dark:text-gray-300">Latitude (optional)</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={editFormData?.latitude ?? ""}
                            onChange={(e) => handleEditInputChange("latitude", e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="e.g. 39.9042"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude" className="text-gray-700 dark:text-gray-300">Longitude (optional)</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={editFormData?.longitude ?? ""}
                            onChange={(e) => handleEditInputChange("longitude", e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="e.g. 116.4074"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Skill Requirements */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
                        <Users className="w-5 h-5 mr-2" />
                        Skill Requirements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minSkillLevel" className="text-gray-700 dark:text-gray-300">Min Skill Level</Label>
                          <Select value={editFormData?.minSkillLevel?.toString() || ""} onValueChange={(value) => handleEditInputChange("minSkillLevel", parseInt(value))}>
                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                              <SelectItem value="1">Beginner</SelectItem>
                              <SelectItem value="2">Intermediate</SelectItem>
                              <SelectItem value="3">Advanced</SelectItem>
                              <SelectItem value="4">Professional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="maxSkillLevel" className="text-gray-700 dark:text-gray-300">Max Skill Level</Label>
                          <Select value={editFormData?.maxSkillLevel?.toString() || ""} onValueChange={(value) => handleEditInputChange("maxSkillLevel", parseInt(value))}>
                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                              <SelectItem value="1">Beginner</SelectItem>
                              <SelectItem value="2">Intermediate</SelectItem>
                              <SelectItem value="3">Advanced</SelectItem>
                              <SelectItem value="4">Professional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    {/* Additional Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
                        <Clock className="w-5 h-5 mr-2" />
                        Additional Options
                      </h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isFlexible"
                          checked={!!editFormData?.isFlexible}
                          onChange={(e) => handleEditInputChange("isFlexible", e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                        <Label htmlFor="isFlexible" className="text-gray-700 dark:text-gray-300">Flexible Time</Label>
                      </div>
                      {editFormData?.isFlexible && (
                        <div>
                          <Label htmlFor="preferredTimeSlots" className="text-gray-700 dark:text-gray-300">Preferred Time Slots</Label>
                          <Input
                            id="preferredTimeSlots"
                            value={editFormData?.preferredTimeSlots || ""}
                            onChange={(e) => handleEditInputChange("preferredTimeSlots", e.target.value)}
                            placeholder="e.g. Weekend morning or afternoon"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="contactInfo" className="text-gray-700 dark:text-gray-300">Contact Info</Label>
                        <Input
                          id="contactInfo"
                          value={editFormData?.contactInfo || ""}
                          onChange={(e) => handleEditInputChange("contactInfo", e.target.value)}
                          placeholder="e.g. WeChat, phone, etc."
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="additionalNotes" className="text-gray-700 dark:text-gray-300">Notes</Label>
                        <Textarea
                          id="additionalNotes"
                          value={editFormData?.additionalNotes || ""}
                          onChange={(e) => handleEditInputChange("additionalNotes", e.target.value)}
                          placeholder="Additional information"
                          rows={2}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                    </div>
                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                      <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">Save</Button>
                      <Button type="button" variant="outline" className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Description */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{booking.description}</p>
                  </CardContent>
                </Card>

                {/* Time and Location */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Time and Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-5 h-5 mr-3" />
                      <span>{formatDate(booking.bookingTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-5 h-5 mr-3" />
                      <span>{booking.location}</span>
                    </div>
                    {booking.isFlexible && booking.preferredTimeSlots && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Time flexible, preference: {booking.preferredTimeSlots}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Users className="w-5 h-5 mr-2" />
                      Participants ({booking.currentParticipants}/{booking.maxParticipants})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{booking.creator.userName}</span>
                          <Badge variant="outline" className="ml-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Creator</Badge>
                        </div>
                      </div>
                      {booking.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{participant.user.userName}</span>
                            <Badge variant="outline" className="ml-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                              {participant.status === 1 ? "Pending" : "Confirmed"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Requests */}
                {isCreator && requests.length > 0 && (
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Request List ({requests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {requests.map((request) => (
                          <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">{request.requester.userName}</span>
                              <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                {request.status === 1 ? "Pending" : 
                                 request.status === 2 ? "Accepted" : 
                                 request.status === 3 ? "Rejected" : "Cancelled"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">{request.message}</p>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Request time: {formatDate(request.requestedAt)}
                            </div>
                            {request.status === 1 && (
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsResponseDialogOpen(true);
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsResponseDialogOpen(true);
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Skill Requirement</Label>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className={getSkillLevelColor(booking.minSkillLevel)}>
                      {getSkillLevelLabel(booking.minSkillLevel)}
                    </Badge>
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                    <Badge variant="outline" className={getSkillLevelColor(booking.maxSkillLevel)}>
                      {getSkillLevelLabel(booking.maxSkillLevel)}
                    </Badge>
                  </div>
                </div>
                <Separator className="bg-gray-200 dark:bg-gray-600" />
                <div>
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Contact Information</Label>
                  {booking.contactInfo ? (
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{booking.contactInfo}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Not provided</p>
                  )}
                </div>
                {booking.additionalNotes && (
                  <>
                    <Separator className="bg-gray-200 dark:bg-gray-600" />
                    <div>
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Notes</Label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{booking.additionalNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!isCreator && !isParticipant && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canJoin ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" onClick={handleJoinBooking}>
                      Join Booking
                    </Button>
                  ) : (
                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Request to Join
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-white">Request to Join Booking</DialogTitle>
                          <DialogDescription className="text-gray-600 dark:text-gray-300">
                            Please enter the request message to let the creator know about your situation
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="requestMessage" className="text-gray-700 dark:text-gray-300">Request Message</Label>
                            <Textarea
                              id="requestMessage"
                              value={requestMessage}
                              onChange={(e) => setRequestMessage(e.target.value)}
                              placeholder="Introduce your skill level, reason for joining, etc."
                              rows={4}
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleRequestToJoin} className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
                              Send Request
                            </Button>
                            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Respond to Request</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Respond to {selectedRequest?.requester.userName} request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="responseMessage" className="text-gray-700 dark:text-gray-300">Response Message (Optional)</Label>
                <Textarea
                  id="responseMessage"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Optional: Add a response message"
                  rows={3}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleRespondToRequest(RequestStatus.Accepted)} 
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                >
                  Accept Request
                </Button>
                <Button 
                  onClick={() => handleRespondToRequest(RequestStatus.Rejected)} 
                  variant="outline" 
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 