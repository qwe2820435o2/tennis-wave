"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { chatService } from "@/services/chatService";
import { setMessages, addMessage, selectMessages } from "@/store/slices/chatSlice";
import { RootState } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import signalRService from "@/services/signalRService";
import { toast } from "sonner";

export default function ChatDetailPage() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();
    const messages = useSelector((state: RootState) => selectMessages(state)[Number(conversationId)] || []);
    const user = useSelector((state: RootState) => state.user);
    const [otherUserName, setOtherUserName] = useState<string>("");
    const [otherUserAvatar, setOtherUserAvatar] = useState<string>("");
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('ChatDetailPage: Loading conversation', conversationId);
        
        // Load initial messages and other user info
        chatService.getMessages(Number(conversationId)).then(data => {
            dispatch(setMessages({ conversationId: Number(conversationId), messages: data.messages }));
            setOtherUserName(data.otherUserName);
            setOtherUserAvatar(data.otherUserAvatar || "");
        }).catch(error => {
            console.error('Failed to load messages:', error);
            toast.error('Failed to load messages');
        });
        
        // Mark as read
        chatService.markAsRead(Number(conversationId)).catch(error => {
            console.error('Failed to mark as read:', error);
        });
        signalRService.markAsRead(conversationId as string).catch(error => {
            console.error('Failed to mark as read via SignalR:', error);
        });
        
        // Join conversation via SignalR
        console.log('ChatDetailPage: Joining conversation via SignalR', conversationId);
        signalRService.joinConversation(conversationId as string).catch(error => {
            console.error('Failed to join conversation via SignalR:', error);
        });
        
        return () => {
            // Leave conversation when component unmounts
            console.log('ChatDetailPage: Leaving conversation via SignalR', conversationId);
            signalRService.leaveConversation(conversationId as string).catch(error => {
                console.error('Failed to leave conversation via SignalR:', error);
            });
        };
    }, [conversationId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function shouldShowTime(idx: number) {
        if (idx === 0) return true;
        const prev = messages[idx - 1];
        const curr = messages[idx];
        if (!curr.createdAt || !prev.createdAt) return true;
        const currTime = new Date(curr.createdAt).getTime();
        const prevTime = new Date(prev.createdAt).getTime();
        if (isNaN(currTime) || isNaN(prevTime)) return true;
        return currTime - prevTime > 10 * 60 * 1000;
    }

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        
        const messageContent = input.trim();
        setInput("");
        setIsSending(true);

        try {
            // Ensure SignalR connection
            await signalRService.ensureConnection();
            
            // Create temporary message for immediate display
            const tempMessage = {
                id: Date.now(), // Temporary ID
                conversationId: Number(conversationId),
                senderId: user.userId,
                senderName: user.userName || 'You',
                senderAvatar: user.avatar || '',
                content: messageContent,
                isFromCurrentUser: true,
                createdAt: new Date().toISOString(),
                isTemp: true // Mark as temporary message
            };

            // Immediately add to local state
            dispatch(addMessage({
                conversationId: Number(conversationId),
                message: tempMessage
            }));

            // Send message via SignalR
            await signalRService.sendMessage(conversationId as string, messageContent);
            
            console.log('Message sent successfully');
            
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Restore input content
            setInput(messageContent);
            
            // Show error message
            if (error instanceof Error) {
                if (error.message.includes('not authenticated')) {
                    toast.error('Please login again to send messages');
                } else if (error.message.includes('not available')) {
                    toast.error('Connection lost. Please refresh the page and try again');
                } else {
                    toast.error('Failed to send message. Please try again');
                }
            } else {
                toast.error('Failed to send message. Please try again');
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-4">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-4 py-6 bg-white/80 dark:bg-gray-900/90 rounded-t-2xl">
                <Avatar className="w-24 h-24 shadow-lg ring-2 ring-green-400 dark:ring-green-500">
                    <AvatarImage src={otherUserAvatar || "/default-avatar.png"} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">U</AvatarFallback>
                </Avatar>
                <div className="font-bold text-2xl text-green-700 dark:text-green-400 mt-2">{otherUserName}</div>
            </div>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={msg.id}>
                        {shouldShowTime(idx) && (
                            <div className="text-center text-xs text-gray-400 dark:text-gray-500 my-4 select-none">
                                {format(new Date(msg.createdAt ?? ""), "PPpp")}
                            </div>
                        )}
                        <div className={`flex items-end gap-3 ${msg.isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                            {/* Other person's message */}
                            {!msg.isFromCurrentUser && (
                                <>
                                    <Avatar className="w-10 h-10 shadow ring-2 ring-green-300 dark:ring-green-600">
                                        <AvatarImage src={msg?.senderAvatar || "/default-avatar.png"} />
                                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start">
                                        <div
                                            className="px-5 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md max-w-xs break-words border border-green-100 dark:border-gray-600 animate-fade-in"
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* My message */}
                            {msg.isFromCurrentUser && (
                                <>
                                    <div className="flex flex-col items-end">
                                        <div
                                            className={`px-5 py-3 rounded-2xl rounded-br-md bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 text-white shadow-lg max-w-xs break-words animate-fade-in ${
                                                (msg as any).isTemp ? 'opacity-70' : ''
                                            }`}
                                        >
                                            {msg.content}
                                            {(msg as any).isTemp && (
                                                <div className="text-xs opacity-60 mt-1">Sending...</div>
                                            )}
                                        </div>
                                    </div>
                                    <Avatar className="w-10 h-10 shadow ring-2 ring-green-400 dark:ring-green-500">
                                        <AvatarImage src={msg.senderAvatar || "/default-avatar.png"} />
                                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">U</AvatarFallback>
                                    </Avatar>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <form className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 bg-white/90 dark:bg-gray-900/90 rounded-b-2xl shadow-inner" data-testid="chat-form" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                <Input
                    type="text"
                    className="flex-1 rounded-full bg-gray-50 dark:bg-gray-800 border border-green-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-200 dark:focus:ring-green-800 shadow-sm px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={isSending}
                />
                <Button
                    className="rounded-full bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 text-white font-bold shadow-md px-6 py-2 hover:from-green-500 hover:to-green-700 dark:hover:from-green-600 dark:hover:to-green-800 transition disabled:opacity-50"
                    disabled={!input.trim() || isSending}
                    type="submit"
                >
                    {isSending ? 'Sending...' : 'Send'}
                </Button>
            </form>
        </div>
    );
}