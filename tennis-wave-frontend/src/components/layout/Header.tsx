"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Volleyball, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/store/slices/userSlice";
import type { RootState } from "@/store";
import { useState } from "react";

export default function Header() {
    const user = useSelector((state: RootState) => state.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        dispatch(clearUser());
        toast.success("Logged out successfully");
        window.location.href = "/";
    };

    if (!user.isHydrated) {
        // 你可以返回 null 或 loading 占位
        return null;
    }

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <Volleyball className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Tennis Wave</span>
                    </Link>

                    {/* Navigation - Desktop */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/matches" className="text-gray-600 hover:text-green-600 transition-colors">
                            Find Matches
                        </Link>
                        <Link href="/bookings" className="text-gray-600 hover:text-green-600 transition-colors">
                            Bookings
                        </Link>
                        <Link href="/my-matches" className="text-gray-600 hover:text-green-600 transition-colors">
                            My Matches
                        </Link>
                        <Link href="/chat" className="ml-4 font-bold">
                            💬 Chat
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">
                            Contact
                        </Link>
                    </nav>


                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {user && user.userId ? (
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    className="flex items-center space-x-2"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    <User className="w-4 h-4" />
                                    <span>{user.userName}</span>
                                </Button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/bookings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                        <Link
                                            href="/my-matches"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Matches
                                        </Link>
                                        <Link href="/chat" className="ml-4 font-bold">
                                            💬 Chat
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogOut className="w-4 h-4 inline mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost" className="transition-colors active:scale-95 duration-150">Sign In</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="bg-green-600 hover:bg-green-700 transition-colors active:scale-95 duration-150">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}