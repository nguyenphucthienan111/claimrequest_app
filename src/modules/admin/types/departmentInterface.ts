export interface Department {
  _id: string;
  department_code: string;
  department_name: string;
  description: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentResponse {
  success: boolean;
  data: Department[];
} 