"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Plus, Search, Filter } from "lucide-react";
import { tennisBookingService } from "@/services/tennisBookingService";
import { 
  TennisBooking, 
  getBookingTypeLabel,
  getBookingStatusLabel, 
  getBookingStatusColor,
  getSkillLevelLabel,
  getSkillLevelColor
} from "@/types/tennisBooking";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<TennisBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<TennisBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const dispatch = useDispatch();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, typeFilter, statusFilter, skillFilter]);

  const loadBookings = async () => {
    try {
      dispatch(showLoading());
      const data = await tennisBookingService.getAvailableBookings();
      setBookings(data);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to load bookings");
        }
      }
    } finally {
      dispatch(hideLoading());
    }
  };

  const filterBookings = () => {
    const filtered = bookings.filter(booking => {
      const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || booking.type.toString() === typeFilter;
      const matchesStatus = statusFilter === "all" || booking.status.toString() === statusFilter;
      const matchesSkill = skillFilter === "all" || 
        booking.minSkillLevel.toString() === skillFilter || 
        booking.maxSkillLevel.toString() === skillFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesSkill;
    });
    setFilteredBookings(filtered);
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

  const handleJoinBooking = async (bookingId: number) => {
    try {
      await tennisBookingService.joinBooking(bookingId);
      toast.success("Successfully joined booking");
      loadBookings(); // Reload to update participant count
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Failed to join booking");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Hall</h1>
              <p className="text-gray-600 mt-2">Discover and join nearby tennis bookings</p>
            </div>
            <Link href="/bookings/create">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Publish Booking
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter Conditions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Booking Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="1">Casual Booking</SelectItem>
                <SelectItem value="2">Special Training</SelectItem>
                <SelectItem value="3">Official Match</SelectItem>
                <SelectItem value="4">Doubles</SelectItem>
                <SelectItem value="5">Singles</SelectItem>
                <SelectItem value="6">Mixed Doubles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="1">Pending Confirmation</SelectItem>
                <SelectItem value="2">Confirmed</SelectItem>
                <SelectItem value="3">In Progress</SelectItem>
                <SelectItem value="4">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Beginner</SelectItem>
                <SelectItem value="2">Intermediate</SelectItem>
                <SelectItem value="3">Advanced</SelectItem>
                <SelectItem value="4">Professional</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setStatusFilter("all");
                setSkillFilter("all");
              }}
            >
              Clear Filter
            </Button>
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{booking.title}</CardTitle>
                  <Badge className={getBookingStatusColor(booking.status)}>
                    {getBookingStatusLabel(booking.status)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {booking.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{booking.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(booking.bookingTime)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {booking.currentParticipants}/{booking.maxParticipants} people
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {getBookingTypeLabel(booking.type)}
                      </Badge>
                      <Badge variant="outline" className={getSkillLevelColor(booking.minSkillLevel)}>
                        {getSkillLevelLabel(booking.minSkillLevel)}-{getSkillLevelLabel(booking.maxSkillLevel)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-500">
                      Creator: {booking.creator.userName}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                      {booking.currentParticipants < booking.maxParticipants && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleJoinBooking(booking.id)}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No booking information</p>
            <p className="text-gray-400 mt-2">Try adjusting the filter conditions or publish a new booking</p>
            <Link href="/bookings/create" className="mt-4 inline-block">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Publish Booking
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 