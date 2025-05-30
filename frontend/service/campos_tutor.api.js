import axiosInstance from "../helpers/axios-config";

export const getCatalogoCamposTutor= async () => {
    try {
        const response = await axiosInstance.get(`/campos_tutor`);
        return response.data;
    } catch (error) {
        console.error("Error fetching campos tutor:", error);
        throw error;
    }
}