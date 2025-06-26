import axios, {AxiosResponse} from "axios";
import {ApiResponse} from "@/types/api";



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
    const token = localStorage.getItem("token");
    const response: AxiosResponse<ApiResponse<UserProfile>> = await axios.get("http://localhost:5161/api/UserProfile/me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const token = localStorage.getItem("token");
    const response: AxiosResponse<ApiResponse<UserProfile>> = await axios.put("http://localhost:5161/api/UserProfile/me", data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
}