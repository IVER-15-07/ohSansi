import axiosInstance from "../helpers/axios-config";

export const getCatalogoCamposPostulante = async () => {
  try {
    const response = await axiosInstance.get(`/campos_postulante`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campos postulante:", error);
    throw error;
  }
}