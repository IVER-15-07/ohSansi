import axiosInstance from "../helpers/axios-config";

export const getFormulario = async ($idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/formulario/${$idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campos del formulario:", error);
    throw error;
  }
}