import axiosInstance from "../helpers/axios-config";

export const generarDatosDeOrden = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/generarDatosPago", data);
    return response.data;
  } catch (error) {
    console.error("Error al generar datos de la orden:", error);
    throw error;
  }
};

export const guardarOrdenPago = async (formData) => {
  try {
    const response = await axiosInstance.post("/pagos/guardarOrdenPago", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al guardar la orden de pago:", error);
    throw error;
  }
};

export const obtenerOrdenesDePago = async (idEncargado, idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/pagos/obtenerOrdenesDePago/${idEncargado}/${idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener órdenes de pago:", error);
    throw error;
  }
};

export const obtenerPagoAsociado = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/obtenerPagoAsociado", data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el pago asociado:", error);
    throw error;
  }
};

export const validarComprobantePago = async (data) => {
  try {
    const response = await axiosInstance.post("/pagos/validarComprobantePago", data, {
      headers: {
        "Content-Type": "multipart/form-data", // Necesario para enviar archivos
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al validar el comprobante de pago:", error);
    throw error;
  }
};