// src/app/matches/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { tennisMatchService } from "@/services/tennisMatchService";
import { TennisMatch } from "@/types/tennisMatch";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { RootState } from "@/store";
import { toast } from "sonner";
import {AxiosError} from "axios";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";

export default function MatchDetailPage() {
    const [match, setMatch] = useState<TennisMatch | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const matchId = Number(params.id);

    useEffect(() => {
        if (matchId) {
            loadMatch();
        }
    }, [matchId]);

    const loadMatch = async () => {
        try {
            dispatch(showLoading());
            const data = await tennisMatchService.getMatchById(matchId);
            setMatch(data);
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to load match details");
                    router.push("/matches");
                }
            }
        }finally {
            dispatch(hideLoading());
        }
    };

    const handleJoinMatch = async () => {
        if (!user.userId) {
            toast.error("Please log in to join matches");
            return;
        }

        try {
            setIsJoining(true);
            await tennisMatchService.joinMatch({ matchId });
            toast.success("Successfully joined the match!");
            loadMatch(); // Reload to update participant count
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to join match");
                }
            }
        }finally {
            setIsJoining(false);
        }
    };

    const openDeleteDialog = () => setDeleteDialogOpen(true);

    const confirmDelete = async () => {
        await handleDeleteMatch();
        setDeleteDialogOpen(false);
    };

    const handleDeleteMatch = async () => {
        try {
            dispatch(showLoading());
            await tennisMatchService.deleteMatch(matchId);
            toast.success("Match deleted successfully");
            router.push("/my-matches");
        } catch(error: unknown) {
            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to delete match");
                }
            }
        } finally {
            dispatch(hideLoading());
        }
    };

    const isOrganizer = match?.creatorId === user.userId;
    const isParticipant = false; // TODO: Implement participant check when backend supports it
    const canJoin = !isOrganizer && !isParticipant && match && match.currentParticipants < match.maxParticipants;

    if (!match) {
        return null;
    }

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-orange-100 text-orange-800';
            case 'Professional': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/matches")}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Matches
                </Button>

                {/* Match Details */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl mb-2">{match.title}</CardTitle>
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className={getSkillLevelColor(match.skillLevel)}>
                                        {match.skillLevel}
                                    </Badge>
                                    <Badge variant="outline">{match.matchType}</Badge>
                                </div>
                            </div>
                            {isOrganizer && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/matches/${matchId}/edit`)}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={openDeleteDialog}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        <CardDescription className="text-lg">
                            {match.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="text-gray-700">{match.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="text-gray-700">{formatDate(match.matchTime)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="text-gray-700">
                                        {match.currentParticipants}/{match.maxParticipants} participants
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            {canJoin && (
                                <Button
                                    onClick={handleJoinMatch}
                                    disabled={isJoining}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isJoining ? "Joining..." : "Join Match"}
                                </Button>
                            )}
                            {isParticipant && (
                                <Badge className="bg-green-100 text-green-800">
                                    You are participating
                                </Badge>
                            )}
                            {isOrganizer && (
                                <Badge className="bg-blue-100 text-blue-800">
                                    You are the organizer
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Participants */}
                {/*
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Participants ({match.participants.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {match.participants.map((participant) => (
                                <div
                                    key={participant.participantId}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="font-medium">{participant.userName}</span>
                                    </div>
                                    <Badge
                                        variant={participant.status === 'Confirmed' ? 'default' : 'secondary'}
                                    >
                                        {participant.status}
                                    </Badge>
                                </div>
                            ))}
                            {match.participants.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                    No participants yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                */}
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <div>
                        Are you sure you want to delete this match?
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}