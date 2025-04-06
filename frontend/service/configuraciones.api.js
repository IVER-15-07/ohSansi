import axiosInstance from "../helpers/axios-config";

export const getConfiguraciones = async () => {
  try {
    const response = await axiosInstance.get("/configuraciones");
    return response.data;
  } catch (error) {
    console.error("Error fetching configuraciones:", error);
    throw error;
  }
}
  
export const createConfiguracion = async (data) => {
  try {
    const response = await axiosInstance.post("/configuraciones", data);
    return response.data;
  } catch (error) {
    console.error("Error creating configuracion:", error);
    throw error;
  }
}
  