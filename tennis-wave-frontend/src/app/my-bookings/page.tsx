"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, Users, MapPin, Calendar, Clock, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { tennisBookingService } from "@/services/tennisBookingService";
import { TennisBooking} from "@/types/tennisBooking";
import { getBookingStatusLabel, getBookingStatusColor, getBookingTypeLabel } from "@/types/tennisBooking";
import type { RootState } from "@/store";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { selectUserId, selectUserName, selectEmail, selectToken, selectIsHydrated } from "@/store/slices/userSlice";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<TennisBooking[]>([]);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const userId = useSelector(selectUserId);
    const userName = useSelector(selectUserName);
    const email = useSelector(selectEmail);
    const token = useSelector(selectToken);
    const isHydrated = useSelector(selectIsHydrated);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isHydrated && userId) {
            loadBookings();
        }
    }, [isHydrated, userId]);

    const openDeleteDialog = (bookingId: number) => {
        setPendingDeleteId(bookingId);
    };

    const confirmDelete = async () => {
        if (pendingDeleteId) {
            await handleDeleteBooking(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    const loadBookings = async () => {
        try {
            dispatch(showLoading());
            const data = await tennisBookingService.getMyBookings();
            // 修复：保证bookings为数组
            const anyData = data as any;
            if (Array.isArray(anyData)) {
                setBookings(anyData);
            } else if (anyData && Array.isArray(anyData.items)) {
                setBookings(anyData.items);
            } else {
                setBookings([]);
            }
        } catch (error: any) {
            if (error.isAuthError) return; // 已全局处理，无需重复toast
            console.error("Failed to load bookings:", error);
            toast.error("Failed to load bookings");
        } finally {
            dispatch(hideLoading());
        }
    };

    const handleDeleteBooking = async (bookingId: number) => {
        try {
            await tennisBookingService.deleteBooking(bookingId);
            toast.success("Booking deleted successfully");
            loadBookings();
        } catch (error: any) {
            if (error.isAuthError) return;
            console.error("Failed to delete booking:", error);
            toast.error("Failed to delete booking");
        }
    };

    // Separate bookings by creator and participant
    const createdBookings = bookings.filter(booking => booking.creatorId === userId);
    const participatedBookings: TennisBooking[] = [];

    // Find bookings where user is a participant but not the creator
    bookings.forEach(booking => {
        if (booking.creatorId !== userId && 
            booking.participants.some(p => p.userId === userId)) {
            participatedBookings.push(booking);
        }
    });

    const renderBookingCard = (booking: TennisBooking, isOrganizer: boolean = false) => (
        <Card key={booking.id} className="mb-4 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            {booking.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                                {getBookingTypeLabel(booking.type)}
                            </Badge>
                            <Badge className={`text-xs ${getBookingStatusColor(booking.status)}`}>
                                {getBookingStatusLabel(booking.status)}
                            </Badge>
                            {isOrganizer && (
                                <Badge variant="secondary" className="text-xs">
                                    Organizer
                                </Badge>
                            )}
                        </div>
                    </div>
                    {isOrganizer && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/bookings/${booking.id}?edit=1`)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(booking.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.bookingTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(booking.bookingTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{booking.currentParticipants}/{booking.maxParticipants} participants</span>
                    </div>
                    {booking.description && (
                        <p className="text-gray-500 mt-2 line-clamp-2">{booking.description}</p>
                    )}
                </div>
                <div className="mt-4 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                        className="flex-1"
                    >
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-500 rounded-2xl shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">My Bookings</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your tennis bookings and participation</p>
                    </div>
                    {/* Created Bookings */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Created Bookings</h2>
                        {createdBookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500">
                                <div className="mb-4">
                                    <span role="img" aria-label="booking" className="text-5xl">📅</span>
                                </div>
                                <div className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-300">You have not created any bookings yet.</div>
                                <div className="text-sm mb-4 text-gray-500 dark:text-gray-400">Start by creating your first booking</div>
                                <Button
                                    onClick={() => router.push("/bookings/create")}
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg shadow font-bold px-6 text-white"
                                >
                                    Create Your First Booking
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {createdBookings.map(booking => (
                                    <Card key={booking.id} className="hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-600 dark:hover:border-green-500 rounded-2xl bg-white dark:bg-gray-800">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-bold text-green-700 dark:text-green-400">
                                                        {booking.title}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                                            {getBookingTypeLabel(booking.type)}
                                                        </Badge>
                                                        <Badge className={`text-xs ${getBookingStatusColor(booking.status)}`}>
                                                            {getBookingStatusLabel(booking.status)}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Organizer</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/bookings/${booking.id}?edit=1`)}
                                                        className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        aria-label="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(booking.id)}
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        aria-label="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{booking.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(booking.bookingTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(booking.bookingTime).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>{booking.currentParticipants}/{booking.maxParticipants} participants</span>
                                                </div>
                                                {booking.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{booking.description}</p>
                                                )}
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/bookings/${booking.id}`)}
                                                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Participated Bookings */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Participated Bookings</h2>
                        {participatedBookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500">
                                <div className="mb-4">
                                    <span role="img" aria-label="booking" className="text-5xl">🎾</span>
                                </div>
                                <div className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-300">You have not joined any bookings yet.</div>
                                <div className="text-sm mb-4 text-gray-500 dark:text-gray-400">Browse available bookings to join</div>
                                <Button
                                    onClick={() => router.push("/bookings")}
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg shadow font-bold px-6 text-white"
                                >
                                    Browse Available Bookings
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {participatedBookings.map(booking => (
                                    <Card key={booking.id} className="hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-600 dark:hover:border-green-500 rounded-2xl bg-white dark:bg-gray-800">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-bold text-green-700 dark:text-green-400">
                                                        {booking.title}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                                            {getBookingTypeLabel(booking.type)}
                                                        </Badge>
                                                        <Badge className={`text-xs ${getBookingStatusColor(booking.status)}`}>
                                                            {getBookingStatusLabel(booking.status)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/bookings/${booking.id}`)}
                                                        className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{booking.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(booking.bookingTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(booking.bookingTime).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>{booking.currentParticipants}/{booking.maxParticipants} participants</span>
                                                </div>
                                                {booking.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{booking.description}</p>
                                                )}
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/bookings/${booking.id}`)}
                                                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            {pendingDeleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this booking? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setPendingDeleteId(null)}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 