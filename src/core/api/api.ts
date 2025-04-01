import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ResponseModel } from "../../shared/constants/responseModel";

const api = axios.create({
  baseURL: "https://management-claim-request.vercel.app/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse<ResponseModel<any>>) => {
    return response;
  },
  (error) => {
    let errorMessage = "Unknown error!";
    if (error.response) {
      const data = error.response.data;
      if (data) {
        if (data.message) {
          errorMessage = data.message;
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors[0].message;
        }
      }
    }
    return Promise.reject(new Error(errorMessage));
  }
);

const apiService = {
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ResponseModel<T>> {
    const response = await api.get<ResponseModel<T>>(url, { ...config, params });  
    return response.data;
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseModel<T>> {
    const response = await api.post<ResponseModel<T>>(url, data, config);
    return response.data;
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseModel<T>> {
    const response = await api.put<ResponseModel<T>>(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ResponseModel<T>> {
    const response = await api.delete<ResponseModel<T>>(url, config);
    return response.data;
  }
};

export default apiService;