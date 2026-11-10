import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Terjadi kesalahan pada koneksi atau sistem.";

    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      message = "Gagal terhubung ke backend API. Pastikan server backend aktif di port 3001 dan database MySQL XAMPP berjalan.";
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);
