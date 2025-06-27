"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    // Fetch user profile on mount
    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getUserProfile();
                setProfile(data);
                setFormData(data);
            } catch {
                toast.error("Failed to load profile");
            }
        }
        fetchProfile();
    }, []);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle save
    const handleSave = async () => {
        setIsLoading(true);
        dispatch(showLoading());
        try {
            const updated = await updateUserProfile(formData);
            setProfile(updated);
            setEditMode(false);
            toast.success("Profile updated successfully");
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
            dispatch(hideLoading());
        }
    };

    if (!profile) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-xl">
                <Card className="border-2 border-green-600 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">My Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-4">
                                <img
                                    src={profile.avatar || "/default-avatar.png"}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-green-400"
                                />
                            </div>
                            {/* UserName */}
                            <div>
                                <Label htmlFor="userName">User Name</Label>
                                <Input
                                    id="userName"
                                    name="userName"
                                    value={formData.userName || ""}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    required
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email || ""}
                                    disabled
                                />
                            </div>
                            {/* Tennis Level */}
                            <div>
                                <Label htmlFor="tennisLevel">Tennis Level</Label>
                                <Input
                                    id="tennisLevel"
                                    name="tennisLevel"
                                    value={formData.tennisLevel || ""}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    placeholder="Beginner / Intermediate / Advanced"
                                />
                            </div>
                            {/* Preferred Location */}
                            <div>
                                <Label htmlFor="preferredLocation">Preferred Location</Label>
                                <Input
                                    id="preferredLocation"
                                    name="preferredLocation"
                                    value={formData.preferredLocation || ""}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />
                            </div>
                            {/* Bio */}
                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio || ""}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    className="w-full border rounded p-2 min-h-[60px]"
                                />
                            </div>
                            {/* CreatedAt */}
                            <div>
                                <Label>Registered At</Label>
                                <Input
                                    value={
                                        profile.createdAt
                                            ? format(new Date(profile.createdAt), "yyyy-MM-dd HH:mm:ss")
                                            : ""
                                    }
                                    disabled
                                />
                            </div>
                            {/* Edit/Save Buttons */}
                            <div className="flex justify-end gap-2 mt-4">
                                {editMode ? (
                                    <>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Saving..." : "Save"}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => { setEditMode(false); setFormData(profile); }}>
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="button" onClick={() => setEditMode(true)}>
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}