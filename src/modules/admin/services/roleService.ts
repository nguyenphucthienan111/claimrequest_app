import apiService from "../../../core/api/api";
import { Role } from "../types/roleInterface";

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await apiService.get<Role[]>("/projects/roles");

    if (response && response.success && response.data) {
      return response.data as Role[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const getRoleOptions = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const roles = await getAllRoles();
    
    return roles.map(role => ({
      value: role.value,
      label: role.name,
    }));
  } catch (error) {
    console.error("Error getting role options:", error);
    return [];
  }
};