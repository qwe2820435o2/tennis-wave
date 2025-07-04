"use client";
import {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatService } from "@/services/chatService";
import { setConversations, setUnreadCounts } from "@/store/slices/chatSlice";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
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

            <div className="space-y-2">
                {conversations.map(conv => (
                    <Link key={conv.id} href={`/chat/${conv.id}`}>
                        <Card className="flex items-center gap-3 p-3 hover:bg-accent transition cursor-pointer">
                            <Avatar className="w-10 h-10">
                                <img
                                    src={conv.otherUserAvatar || "/default-avatar.png"}
                                    alt="avatar"
                                    className="w-10 h-10 object-cover rounded-full"
                                />
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{conv.otherUserName}</div>
                                <div className="text-sm text-muted-foreground truncate">{conv.lastMessage}</div>
                            </div>
                            {unreadCounts[conv.id] > 0 && (
                                <Badge variant="destructive">{unreadCounts[conv.id]}</Badge>
                            )}
                        </Card>
                    </Link>
                ))}
                {conversations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No conversations yet.</div>
                )}
            </div>

            <NewChatModal
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
            />
        </div>
    );
}