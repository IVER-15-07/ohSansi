import axiosInstance from "../helpers/axios-config";

export const obtenerRegistros = async (idEncargado, idOlimpiada) => {
    try {
      const response = await axiosInstance.get(`/registros/${idEncargado}/${idOlimpiada}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener registros:", error);
      throw error;
    }
  };

export const enviarRegistrosLote = async (data) => {
    try {
        const formData = new FormData();
        formData.append("archivo", data.archivo);
        formData.append("id_encargado", data.id_encargado);
        formData.append("id_olimpiada", data.id_olimpiada);

        const response = await axiosInstance.post("/postulantes", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data; // Devuelve la respuesta del backend
    } catch (error) {
        if (error.response && error.response.data) {
            // Si el backend devuelve un arreglo de errores, lánzalo
            if (error.response.data.errors) {
                throw new Error(error.response.data.errors.join("\n"));
            }
            // Si solo hay un mensaje de error, lánzalo
            throw new Error(error.response.data.message);
        } else {
            // Devuelve un mensaje genérico si no hay respuesta del backend
            throw new Error("Error al enviar los registros. Intenta nuevamente.");
        }
    }
};