import axiosInstance from "../helpers/axios-config";

export const getDivisiones = async () => {
  try {
    const response = await axiosInstance.get("/divisiones");
    return response.data;
  } catch (error) {
    console.error("Error fetching divisiones:", error);
    throw error;
  }
}

export const createDivision = async (data) => {
    try {
      const response = await axiosInstance.post("/areas", data);
      return response.data;
    } catch (error) {
      console.error("Error creating area:", error);
      throw error;
    }
  }