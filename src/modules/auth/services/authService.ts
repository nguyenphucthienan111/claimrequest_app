import apiService from "../../../core/api/api";
import { ResponseModel } from "../../../shared/constants/responseModel";

interface AuthResponse {
    token: string;
}

interface UserData {
    _id: string,
    email: string,
    user_name: string,
    role_code: string,
    is_verified: boolean,
    verification_token: string,
    verification_token_expires: string,
    token_version: number,
    is_blocked: boolean,
    created_at: string,
    updated_at: string,
    is_deleted: boolean,
    __v: number
}

export const login = async (email: string, password: string): Promise<void> => {
    try {
        const loginData = {
            email: email,
            password: password,
        }
        const response = await apiService.post<AuthResponse>('/auth', loginData);
        if (response.success && response.data) {
            localStorage.setItem("token", response.data.token);
        }
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}

export const logout = async (): Promise<void> => {
    try {
        const response = await apiService.post<null>('/auth/logout');
        if (response.success) {
            localStorage.clear();
        }
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

export const forgotPassword = async (email: string): Promise<void> => {
    try {
        await apiService.put<null>('/auth/forgot-password', { email });
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

export const getUserInfo = async (): Promise<ResponseModel<UserData>> => {
    try {
        const response = await apiService.get<UserData>('/auth');
        if (response.success) {
            localStorage.setItem("userData", JSON.stringify(response.data));
        }
        return response;
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

export const verifyToken = async (token: string): Promise<void> => {
    try {
        await apiService.post<null>('/auth/verify-token', { token });
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

export const resendToken = async (email: string): Promise<void> => {
    try {
        await apiService.post<null>('/auth/resend-token', { email });
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

export const triggerVerifyToken = async (email: string): Promise<void> => {
    try {
        await apiService.post<null>('/auth/trigger-verify-token', { email });
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}