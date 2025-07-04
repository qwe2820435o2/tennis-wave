// components/chat/NewChatModal.tsx
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, User, MessageCircle } from "lucide-react";
import { searchUsers } from "@/services/userService";
import { chatService } from "@/services/chatService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {AxiosError} from "axios";

interface UserSearchResult {
    userId: number;
    userName: string;
    avatar?: string;
    isOnline: boolean;
}

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchUsers(searchQuery);
            setSearchResults(results);
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to search users");
                }
            }
        }finally {
            setIsSearching(false);
        }
    };

    const handleStartChat = async (userId: number) => {
        setIsCreating(true);
        try {
            const conversation = await chatService.createConversation(userId);
            onClose();
            router.push(`/chat/${conversation.id}`);
            toast.success("Chat started successfully");
        } catch(error: unknown) {

            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status !== 401) {
                    toast.error("Failed to start chat");
                }
            }
        }finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Start New Chat
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search users by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {isSearching && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div
                                    key={user.userId}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <img
                                                src={user.avatar || "/default-avatar.png"}
                                                alt={user.userName}
                                                className="w-10 h-10 object-cover rounded-full"
                                            />
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.userName}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                {user.isOnline ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleStartChat(user.userId)}
                                        disabled={isCreating}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isCreating ? 'Starting...' : 'Chat'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isSearching && searchQuery && searchResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No users found</p>
                        </div>
                    )}

                    {!searchQuery && (
                        <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Search for users to start a chat</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}