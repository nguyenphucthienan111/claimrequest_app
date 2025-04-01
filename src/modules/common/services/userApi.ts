import apiService from "../../../core/api/api"

interface UserData {
    "_id": string,
    "email": string,
    "user_name": string,
    "role_code": string,
    "is_verified": boolean,
    "is_blocked": boolean,
    "is_deleted": boolean,
    "created_at": string,
    "updated_at": string,
    "__v": number,
    "token_version": number
}

export const updateInfo = async (_id: string, updateData: { email: string; user_name: string }): Promise<void> => {
    try {
        await apiService.put<UserData>(`/users/${_id}`, updateData)
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}

export const updatePassword = async (updateData: { old_password: string; new_password: string }): Promise<void> => {
    try {
        await apiService.put('/users/change-password', updateData);
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}