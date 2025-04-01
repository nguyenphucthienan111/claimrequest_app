
export interface User {
  _id: string; // ✅ Đúng với API response
  email: string;
  user_name: string;
  role_code: string;
  is_verified?: boolean;
  is_blocked: boolean;
  is_deleted?: boolean;
  created_at: Date;
  updated_at: Date;
  token_version?: number;
}

export interface PageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UserResponse {
  pageData: User[];
  pageInfo: PageInfo;
}

export interface Employee {
  _id: string;
  user_id: string;
  job_rank: string;
  contract_type: string;
  account?: string;
  address: string;
  phone: string;
  full_name: string;
  avatar_url: string;
  department_code: string;
  salary: number;
  start_date: Date;
  end_date: Date;
  updated_by?: string;
  created_at?: string | Date;
  updated_at?: string| Date;
  is_deleted: boolean;
}

export interface EmployeeData {
  user_id: string,
  job_rank: string,
  contract_type: string,
  account: string,
  address: string,
  phone: string,
  full_name: string,
  avatar_url: string,
  department_code: string,
  salary: number,
  start_date: Date,
  end_date: Date
}