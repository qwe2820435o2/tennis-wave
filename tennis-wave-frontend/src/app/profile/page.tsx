"use client";

import { useEffect, useState } from "react";
import { getUserById, updateUser, User } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import {AxiosError} from "axios";

export default function ProfilePage() {
    const [profile, setProfile] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    // Fetch user profile on mount
    useEffect(() => {
        async function fetchProfile() {
            try {
                dispatch(showLoading());
                const userStr = localStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user?.userId;
                if (!userId) return;
                const data = await getUserById(userId);
                setProfile(data);
                setFormData(data);
            } catch(error: unknown) {
                if (error && typeof error === "object" && "isAxiosError" in error) {
                    const axiosError = error as AxiosError;
                    if (axiosError.response?.status !== 401) {
                        toast.error("Failed to load profile");
                    }
                }
            } finally {
                dispatch(hideLoading());
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
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.userId;
            if (!userId) return;
            const updated = await updateUser(userId,formData);
            setProfile(updated);
            toast.success("Profile updated successfully");
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to update profile");
                }
            }
        } finally {
            setIsLoading(false);
            dispatch(hideLoading());
        }
    };

    // 移除本地loading占位
    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-xl">
                <Card className="border-2 border-green-600 rounded-2xl shadow-lg p-8">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-green-700 font-bold">My Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-4">
                                <img
                                    src={profile.avatar || "/default-avatar.png"}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-green-400 shadow-lg"
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
                                    required
                                    className="rounded-lg"
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
                                    className="rounded-lg"
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
                                    placeholder="Beginner / Intermediate / Advanced"
                                    className="rounded-lg"
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
                                    className="rounded-lg"
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
                                    className="w-full border rounded-lg p-2 min-h-[60px]"
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
                                    className="rounded-lg"
                                />
                            </div>
                            {/* Save Buttons */}
                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 rounded-lg shadow font-bold px-6">
                                    {isLoading ? "Saving..." : "Save"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setFormData(profile)} className="rounded-lg px-6">
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