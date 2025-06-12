import axiosInstance from "../helpers/axios-config";

export const loginAdmin = async (usuario, password) => {
  const response = await axiosInstance.post('/admin/login', { usuario, password });
  // Guarda el token en localStorage o sessionStorage
  if (response.data.token) {
    localStorage.setItem('adminToken', response.data.token);
  }
  return response.data;
};
