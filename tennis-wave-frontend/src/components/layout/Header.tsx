"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Volleyball, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/store/slices/userSlice";
import type { RootState } from "@/store";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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
                        <Link href="/bookings" className="text-gray-600 hover:text-green-600 transition-colors">
                            Find Bookings
                        </Link>
                        <Link href="/partners" className="text-gray-600 hover:text-green-600 transition-colors">
                            Find Partners
                        </Link>
                        <Link href="/chat" className="ml-4 font-bold">
                            Chat
                        </Link>
                    </nav>


                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {user && user.userId ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>{user.userName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="block w-full text-left">
                                            My Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/my-bookings" className="block w-full text-left">
                                            My Bookings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center"
                                        >
                                            <LogOut className="w-4 h-4 inline mr-2" />
                                            Logout
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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