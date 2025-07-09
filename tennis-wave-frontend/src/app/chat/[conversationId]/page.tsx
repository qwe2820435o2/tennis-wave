"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { chatService } from "@/services/chatService";
import { setMessages, addMessage } from "@/store/slices/chatSlice";
import { RootState } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl shadow-lg border mt-4">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 border-b px-4 py-6 bg-white/80 rounded-t-2xl">
                <Avatar className="w-24 h-24 shadow-lg ring-2 ring-green-400">
                    <AvatarImage src={otherUserAvatar || "/default-avatar.png"} />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="font-bold text-2xl text-green-700 mt-2">{otherUserName}</div>
            </div>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={msg.id}>
                        {shouldShowTime(idx) && (
                            <div className="text-center text-xs text-gray-400 my-4 select-none">
                                {format(new Date(msg.createdAt?? ""), "PPpp")}
                            </div>
                        )}
                        <div className={`flex items-end gap-3 ${msg.isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                            {/* 对方消息 */}
                            {!msg.isFromCurrentUser && (
                                <>
                                    <Avatar className="w-10 h-10 shadow ring-2 ring-green-300">
                                        <AvatarImage src={msg?.senderAvatar || "/default-avatar.png"} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start">
                                        <div
                                            className="px-5 py-3 rounded-2xl rounded-bl-md bg-white text-gray-900 shadow-md max-w-xs break-words border border-green-100 animate-fade-in"
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* 我方消息 */}
                            {msg.isFromCurrentUser && (
                                <>
                                    <div className="flex flex-col items-end">
                                        <div
                                            className="px-5 py-3 rounded-2xl rounded-br-md bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg max-w-xs break-words animate-fade-in"
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                    <Avatar className="w-10 h-10 shadow ring-2 ring-green-400">
                                        <AvatarImage src={msg.senderAvatar || "/default-avatar.png"} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <form className="p-4 border-t flex gap-3 bg-white/90 rounded-b-2xl shadow-inner" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                <Input
                    className="flex-1 rounded-full bg-gray-50 border border-green-200 focus:border-green-500 focus:ring-green-200 shadow-sm px-4 py-2"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button
                    className="rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow-md px-6 py-2 hover:from-green-500 hover:to-green-700 transition"
                    disabled={!input.trim()}
                    type="submit"
                >
                    Send
                </Button>
            </form>
        </div>
    );
}