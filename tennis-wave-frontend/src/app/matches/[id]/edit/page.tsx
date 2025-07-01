"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tennisMatchService } from "@/services/tennisMatchService";
import { CreateMatchDto } from "@/types/tennisMatch";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function EditMatchPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const matchId = Number(params.id);

    // Form state for editing match
    const [formData, setFormData] = useState<Partial<CreateMatchDto>>({
        title: "",
        description: "",
        location: "",
        matchTime: "",
        maxParticipants: 4,
        skillLevel: "Intermediate",
        matchType: "Doubles"
    });
    const [loading, setLoading] = useState(true);

    // Load match data by id
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                dispatch(showLoading());
                const match = await tennisMatchService.getMatchById(matchId);
                setFormData({
                    title: match.title,
                    description: match.description,
                    location: match.location,
                    matchTime: match.matchTime,
                    maxParticipants: match.maxParticipants,
                    skillLevel: match.skillLevel,
                    matchType: match.matchType
                });
            } catch {
                toast.error("Failed to load match data");
                router.push("/matches");
            } finally {
                setLoading(false);
                dispatch(hideLoading());
            }
        };
        if (matchId) fetchMatch();
    }, [matchId, dispatch, router]);

    // Handle form input changes
    const handleInputChange = (field: keyof CreateMatchDto, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation
        if (!formData.title || !formData.description || !formData.location || !formData.matchTime) {
            toast.error("Please fill in all required fields");
            return;
        }
        try {
            dispatch(showLoading());
            await tennisMatchService.updateMatch(matchId, formData);
            toast.success("Match updated successfully!");
            router.push(`/matches/${matchId}`);
        } catch {
            toast.error("Failed to update match");
        } finally {
            dispatch(hideLoading());
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Edit Match</CardTitle>
                        <CardDescription>
                            Update your tennis match information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Match Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={e => handleInputChange("title", e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={e => handleInputChange("description", e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={e => handleInputChange("location", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Date and Time */}
                            <div>
                                <Label htmlFor="matchTime">Match Date & Time *</Label>
                                <Input
                                    id="matchTime"
                                    type="datetime-local"
                                    value={formData.matchTime?.slice(0, 16) || ""}
                                    onChange={e => handleInputChange("matchTime", e.target.value)}
                                    required
                                />
                            </div>
                            {/* Match Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="skillLevel">Skill Level</Label>
                                    <Select
                                        value={formData.skillLevel}
                                        onValueChange={value => handleInputChange("skillLevel", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                            <SelectItem value="Professional">Professional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="matchType">Match Type</Label>
                                    <Select
                                        value={formData.matchType}
                                        onValueChange={value => handleInputChange("matchType", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Singles">Singles</SelectItem>
                                            <SelectItem value="Doubles">Doubles</SelectItem>
                                            <SelectItem value="Mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="maxParticipants">Max Participants</Label>
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        min={2}
                                        max={16}
                                        value={formData.maxParticipants}
                                        onChange={e => handleInputChange("maxParticipants", Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
                                    Save Changes
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}