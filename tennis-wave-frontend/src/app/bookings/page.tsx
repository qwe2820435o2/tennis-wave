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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-500 rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Tennis Bookings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Find and join tennis games in your area</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-green-600 dark:bg-green-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className={viewMode === "map" ? "bg-green-600 dark:bg-green-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
              <Link href="/bookings/create">
                <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg shadow font-bold text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Booking
                </Button>
              </Link>
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
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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
                      className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                  )}
                  {searchResult.hasNextPage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(searchResult.page + 1)}
                      className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
            <div className="grid grid-cols-1 gap-6">
              {displayBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-600 dark:hover:border-green-500 rounded-2xl bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-green-700 dark:text-green-400">{booking.title}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-300">
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
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' HH:mm")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.location}
                      </div>
                      
                      {/* Participants */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2" />
                        {booking.currentParticipants}/{booking.maxParticipants} participants
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {getBookingTypeLabel(booking.type)}
                        </Badge>
                        <Badge variant={getBookingStatusColor(booking.status) as "default" | "destructive" | "outline" | "secondary"}>
                          {getBookingStatusLabel(booking.status)}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {getSkillLevelLabel(booking.minSkillLevel)} - {getSkillLevelLabel(booking.maxSkillLevel)}
                        </Badge>
                      </div>

                      {/* Creator */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {booking.creator.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            {booking.creator.userName}
                          </span>
                        </div>
                        <Link href={`/bookings/${booking.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {displayBookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500">
                  <div className="mb-4">
                    <Search className="w-12 h-12 mx-auto text-green-200 dark:text-green-700" />
                  </div>
                  <div className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-300">No bookings found</div>
                  <div className="text-sm mb-4 text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new booking</div>
                  <Link href="/bookings/create">
                    <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg shadow font-bold text-white">Create Your First Booking</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400 dark:text-gray-500">Map view coming soon...</div>
          )}
        </div>
      </div>
    </div>
  );
}