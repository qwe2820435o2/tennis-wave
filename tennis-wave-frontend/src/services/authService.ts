import axios from "axios";

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

export async function login(data: LoginRequest): Promise<LoginResponse> {
    // Note：this url should match with backend
    const response = await axios.post<LoginResponse>(
        "http://localhost:5161/api/Auth/login",
        data
    );
    return response.data;
}