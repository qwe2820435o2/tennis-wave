"use client";

import { useEffect, useState } from "react";
import { getRecommendedPartners, User } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/store/slices/loadingSlice";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { chatService } from "@/services/chatService";
import { useRouter } from "next/navigation";

export default function PartnersPage() {
    const [partners, setPartners] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        async function fetchPartners() {
            setLoading(true);
            dispatch(showLoading());
            try {
                const data = await getRecommendedPartners();
                setPartners(data);
            } catch (error) {
                toast.error("Failed to load recommended partners");
            } finally {
                setLoading(false);
                dispatch(hideLoading());
            }
        }
        fetchPartners();
    }, [dispatch]);

    const handleStartChat = async (partner: User) => {
        try {
            dispatch(showLoading());
            const conversation = await chatService.createConversation(partner.id);
            toast.success(`Chat started with ${partner.userName}`);
            router.push(`/chat/${conversation.id}`);
        } catch (error) {
            toast.error("Failed to start chat");
        } finally {
            dispatch(hideLoading());
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-2xl">
                <Card className="border-2 border-green-600 shadow-2xl mt-8">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Recommended Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : partners.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No recommended partners found.</div>
                        ) : (
                            <ul className="space-y-4">
                                {partners.map((partner) => (
                                    <li key={partner.id} className="flex items-center gap-4 p-3 border rounded-lg bg-white">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={partner.avatar || "/default-avatar.png"} />
                                            <AvatarFallback>{partner.userName?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-semibold">{partner.userName}</div>
                                            <div className="text-xs text-gray-500">Level: {partner.tennisLevel || "-"}</div>
                                            <div className="text-xs text-gray-500">Location: {partner.preferredLocation || "-"}</div>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => handleStartChat(partner)}>
                                            Start Chat
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 