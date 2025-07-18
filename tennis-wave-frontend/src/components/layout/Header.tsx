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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Header() {
    const user = useSelector((state: RootState) => state.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        dispatch(clearUser());
        toast.success("Logged out successfully");
        window.location.href = "/";
    };

    if (!user.isHydrated) {
        // You can return null or a loading placeholder
        return null;
    }

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                            <Volleyball className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Tennis Wave</span>
                    </Link>

                    {/* Navigation - Desktop */}
                    <nav className="hidden md:flex items-center justify-center flex-1">
                        <Tabs value={pathname} className="w-fit">
                            <TabsList className="bg-white/90 dark:bg-gray-800/90 shadow rounded-lg px-2">
                                <TabsTrigger
                                    value="/bookings"
                                    className="px-6 py-2 text-base font-medium transition-all
                                        data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400 data-[state=active]:font-bold
                                        data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-500
                                        hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 active:scale-95
                                        text-gray-700 dark:text-gray-300"
                                    onClick={() => { if (pathname !== "/bookings") router.push("/bookings"); }}
                                >
                                    Find Bookings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="/partners"
                                    className="px-6 py-2 text-base font-medium transition-all
                                        data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400 data-[state=active]:font-bold
                                        data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-500
                                        hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 active:scale-95
                                        text-gray-700 dark:text-gray-300"
                                    onClick={() => { if (pathname !== "/partners") router.push("/partners"); }}
                                >
                                    Find Partners
                                </TabsTrigger>
                                <TabsTrigger
                                    value="/chat"
                                    className="px-6 py-2 text-base font-medium transition-all
                                        data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400 data-[state=active]:font-bold
                                        data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-500
                                        hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 active:scale-95
                                        text-gray-700 dark:text-gray-300"
                                    onClick={() => { if (pathname !== "/chat") router.push("/chat"); }}
                                >
                                    Chat
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </nav>


                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />
                        
                        {user && user.userId ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>{user.userName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" sideOffset={8} className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-1 min-w-[160px] bg-white dark:bg-gray-800">
                                    <DropdownMenuItem asChild className="flex items-center gap-2 px-4 py-2 rounded-md transition text-sm font-normal cursor-pointer
                                        hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 active:bg-green-100 dark:active:bg-green-900/30 active:text-green-800 dark:active:text-green-300 text-gray-700 dark:text-gray-300">
                                        <Link href="/profile" className="block w-full text-left">My Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="flex items-center gap-2 px-4 py-2 rounded-md transition text-sm font-normal cursor-pointer
                                        hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 active:bg-green-100 dark:active:bg-green-900/30 active:text-green-800 dark:active:text-green-300 text-gray-700 dark:text-gray-300">
                                        <Link href="/my-bookings" className="block w-full text-left">My Bookings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-600" />
                                    <DropdownMenuItem asChild className="flex items-center gap-2 px-4 py-2 rounded-md transition text-sm font-normal cursor-pointer
                                        hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 active:bg-red-100 dark:active:bg-red-900/30 active:text-red-800 dark:active:text-red-300 text-gray-700 dark:text-gray-300">
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
                                    <Button variant="ghost" className="transition-colors active:scale-95 duration-150 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Sign In</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors active:scale-95 duration-150 text-white">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}