"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { chatService } from "@/services/chatService";
import { setMessages, addMessage } from "@/store/slices/chatSlice";
import { RootState } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";
import signalRService from "@/services/signalRService";

export default function ChatDetailPage() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();
    const messages = useSelector((state: RootState) => state.chat.messages[Number(conversationId)] || []);
    const [otherUserName, setOtherUserName] = useState<string>("");
    const [otherUserAvatar, setOtherUserAvatar] = useState<string>("");
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('ChatDetailPage: Loading conversation', conversationId);
        
        // Load initial messages and other user info
        chatService.getMessages(Number(conversationId)).then(data => {
            dispatch(setMessages({ conversationId: Number(conversationId), messages: data.messages }));
            setOtherUserName(data.otherUserName);
            setOtherUserAvatar(data.otherUserAvatar || "");
        });
        
        // Mark as read
        chatService.markAsRead(Number(conversationId));
        signalRService.markAsRead(conversationId as string);
        
        // Join conversation via SignalR
        console.log('ChatDetailPage: Joining conversation via SignalR', conversationId);
        signalRService.joinConversation(conversationId as string);
        
        return () => {
            // Leave conversation when component unmounts
            console.log('ChatDetailPage: Leaving conversation via SignalR', conversationId);
            signalRService.leaveConversation(conversationId as string);
        };
    }, [conversationId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function shouldShowTime(idx: number) {
        if (idx === 0) return true;
        const prev = messages[idx - 1];
        const curr = messages[idx];
        if (!curr.createdAt || !prev.createdAt) return true; //
        const currTime = new Date(curr.createdAt).getTime();
        const prevTime = new Date(prev.createdAt).getTime();
        if (isNaN(currTime) || isNaN(prevTime)) return true; //
        return currTime - prevTime > 10 * 60 * 1000;
    }

    const handleSend = async () => {
        if (!input.trim()) return;
        await signalRService.waitForReady();
        await signalRService.sendMessage(conversationId as string, input);
        setInput("");
    };

    return (
        <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-64px)] bg-background rounded-lg shadow-md">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 border-b px-4 py-4">
                <Avatar className="w-18 h-18">
                    <img
                        src={otherUserAvatar || "/default-avatar.png"}
                        alt="avatar"
                        className="w-18 h-18 object-cover rounded-full"
                    />
                </Avatar>
                <div className="font-semibold text-lg">{otherUserName}</div>
            </div>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-background">
                {messages.map((msg, idx) => (
                    <div key={msg.id}>
                        {shouldShowTime(idx) && (
                            <div className="text-center text-xs text-muted-foreground my-2">
                                    {format(new Date(msg.createdAt?? ""), "PPpp")}
                            </div>
                        )}
                        <div className={`flex items-end gap-2 ${msg.isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                            {!msg.isFromCurrentUser && (
                                <Avatar className="w-8 h-8">
                                    <img src={msg?.senderAvatar || "/default-avatar.png"} alt="avatar" />
                                </Avatar>
                            )}

                            <div
                                className={`px-4 py-2 rounded-2xl shadow-md max-w-xs break-words ${
                                    msg.isFromCurrentUser
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-muted text-foreground rounded-bl-sm"
                                }`}
                            >
                                <div>{msg.content}</div>
                            </div>
                            {msg.isFromCurrentUser && (
                                <Avatar className="w-8 h-8">
                                    <img src={msg.senderAvatar || "/default-avatar.png"} alt="avatar" />
                                </Avatar>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <div className="p-3 border-t flex gap-2 bg-background">
                <Input
                    className="flex-1"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                />
                <Button onClick={handleSend} disabled={!input.trim()}>
                    Send
                </Button>
            </div>
        </div>
    );
}