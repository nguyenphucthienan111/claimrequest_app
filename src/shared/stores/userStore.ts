import {create} from "zustand";

//
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isAuthenticated: false,

    login: (user) =>
        set({
            user,
            isAuthenticated: true,
        }),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
        }),
    
    updateUser: (updatedUser) =>
        set((state) => ({
            user: state.user
            ? { ...state.user, ...updatedUser } : null,
        })),
}));