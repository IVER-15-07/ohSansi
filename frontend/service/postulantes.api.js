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

export const createPostulante = async (data) => {
  try {
    const response = await axiosInstance.post("/postulante_nuevo", data);
    return response.data;
  } catch (error) {
    console.error("Error creating postulante:", error);
    throw error;
  }
}