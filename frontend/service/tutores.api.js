import axiosInstance from "../helpers/axios-config";

export const getTutor = async ($ci) => {
  try {
    const response = await axiosInstance.get(`/tutores/${$ci}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tutor:", error);
    throw error;
  }
}

export const getRolesTutor = async () => {
  try {
    const response = await axiosInstance.get(`/roles-tutor`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tutor:", error);
    throw error;
  }
}

export const createTutor = async (data) => {
  try{
    const response = await axiosInstance.post("/tutores", data);
    return response.data;
  }catch(error){
    console.error("Error creating tutor:", error);
    throw error;
  }
}