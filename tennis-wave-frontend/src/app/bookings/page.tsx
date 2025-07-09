"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Plus, Search, Filter, Map, List } from "lucide-react";
import { tennisBookingService } from "@/services/tennisBookingService";
import { 
  TennisBooking, 
  SearchBookingDto,
  TennisBookingSearchResultDto,
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
import AdvancedSearchFilter from "@/components/bookings/AdvancedSearchFilter";
import { format } from "date-fns";

export default function BookingsPage() {
  const [searchResult, setSearchResult] = useState<TennisBookingSearchResultDto | null>(null);
  const [bookings, setBookings] = useState<TennisBooking[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [statistics, setStatistics] = useState<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    loadBookings();
    loadStatistics();
  }, []);

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

  const loadStatistics = async () => {
    try {
      const stats = await tennisBookingService.getBookingStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const handleSearch = async (searchDto: SearchBookingDto) => {
    try {
      dispatch(showLoading());
      const result = await tennisBookingService.searchBookings(searchDto);
      setSearchResult(result);
      setBookings(result.items);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error("Search failed");
        }
      }
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleReset = () => {
    setSearchResult(null);
    loadBookings();
  };

  const handlePageChange = async (page: number) => {
    if (searchResult) {
      const newSearchDto = {
        ...searchResult,
        page
      };
      await handleSearch(newSearchDto);
    }
  };

  const displayBookings = searchResult ? searchResult.items : bookings;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tennis Bookings</h1>
              <p className="text-gray-600 mt-2">Find and join tennis games in your area</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-lg border p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
              
              <Link href="/bookings/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Booking
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <AdvancedSearchFilter 
          onSearch={handleSearch}
          onReset={handleReset}
          statistics={statistics}
        />

        {/* Results Summary */}
        {searchResult && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold">{searchResult.totalCount}</span> bookings
                  {searchResult.page > 1 && ` (page ${searchResult.page} of ${searchResult.totalPages})`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {searchResult.hasPreviousPage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(searchResult.page - 1)}
                  >
                    Previous
                  </Button>
                )}
                {searchResult.hasNextPage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(searchResult.page + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Grid */}
        {viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{booking.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {booking.description.length > 100 
                          ? `${booking.description.substring(0, 100)}...` 
                          : booking.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Time and Location */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' HH:mm")}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {booking.location}
                    </div>
                    
                    {/* Participants */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {booking.currentParticipants}/{booking.maxParticipants} participants
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {getBookingTypeLabel(booking.type)}
                      </Badge>
                                             <Badge variant={getBookingStatusColor(booking.status) as "default" | "destructive" | "outline" | "secondary"}>
                         {getBookingStatusLabel(booking.status)}
                       </Badge>
                      <Badge variant="outline">
                        {getSkillLevelLabel(booking.minSkillLevel)} - {getSkillLevelLabel(booking.maxSkillLevel)}
                      </Badge>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {booking.creator.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {booking.creator.userName}
                        </span>
                      </div>
                      <Link href={`/bookings/${booking.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Map className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
            <p className="text-gray-600 mb-4">
              Map view will be available soon with Google Maps integration
            </p>
            <Button variant="outline" onClick={() => setViewMode("list")}>
              Switch to List View
            </Button>
          </div>
        )}

        {/* Empty State */}
        {displayBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or create a new booking
            </p>
            <Link href="/bookings/create">
              <Button>Create Your First Booking</Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {searchResult && searchResult.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              {searchResult.hasPreviousPage && (
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(searchResult.page - 1)}
                >
                  Previous
                </Button>
              )}
              
              <span className="text-sm text-gray-600">
                Page {searchResult.page} of {searchResult.totalPages}
              </span>
              
              {searchResult.hasNextPage && (
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(searchResult.page + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}