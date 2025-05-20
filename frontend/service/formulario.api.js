import axiosInstance from "../helpers/axios-config";

export const getFormulario = async ($idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/formulario/${$idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campos del formulario:", error);
    throw error;
  }
}

export const createRegistro = async (data) => {
  try {
    const response = await axiosInstance.post("/registro", data);
    return response.data;
  } catch (error) {
    console.error("Error creating registro:", error);
    throw error;
  }
}

export const saveDatosInscripcion = async (data, $idRegistro) => {
  try {
    const response = await axiosInstance.post(`/formulario/guardar-datos-inscripcion/${$idRegistro}`, data);
    return response.data;
  } catch (error) {
    console.error("Error saving datos de inscripcion:", error);
    throw error;
  }
}