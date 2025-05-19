import axiosInstance from "../helpers/axios-config";

export const saveDatosPostulante = async (data) => {
    try {
        const response = await axiosInstance.post("/datos_postulante", data);
        return response.data;
    } catch (error) {
        console.error("Error saving datos postulante:", error);
        throw error;
    }
}