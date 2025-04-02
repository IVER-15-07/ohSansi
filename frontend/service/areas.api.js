import axiosInstance from "../helpers/axios-config";

export const getAreas = async () => {
  try {
    const response = await axiosInstance.get("/areas");
    return response.data;
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw error;
  }
}

export const createArea = async (data) => {
  try {
    const response = await axiosInstance.post("/areas", data);
    return response.data;
  } catch (error) {
    console.error("Error creating area:", error);
    throw error;
  }
}
