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
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

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
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="flex items-center gap-2 cursor-pointer group">
                                                    <Avatar className="w-12 h-12 group-hover:ring-2 group-hover:ring-green-500">
                                                        <AvatarImage src={partner.avatar || "/default-avatar.png"} />
                                                        <AvatarFallback>{partner.userName?.[0] || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-semibold group-hover:text-green-700">{partner.userName}</div>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="text-center text-2xl font-bold mb-2">Partner Profile</DialogTitle>
                                                    <DialogDescription className="text-center mb-4">View detailed information about this partner.</DialogDescription>
                                                </DialogHeader>
                                                <div className="flex flex-col items-center gap-4">
                                                    <Avatar className="w-24 h-24 shadow-lg ring-2 ring-green-400">
                                                        <AvatarImage src={partner.avatar || "/default-avatar.png"} />
                                                        <AvatarFallback>{partner.userName?.[0] || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-xl font-semibold text-green-700">{partner.userName}</div>
                                                    <div className="w-full flex flex-col gap-2 mt-2">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <span className="font-medium w-24">Level:</span>
                                                            <span>{partner.tennisLevel || "-"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <span className="font-medium w-24">Location:</span>
                                                            <span>{partner.preferredLocation || "-"}</span>
                                                        </div>
                                                        {partner.email && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <span className="font-medium w-24">Email:</span>
                                                                <span>{partner.email}</span>
                                                            </div>
                                                        )}
                                                        {partner.createdAt && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <span className="font-medium w-24">Registered:</span>
                                                                <span>{new Date(partner.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        {partner.updatedAt && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <span className="font-medium w-24">Last Updated:</span>
                                                                <span>{new Date(partner.updatedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {partner.bio && (
                                                        <div className="w-full bg-green-50 border-l-4 border-green-400 p-3 mt-4 rounded text-gray-700 italic">
                                                            <span className="font-medium text-green-700">Bio:</span> {partner.bio}
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 truncate">Level: {partner.tennisLevel || "-"}</div>
                                            <div className="text-xs text-gray-500 truncate">Location: {partner.preferredLocation || "-"}</div>
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