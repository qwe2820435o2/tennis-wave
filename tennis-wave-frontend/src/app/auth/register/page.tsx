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

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const router = useRouter();

    // Handle input field changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Call register API
            await register({
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
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
            toast.error("Registration Failed", {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                        <Volleyball className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
                    <p className="text-gray-600">Create your Tennis Wave account</p>
                </div>

                {/* Register Card */}
                <Card className="border-2 border-green-600 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                        <CardDescription className="text-center">
                            Fill in the information below to register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* User Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="userName">User Name</Label>
                                <Input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    placeholder="Enter your user name"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "Registering..." : "Sign Up"}
                            </Button>
                            {/* Link to login */}
                            <div className="text-center">
                                <span className="text-gray-600">Already have an account?</span>
                                <Link
                                    href="/auth/login"
                                    className="ml-1 text-green-600 hover:text-green-700 hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>© 2025 Tennis Wave. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}