// src/app/matches/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { tennisMatchService } from "@/services/tennisMatchService";
import { CreateMatchDto } from "@/types/tennisMatch";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { toast } from "sonner";
import {AxiosError} from "axios";

export default function CreateMatchPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<CreateMatchDto>({
        title: "",
        description: "",
        location: "",
        matchTime: "",
        maxParticipants: 4,
        skillLevel: "Intermediate",
        matchType: "Doubles"
    });

    const handleInputChange = (field: keyof CreateMatchDto, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.description || !formData.location ||
            !formData.matchTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            dispatch(showLoading());
            await tennisMatchService.createMatch(formData);
            toast.success("Match created successfully!");
            router.push("/matches");
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create New Match</CardTitle>
                        <CardDescription>
                            Organize a tennis match and invite players to join
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
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        placeholder="Enter match title"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        placeholder="Describe your match"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        placeholder="Enter court location"
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
                                    value={formData.matchTime}
                                    onChange={(e) => handleInputChange("matchTime", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Match Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="skillLevel">Skill Level</Label>
                                    <Select
                                        value={formData.skillLevel}
                                        onValueChange={(value) => handleInputChange("skillLevel", value)}
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
                                        onValueChange={(value) => handleInputChange("matchType", value)}
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
                                    <Select
                                        value={formData.maxParticipants.toString()}
                                        onValueChange={(value) => {
                                            const numValue = parseInt(value);
                                            if (!isNaN(numValue)) {
                                                handleInputChange("maxParticipants", numValue);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 (Singles)</SelectItem>
                                            <SelectItem value="4">4 (Doubles)</SelectItem>
                                            <SelectItem value="6">6 (Multiple Games)</SelectItem>
                                            <SelectItem value="8">8 (Tournament Style)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>



                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                >
                                    Create Match
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                >
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