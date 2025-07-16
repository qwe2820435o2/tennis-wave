"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Users, Clock } from "lucide-react";
import { tennisBookingService } from "@/services/tennisBookingService";
import { CreateBookingDto, BookingType, SkillLevel } from "@/types/tennisBooking";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Link from "next/link";

export default function CreateBookingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<CreateBookingDto>({
    title: "",
    description: "",
    bookingTime: "",
    location: "",
    latitude: undefined,
    longitude: undefined,
    type: BookingType.Casual,
    minSkillLevel: SkillLevel.Beginner,
    maxSkillLevel: SkillLevel.Intermediate,
    maxParticipants: 2,
    isFlexible: true,
    preferredTimeSlots: "",
    contactInfo: "",
    additionalNotes: ""
  });

  const handleInputChange = (field: keyof CreateBookingDto, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter the title of the booking");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter the description of the booking");
      return;
    }
    if (!formData.bookingTime) {
      toast.error("Please select the booking time");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Please enter the location of the booking");
      return;
    }
    if (formData.maxParticipants < 1) {
      toast.error("The number of participants must be at least 1");
      return;
    }
    if (formData.minSkillLevel > formData.maxSkillLevel) {
      toast.error("The minimum skill level cannot be higher than the maximum skill level");
      return;
    }

    try {
      dispatch(showLoading());
      await tennisBookingService.createBooking(formData);
      toast.success("Booking published successfully!");
      router.push("/bookings");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to publish the booking, please try again");
        }
      }
    } finally {
      dispatch(hideLoading());
    }
  };

  const getBookingTypeLabel = (type: BookingType): string => {
    switch (type) {
      case BookingType.Casual: return "Casual Booking";
      case BookingType.Training: return "Training";
      case BookingType.Competition: return "Competition";
      case BookingType.Doubles: return "Doubles";
      case BookingType.Singles: return "Singles";
      case BookingType.Mixed: return "Mixed";
      default: return "Unknown";
    }
  };

  const getSkillLevelLabel = (level: SkillLevel): string => {
    switch (level) {
      case SkillLevel.Beginner: return "Beginner";
      case SkillLevel.Intermediate: return "Intermediate";
      case SkillLevel.Advanced: return "Advanced";
      case SkillLevel.Professional: return "Professional";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/bookings" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking Hall
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Publish Booking</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create a new tennis booking, invite friends to join</p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Booking Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Fill in the details of the booking, so other players can understand your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="create-booking-form">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-200">Booking Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Weekend leisure booking"
                    required
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">Booking Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Detailed description of the booking content, requirements, etc."
                    rows={3}
                    required
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-gray-700 dark:text-gray-200">Booking Type</Label>
                    <Select value={formData.type.toString()} onValueChange={(value) => handleInputChange("type", parseInt(value))}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <SelectItem value={BookingType.Casual.toString()}>{getBookingTypeLabel(BookingType.Casual)}</SelectItem>
                        <SelectItem value={BookingType.Training.toString()}>{getBookingTypeLabel(BookingType.Training)}</SelectItem>
                        <SelectItem value={BookingType.Competition.toString()}>{getBookingTypeLabel(BookingType.Competition)}</SelectItem>
                        <SelectItem value={BookingType.Doubles.toString()}>{getBookingTypeLabel(BookingType.Doubles)}</SelectItem>
                        <SelectItem value={BookingType.Singles.toString()}>{getBookingTypeLabel(BookingType.Singles)}</SelectItem>
                        <SelectItem value={BookingType.Mixed.toString()}>{getBookingTypeLabel(BookingType.Mixed)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants" className="text-gray-700 dark:text-gray-200">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value))}
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
                  <Label htmlFor="bookingTime" className="text-gray-700 dark:text-gray-200">Booking Time *</Label>
                  <Input
                    id="bookingTime"
                    type="datetime-local"
                    value={formData.bookingTime}
                    onChange={(e) => handleInputChange("bookingTime", e.target.value)}
                    required
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700 dark:text-gray-200">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g. City Sports Center Tennis Court"
                    required
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-gray-700 dark:text-gray-200">Latitude (optional)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ""}
                      onChange={(e) => handleInputChange("latitude", e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 39.9042"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-gray-700 dark:text-gray-200">Longitude (optional)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ""}
                      onChange={(e) => handleInputChange("longitude", e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 116.4074"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                    <Label htmlFor="minSkillLevel" className="text-gray-700 dark:text-gray-200">Min Skill Level</Label>
                    <Select value={formData.minSkillLevel.toString()} onValueChange={(value) => handleInputChange("minSkillLevel", parseInt(value))}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <SelectItem value={SkillLevel.Beginner.toString()}>{getSkillLevelLabel(SkillLevel.Beginner)}</SelectItem>
                        <SelectItem value={SkillLevel.Intermediate.toString()}>{getSkillLevelLabel(SkillLevel.Intermediate)}</SelectItem>
                        <SelectItem value={SkillLevel.Advanced.toString()}>{getSkillLevelLabel(SkillLevel.Advanced)}</SelectItem>
                        <SelectItem value={SkillLevel.Professional.toString()}>{getSkillLevelLabel(SkillLevel.Professional)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxSkillLevel" className="text-gray-700 dark:text-gray-200">Max Skill Level</Label>
                    <Select value={formData.maxSkillLevel.toString()} onValueChange={(value) => handleInputChange("maxSkillLevel", parseInt(value))}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <SelectItem value={SkillLevel.Beginner.toString()}>{getSkillLevelLabel(SkillLevel.Beginner)}</SelectItem>
                        <SelectItem value={SkillLevel.Intermediate.toString()}>{getSkillLevelLabel(SkillLevel.Intermediate)}</SelectItem>
                        <SelectItem value={SkillLevel.Advanced.toString()}>{getSkillLevelLabel(SkillLevel.Advanced)}</SelectItem>
                        <SelectItem value={SkillLevel.Professional.toString()}>{getSkillLevelLabel(SkillLevel.Professional)}</SelectItem>
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
                    checked={formData.isFlexible}
                    onChange={(e) => handleInputChange("isFlexible", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600"
                  />
                  <Label htmlFor="isFlexible" className="text-gray-700 dark:text-gray-200">Flexible Time</Label>
                </div>

                {formData.isFlexible && (
                  <div>
                    <Label htmlFor="preferredTimeSlots" className="text-gray-700 dark:text-gray-200">Preferred Time Slots</Label>
                    <Input
                      id="preferredTimeSlots"
                      value={formData.preferredTimeSlots}
                      onChange={(e) => handleInputChange("preferredTimeSlots", e.target.value)}
                      placeholder="e.g. Weekend morning or afternoon"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="contactInfo" className="text-gray-700 dark:text-gray-200">Contact Info</Label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                    placeholder="e.g. WeChat, phone, etc."
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes" className="text-gray-700 dark:text-gray-200">Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                    placeholder="Additional information"
                    rows={2}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
                  Publish Booking
                </Button>
                <Link href="/bookings" className="flex-1">
                  <Button type="button" variant="outline" className="w-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 