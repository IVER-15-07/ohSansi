import axiosInstance from "../helpers/axios-config";

/**
 * Servicio para guardar un pago.
 * @param {FormData} data - Datos del pago (monto, fecha_generado, concepto, orden).
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const guardarPago = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/guardarPago", data, {
      headers: {
        "Content-Type": "multipart/form-data", // Necesario para enviar archivos
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al guardar el pago:", error);
    throw error;
  }
};

/**
 * Servicio para obtener el ID de un pago.
 * @param {Object} data - Datos del pago (monto, fecha_generado, concepto).
 * @returns {Promise<Object>} Respuesta del servidor con el ID del pago.
 */
export const obtenerIdPago = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/obtenerId", data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el ID del pago:", error);
    throw error;
  }
};

/**
 * Servicio para asociar un pago a los registros de un encargado.
 * @param {Object} data - Datos necesarios (id_encargado, id_pago).
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const agregarPago = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/agregar", data);
    return response.data;
  } catch (error) {
    console.error("Error al asociar el pago a los registros:", error);
    throw error;
  }
};

export const obtenerOrdenDePago = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/obtenerOrden", data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las órdenes de pago:", error);
    throw error;
  }
};