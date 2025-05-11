import axiosInstance from "../helpers/axios-config";

export const getPostulanteByCI = async ($ci) => {
  try {
    const response = await axiosInstance.get(`/postulantes/ci/${$ci}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching postulante por ci:", error);
    throw error;
  }
}
