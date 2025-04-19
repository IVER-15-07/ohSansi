import axiosInstance from "../helpers/axios-config";

export const getFormulario = async () => {
  try {
    const response = await axiosInstance.get("/formulario");
    return response.data;
  } catch (error) {
    console.error("Error fetching campos del formulario:", error);
    throw error;
  }
}