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

export default function ChatDetailPage() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();
    const messages = useSelector((state: RootState) => state.chat.messages[Number(conversationId)] || []);
    const conversations = useSelector((state: RootState) => state.chat.conversations);
    const conversation = conversations.find(c => c.id === Number(conversationId));
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatService.getMessages(Number(conversationId)).then(data =>
            dispatch(setMessages({ conversationId: Number(conversationId), messages: data }))
        );
        chatService.markAsRead(Number(conversationId));
        const timer = setInterval(() => {
            chatService.getMessages(Number(conversationId)).then(data =>
                dispatch(setMessages({ conversationId: Number(conversationId), messages: data }))
            );
        }, 5000);
        return () => clearInterval(timer);
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
        const msg = await chatService.sendMessage(Number(conversationId), input);
        dispatch(addMessage({ conversationId: Number(conversationId), message: msg }));
        setInput("");
    };

    return (
        <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-64px)] bg-background rounded-lg shadow-md">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 border-b px-4 py-4">
                <Avatar className="w-18 h-18">
                    <img
                        src={conversation?.otherUserAvatar || "/default-avatar.png"}
                        alt="avatar"
                        className="w-18 h-18 object-cover rounded-full"
                    />
                </Avatar>
                <div className="font-semibold text-lg">{conversation?.otherUserName}</div>
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
                                    <img src={conversation?.otherUserAvatar || "/default-avatar.png"} alt="avatar" />
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