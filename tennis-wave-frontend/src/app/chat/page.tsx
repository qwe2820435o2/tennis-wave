"use client";
import {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatService } from "@/services/chatService";
import { setConversations, setUnreadCounts } from "@/store/slices/chatSlice";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RootState } from "@/store";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import NewChatModal from "@/components/chat/NewChatModal";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";

export default function ChatListPage() {
    const dispatch = useDispatch();
    const conversations = useSelector((state: RootState) => state.chat.conversations);
    const unreadCounts = useSelector((state: RootState) => state.chat.unreadCounts);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            dispatch(showLoading());
            try {
                const [convs, unread] = await Promise.all([
                    chatService.getConversations(),
                    chatService.getUnreadCounts()
                ]);
                dispatch(setConversations(convs));
                dispatch(setUnreadCounts(unread));
            } finally {
                dispatch(hideLoading());
            }
        }
        fetchData();
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white border-2 border-green-600 rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                            <span role="img" aria-label="chat">💬</span> Chat
                        </h1>
                        <Button
                            onClick={() => setIsNewChatModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 rounded-lg shadow font-bold"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Chat
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {conversations.map(conv => (
                            <Link key={conv.id} href={`/chat/${conv.id}`} className="block group">
                                <Card className="flex items-center gap-4 p-4 border-2 border-transparent rounded-2xl bg-white shadow-sm hover:border-green-600 transition cursor-pointer group-hover:bg-green-50">
                                    <Avatar className="w-12 h-12 ring-2 ring-green-400 shadow">
                                        <AvatarImage src={conv.otherUserAvatar || "/default-avatar.png"} />
                                        <AvatarFallback>{conv.otherUserName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-lg text-gray-900 truncate group-hover:text-green-700">{conv.otherUserName}</div>
                                        <div className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage || <span className="italic text-gray-300">No messages yet</span>}</div>
                                    </div>
                                    {unreadCounts[conv.id] > 0 && (
                                        <Badge variant="destructive" className="ml-2 px-2 py-1 rounded-full text-xs font-bold">{unreadCounts[conv.id]}</Badge>
                                    )}
                                </Card>
                            </Link>
                        ))}
                        {conversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                <div className="mb-4">
                                    <span role="img" aria-label="chat" className="text-5xl">💬</span>
                                </div>
                                <div className="font-bold text-lg mb-2">No conversations yet</div>
                                <div className="text-sm mb-4">Start a new chat to connect with partners</div>
                                <Button
                                    onClick={() => setIsNewChatModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 rounded-lg shadow font-bold"
                                >
                                    New Chat
                                </Button>
                            </div>
                        )}
                    </div>
                    <NewChatModal
                        isOpen={isNewChatModalOpen}
                        onClose={() => setIsNewChatModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}