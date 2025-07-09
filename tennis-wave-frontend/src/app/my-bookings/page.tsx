"use client";

import { useEffect, useState } from "react";
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

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<TennisBooking[]>([]);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (user.isHydrated && user.userId) {
            loadBookings();
        }
    }, [user.isHydrated, user.userId]);

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
            setBookings(data);
        } catch (error) {
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
        } catch (error) {
            console.error("Failed to delete booking:", error);
            toast.error("Failed to delete booking");
        }
    };

    // Separate bookings by creator and participant
    const createdBookings = bookings.filter(booking => booking.creatorId === user.userId);
    const participatedBookings: TennisBooking[] = [];

    // Find bookings where user is a participant but not the creator
    bookings.forEach(booking => {
        if (booking.creatorId !== user.userId && 
            booking.participants.some(p => p.userId === user.userId)) {
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
                                onClick={() => router.push(`/bookings/${booking.id}`)}
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                <p className="text-gray-600">Manage your tennis bookings and participation</p>
            </div>

            {/* Statistics */}
            {/* Removed statistics as it's not directly tied to user's bookings */}

            {/* Created Bookings */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Created Bookings</h2>
                {createdBookings.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-gray-500">
                                <p>You have not created any bookings yet.</p>
                                <Button
                                    onClick={() => router.push("/bookings/create")}
                                    className="mt-2"
                                >
                                    Create Your First Booking
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {createdBookings.map(booking => renderBookingCard(booking, true))}
                    </div>
                )}
            </div>

            {/* Participated Bookings */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Participated Bookings</h2>
                {participatedBookings.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-gray-500">
                                <p>You have not joined any bookings yet.</p>
                                <Button
                                    onClick={() => router.push("/bookings")}
                                    className="mt-2"
                                >
                                    Browse Available Bookings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {participatedBookings.map(booking => renderBookingCard(booking, false))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {pendingDeleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this booking? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setPendingDeleteId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
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