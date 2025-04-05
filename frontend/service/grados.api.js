import axiosInstance from "../helpers/axios-config";

export const getGrados = async () => {
  try {
    const response = await axiosInstance.get("/grados");
    return response.data;
  } catch (error) {
    console.error("Error fetching grados:", error);
    throw error;
  }
}