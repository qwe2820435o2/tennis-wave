import {AxiosResponse} from "axios";
import {ApiResponse} from "@/types/api";
import axiosInstance from "@/services/axiosInstance";
import {UserSearchDto} from "@/types/user";



export interface UserProfile {
    id: number;
    userName: string;
    email: string;
    avatar?: string;
    tennisLevel?: string;
    preferredLocation?: string;
    createdAt?: string;
    updatedAt?: string;
    bio?: string;
}

export async function getUserProfile(): Promise<UserProfile> {
    const response: AxiosResponse<ApiResponse<UserProfile>> = await axiosInstance.get("/api/UserProfile/me");
    return response.data.data;
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response: AxiosResponse<ApiResponse<UserProfile>> = await axiosInstance.put("/api/UserProfile/me", data);
    return response.data.data;
}

export async function searchUsers(query: string): Promise<UserSearchDto[]> {
    const response = await axiosInstance.get(`/api/userprofile/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
}