// src/app/my-matches/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Edit, Trash2, Eye } from "lucide-react";
import { tennisMatchService } from "@/services/tennisMatchService";
import { TennisMatch } from "@/types/tennisMatch";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { RootState } from "@/store";
import { toast } from "sonner";
import {AxiosError} from "axios";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";

export default function MyMatchesPage() {
    const [matches, setMatches] = useState<TennisMatch[]>([]);
    const [activeTab, setActiveTab] = useState("organized");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        loadMatches();
    }, []);

    // open Dialog
    const openDeleteDialog = (matchId: number) => {
        setPendingDeleteId(matchId);
        setDeleteDialogOpen(true);
    };

    // delte
    const confirmDelete = async () => {
        if (pendingDeleteId == null) return;
        await handleDeleteMatch(pendingDeleteId);
        setDeleteDialogOpen(false);
        setPendingDeleteId(null);
    };

    const loadMatches = async () => {
        try {
            dispatch(showLoading());
            const data = await tennisMatchService.getUserMatches();
            setMatches(data);
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to load matches");
                }
            }
        }finally {
            dispatch(hideLoading());
        }
    };

    const handleDeleteMatch = async (matchId: number) => {
        try {
            dispatch(showLoading());
            await tennisMatchService.deleteMatch(matchId);
            toast.success("Match deleted successfully");
            loadMatches();
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

    const organizedMatches = matches.filter(match => match.creatorId === user.userId);
    const participatedMatches: TennisMatch[] = [];

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
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderMatchCard = (match: TennisMatch, isOrganizer: boolean = false) => (
        <Card key={match.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{match.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className={getSkillLevelColor(match.skillLevel)}>
                                {match.skillLevel}
                            </Badge>
                            <Badge variant="outline">{match.matchType}</Badge>
                            {isOrganizer && (
                                <Badge className="bg-blue-100 text-blue-800">Organizer</Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/matches/${match.id}`}>
                            <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </Link>
                        {isOrganizer && (
                            <>
                                <Link href={`/matches/${match.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteDialog(match.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <CardDescription className="line-clamp-2">
                    {match.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {match.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(match.matchTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {match.currentParticipants}/{match.maxParticipants} participants
                    </div>
                </div>
            </CardContent>

        </Card>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
                                <p className="text-gray-600 mt-2">Manage your organized and participated matches</p>
                            </div>
                            <Link href="/matches/create">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    Create New Match
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="organized">
                                Organized ({organizedMatches.length})
                            </TabsTrigger>
                            <TabsTrigger value="participated">
                                Participated ({participatedMatches.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="organized" className="space-y-6">
                            {organizedMatches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {organizedMatches.map(match => renderMatchCard(match, true))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">You have not organized any matches yet</p>
                                    <p className="text-gray-400 mt-2">Create your first match to get started</p>
                                    <Link href="/matches/create" className="mt-4 inline-block">
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            Create Match
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="participated" className="space-y-6">
                            {participatedMatches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {participatedMatches.map(match => renderMatchCard(match, false))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">You have not joined any matches yet</p>
                                    <p className="text-gray-400 mt-2">Browse available matches to join</p>
                                    <Link href="/matches" className="mt-4 inline-block">
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            Browse Matches
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
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
        </>
    );
}