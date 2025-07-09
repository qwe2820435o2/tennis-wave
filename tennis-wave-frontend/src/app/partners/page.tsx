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
import { Search } from "lucide-react";

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
            } catch (error: any) {
                if (error.isAuthError) return; // It has been processed globally
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
                <Card className="border-2 border-green-600 rounded-2xl shadow-lg mt-8 p-8">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-green-700 font-bold">Recommended Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : partners.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                <div className="mb-4">
                                    <Search className="w-12 h-12 mx-auto text-green-200" />
                                </div>
                                <div className="font-bold text-lg mb-2">No recommended partners found</div>
                                <div className="text-sm mb-4">Try adjusting your search criteria</div>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {partners.map((partner) => (
                                    <Dialog key={partner.id}>
                                        <li className="flex items-center gap-4 p-4 border-2 border-transparent rounded-2xl bg-white shadow-sm hover:border-green-600 transition group">
                                            <DialogTrigger asChild>
                                                <div className="flex flex-1 items-center gap-4 cursor-pointer">
                                                    <Avatar className="w-12 h-12 group-hover:ring-2 group-hover:ring-green-500">
                                                        <AvatarImage src={partner.avatar || "/default-avatar.png"} />
                                                        <AvatarFallback>{partner.userName?.[0] || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="font-semibold group-hover:text-green-700">{partner.userName}</div>
                                                        <div className="text-xs text-gray-500 truncate">Level: {partner.tennisLevel || "-"}</div>
                                                        <div className="text-xs text-gray-500 truncate">Location: {partner.preferredLocation || "-"}</div>
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-lg shadow font-bold ml-2" onClick={() => handleStartChat(partner)}>
                                                Start Chat
                                            </Button>
                                        </li>
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
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 