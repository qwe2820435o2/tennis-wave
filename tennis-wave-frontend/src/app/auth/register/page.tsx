"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {AxiosError} from "axios";
import {Volleyball} from "lucide-react";
import {register} from "@/services/authService";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import AvatarPicker from "@/components/common/AvatarPicker";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: "avatar1.png", // Default avatar
    });

    const router = useRouter();
    const dispatch = useDispatch();

    // Handle input field changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle avatar selection
    const handleAvatarSelect = (avatar: string) => {
        setFormData(prev => ({
            ...prev,
            avatar
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        dispatch(showLoading());

        // Simple validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // Call register API
            await register({
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
                avatar: formData.avatar,
            });
            toast.success("Registration successful", {
                description: "You can now log in with your new account.",
            });
            router.push("/auth/login");
        } catch (error: unknown) {
            let errorMessage = "Network error. Please try again.";
            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError<{ message?: string }>;
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                }
            }

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Registration Failed", {
                        description: errorMessage,
                    });
                }
            }

        } finally {
            setIsLoading(false);
            dispatch(hideLoading());
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 dark:bg-green-500 rounded-full mb-4">
                        <Volleyball className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign Up</h1>
                    <p className="text-gray-600 dark:text-gray-300">Create your Tennis Wave account</p>
                </div>

                {/* Register Card */}
                <Card className="border-2 border-green-600 dark:border-green-500 shadow-2xl bg-white dark:bg-gray-800">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Create Account</CardTitle>
                        <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                            Fill in the information below to register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* User Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="userName" className="text-gray-700 dark:text-gray-300">User Name</Label>
                                <Input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    placeholder="Enter your user name"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-400"
                                    required
                                />
                            </div>
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-400"
                                    required
                                />
                            </div>
                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-400"
                                    required
                                />
                            </div>
                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-400"
                                    required
                                />
                            </div>
                            {/* Avatar Selection */}
                            <div className="space-y-2">
                                <AvatarPicker
                                    selectedAvatar={formData.avatar}
                                    onAvatarSelect={handleAvatarSelect}
                                />
                            </div>
                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "Registering..." : "Sign Up"}
                            </Button>
                            {/* Link to login */}
                            <div className="text-center">
                                <span className="text-gray-600 dark:text-gray-300">Already have an account?</span>
                                <Link
                                    href="/auth/login"
                                    className="ml-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                    <p>© 2025 Tennis Wave. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}