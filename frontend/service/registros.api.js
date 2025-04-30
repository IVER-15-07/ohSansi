import axiosInstance from "../helpers/axios-config";

export const enviarRegistrosLote = async (data) => {
    try {
        const response = await axiosInstance.post("/registro_lote", data);
        console.log("Respuesta del backend:", response.data); // Agrega este log
        return response.data;
    } catch (error) {
        console.error("Error al enviar registros en lote:", error);
        throw error;
    }
}