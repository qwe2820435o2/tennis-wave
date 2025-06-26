"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Volleyball } from "lucide-react";
import {login} from "@/services/authService";
import {AxiosError} from "axios";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(formData);
            // Store token and user info
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify({
                userId: result.userId,
                userName: result.userName,
                email: result.email
            }));
            toast.success("Login Successful", {
                description: `Welcome back, ${result.userName}!`,
            });
            router.push("/profile");
        } catch (error: unknown) {
            let errorMessage = "Please check your email and password";
            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError<{ message?: string }>;
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                }
            }
            toast.error("Login Failed", {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                        <Volleyball className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tennis Wave</h1>
                    <p className="text-gray-600">Connect with tennis enthusiasts, start your tennis journey</p>
                </div>

                {/* Login Card */}
                <Card className="border-2 border-b-green-300 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your email and password to sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Remember Me and Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-gray-600">
                                        Remember me
                                    </Label>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Register Link */}
                            <div className="text-center">
                                <span className="text-gray-600">Do not have an account?</span>
                                <Link
                                    href="/auth/register"
                                    className="ml-1 text-green-600 hover:text-green-700 hover:underline font-medium"
                                >
                                    Sign up now
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