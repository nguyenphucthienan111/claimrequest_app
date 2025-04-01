import apiService from "../../../core/api/api";
import { Department } from "../types/departmentInterface";



export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const response = await apiService.get<Department[]>("/departments/get-all");
    
    if (response && response.success && response.data) {
        return response.data as Department[];
      }
    
    return [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};


export const getDepartmentOptions = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const departments = await getAllDepartments();
    
    return departments.map(dept => ({
      value: dept.department_code,
      label: dept.department_name
    }));
  } catch (error) {
    console.error("Error getting department options:", error);
    return [];
  }
}; 