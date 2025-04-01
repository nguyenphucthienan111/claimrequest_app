import apiService from "../../../core/api/api";
import { User, UserResponse, Employee } from "../types/user";


export const searchUsers = async (
  searchCondition: object,
  pageInfo: { pageNum: number; pageSize: number }
): Promise<UserResponse> => {
  try {
    const response = await apiService.post<UserResponse>("/users/search", {
      searchCondition,
      pageInfo,
    });

    console.log("Full API Response:", response); // ✅ Debug response

    return response.data ?? {
      pageData: [],
      pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      pageData: [],
      pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    }; // ✅ Prevent errors
  }
};

export const createUser = async (
  userData: Partial<User> & { password: string }
): Promise<User> => {
  const response = await apiService.post<User>("/users", userData);
  if (!response || !response.data) {
    return {} as User; // Giá trị mặc định tránh lỗi
  }
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: Pick<User, "email" | "user_name">
): Promise<User> => {
  const response = await apiService.put<User>(`/users/${userId}`, userData);
  if (!response || !response.data) {
    return {} as User; // Giá trị mặc định tránh lỗi
  }
  return response.data;
};

export const changeUserStatus = async (userId: string, isBlocked: boolean) => {
  return apiService.put("/users/change-status", {
    user_id: userId, // Kiểm tra API yêu cầu user_id hay id
    is_blocked: isBlocked,
  });
};

export const deleteUser = async (userId: string) => {
  return apiService.delete(`/users/${userId}`);
};

export const fetchUser = async (userId: string): Promise<User> => {
  try {
    const response = await apiService.get<User>(`/users/${userId}`);
    
    if (!response || !response.data) {
      throw new Error(`User with ID: ${userId} not found`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with ID: ${userId}`, error);
    throw error;
  }
};

export const changeUserRole = async (userId : string, roleCode : string) => {
  try {
    const response = await apiService.put("/users/change-role", {
      user_id: userId,
      role_code: roleCode,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update role:", error);
    return false;
  }
};

export const getEmployeeById = async (userId: string): Promise<Employee> => {
  try {
    const response = await apiService.get<Employee>(
      `/employees/${userId}`
    );

    console.log("Backend API Response:", response);

    // Correcting the data extraction
    const employeeData = response?.data?? response?.data;

    if (!employeeData || Object.keys(employeeData).length === 0) {
      throw new Error("Employee data is empty or not found");
    }

    return employeeData;
  } catch (error) {
    console.error(`Failed to fetch employee with ID: ${userId}`, error);
    throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
  }
};

export const updateEmployee = async (userId: string, employeeData: Record<string, unknown>): Promise<void> => {
  try {
    const response = await apiService.put(`/employees/${userId}`, employeeData);
    console.log("API Response:", response);
  } catch (error) {
    console.error("API Error:", error instanceof Error ? error.message : "Unknown error");

    if (error instanceof Error && "response" in error) {
      const axiosError = error as { response?: { data?: unknown } };
      throw new Error(axiosError.response?.data ? JSON.stringify(axiosError.response.data) : error.message);
    }

    throw new Error("An unexpected error occurred");
  }
};

export const fetchJobRanks = async () => {
  try {
    const response = await apiService.get("/jobs/get-all"); 
    return response.data;
  } catch (error) {
    console.error("Failed to fetch job ranks:", error);
    return [];
  }
};