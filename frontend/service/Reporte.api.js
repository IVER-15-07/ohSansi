import axiosInstance from "../helpers/axios-config";

export const getReportes = async (idOlimpiada, area = "", categoria = "") => {
  let url = `/reporte_inscritos/${idOlimpiada}`;
  const params = [];
  if (area) params.push(`area=${encodeURIComponent(area)}`);
  if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
  if (params.length > 0) {
    url = `/reporte/areas/${idOlimpiada}?${params.join("&")}`;
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

