import axiosInstance from "../helpers/axios-config";

export const saveDatosTutor = async (data) => {
    try {
        const response = await axiosInstance.post("/datos_tutor", data);
        return response.data;
    } catch (error) {
        console.error("Error saving datos tutor:", error);
        throw error;
    }
}