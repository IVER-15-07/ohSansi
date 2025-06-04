import axiosInstance from "../helpers/axios-config";

export const getOpcionesCampoPostulante = async (idCampoPostulante) => {
  try {
    const response = await axiosInstance.get(`/opciones_campo_postulante/agrupadas/${idCampoPostulante}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching opciones de campo postulante:", error);
    throw error;
  }
}