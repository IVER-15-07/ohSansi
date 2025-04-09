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

export const getAreasByOlimpiada = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/configuraciones/${idOlimpiada}/areas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching configuraciones:", error);
    throw error;
  }
}

export const getMapOfOlimpiada = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/configuraciones/${idOlimpiada}/mapa`);
    return response.data;
  } catch (error) {
    console.error("Error fetching configuraciones:", error);
    throw error;
  }
}

export const deleteConfigurationByOlimpiada = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.delete(`/configuraciones/${idOlimpiada}`);
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
  