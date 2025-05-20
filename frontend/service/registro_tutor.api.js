import axiosInstance  from "../helpers/axios-config";

export const getRegistrosTutorPorRegistro = async (idRegistro) => {
  try {
    const response = await axiosInstance.get(`/registros_tutores/${idRegistro}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los registros de tutores dado el reigstro:", error);
    throw error;
  }
};

export const createRegistroTutor = async (data) => {
  try {
    const response = await axiosInstance.post("/registros_tutores", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el registro de tutor:", error);
    throw error;
  }
}

export const deleteRegistroTutor = async (idRegistroTutor) => {
  try {
    const response = await axiosInstance.delete(`/registros_tutores/${idRegistroTutor}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el registro de tutor:", error);
    throw error;
  }
}