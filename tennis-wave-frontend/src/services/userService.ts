import {AxiosResponse} from "axios";
import {ApiResponse} from "@/types/api";
import axiosInstance from "@/services/axiosInstance";
import {UserSearchDto} from "@/types/user";
import {CreateMatchDto, TennisMatch} from "@/types/tennisMatch";



export interface User {
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

export async function getUserById(userId: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await axiosInstance.get(`/api/User/${userId}`);
    return response.data.data;
}

export async function updateUser(userId: number, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await axiosInstance.put(`/api/User/${userId}`, data);
    return response.data.data;
}

export async function searchUsers(query: string): Promise<UserSearchDto[]> {
    const response = await axiosInstance.get(`/api/User/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
}