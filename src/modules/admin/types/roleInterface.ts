export interface Role {
    name: string;
    value: string;
}

export interface RoleResponse {
    success: boolean;
    data: Role[];
}