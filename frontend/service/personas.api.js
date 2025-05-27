import axiosInstance from "../helpers/axios-config";

export const getPersonaByCI = async (ci) => {
  try {
    const response = await axiosInstance.get(`/personas/ci/${ci}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching persona by CI:", error);
    throw error;
  }
}