import axiosInstance from "../helpers/axios-config";

export const createArea = async (data) => {
  try {
    const response = await axiosInstance.post("/encargados", data);
    return response.data;
  } catch (error) {
    console.error("Error creating encargado:", error);
    throw error;
  }
}