import axiosInstance from "../helpers/axios-config";

export const getReportes = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/reporte_inscritos/${idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reportes:", error);
    throw error;
  }
};