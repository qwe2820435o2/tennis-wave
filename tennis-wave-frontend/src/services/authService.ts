import {ApiResponse} from "@/types/api";
import axiosInstance from "@/services/axiosInstance";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: number;
    userName: string;
    email: string;
    token: string;
}

export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    userId: number;
    userName: string;
    email: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
    // Note：this url should match with backend
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>("/api/Auth/login", data);
    if (response.data.code !== 0) {
        throw new Error(response.data.message);
    }
    return response.data.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post<ApiResponse<RegisterResponse>>("/api/Auth/register", data);
    if (response.data.code !== 0) {
        throw new Error(response.data.message);
    }
    return response.data.data;
}