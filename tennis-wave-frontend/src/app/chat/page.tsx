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

export default function ChatListPage() {
    const dispatch = useDispatch();
    const conversations = useSelector((state: RootState) => state.chat.conversations);
    const unreadCounts = useSelector((state: RootState) => state.chat.unreadCounts);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    useEffect(() => {
        chatService.getConversations().then(data => dispatch(setConversations(data)));
        chatService.getUnreadCounts().then(data => dispatch(setUnreadCounts(data)));
    }, [dispatch]);

    return (
        <div className="max-w-xl mx-auto p-4">

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">💬 Chat</h1>
                <Button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            <div className="space-y-3">
                {conversations.map(conv => (
                    <Link key={conv.id} href={`/chat/${conv.id}`} className="block group">
                        <Card className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-gray-200 bg-white hover:shadow-lg hover:border-green-400 transition cursor-pointer group-hover:bg-green-50">
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
                    <div className="text-center text-muted-foreground py-16 text-lg italic">No conversations yet. Start a new chat!</div>
                )}
            </div>

            <NewChatModal
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
            />
        </div>
    );
}