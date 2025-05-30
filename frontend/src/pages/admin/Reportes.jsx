import React, { useEffect, useState } from "react";
import { getReportes } from "../../../service/Reporte.api";
import { useParams } from "react-router-dom";
import { getOlimpiadas } from "../../../service/olimpiadas.api";




const Reportes = () => {

  const [inscritos, setInscritos] = useState([]);
  const { idOlimpiada } = useParams();

useEffect(() => {
  if (!idOlimpiada) return;
  getReportes(idOlimpiada)
    .then((data) => {
      console.log("Respuesta API:", data);
      if (data.success) setInscritos(data.data);
    });
}, [idOlimpiada]);
  // Obtener todos los nombres de campos adicionales únicos
  const camposAdicionales = Array.from(
    new Set(
      inscritos.flatMap(
        (item) =>
          (item.postulante.datos_adicionales?.[0] || []).map((d) => d.campo) || []
      )
    )
  );





  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "#297fb9", marginBottom: 24 }}>Reporte de Inscripciones</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          borderCollapse: "collapse",
          width: "100%",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0001"
        }}>
          <thead>
            <tr style={{ background: "linear-gradient(90deg, #e74c3c 0%, #297fb9 100%)", color: "#fff" }}>
              <th style={{ padding: 10 }}>Nombre</th>
              <th style={{ padding: 10 }}>CI</th>
              <th style={{ padding: 10 }}>Área</th>
              <th style={{ padding: 10 }}>Categoría</th>
              {camposAdicionales.map((campo) => (
                <th key={campo} style={{ padding: 10 }}>{campo}</th>
              ))}
              <th style={{ padding: 10 }}>Tutor</th>
            </tr>
          </thead>
          <tbody>
            {inscritos.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#f7fafd" : "#fff" }}>
                <td style={{ padding: 8 }}>{item.postulante.nombres} {item.postulante.apellidos}</td>
                <td style={{ padding: 8 }}>{item.postulante.ci}</td>
                <td style={{ padding: 8 }}>{item.postulante.area_categoria.area}</td>
                <td style={{ padding: 8 }}>{item.postulante.area_categoria.categoria}</td>
                {camposAdicionales.map((campo) => {
                  // El endpoint devuelve datos_adicionales como un array de arrays, por eso el [0]
                  const datos = item.postulante.datos_adicionales?.[0] || [];
                  const dato = datos.find((d) => d.campo === campo);
                  return <td key={campo} style={{ padding: 8 }}>{dato ? dato.valor : ""}</td>;
                })}
                <td style={{ padding: 8 }}>
                  {item.tutor
                    ? `${item.tutor.nombres} ${item.tutor.apellidos}`
                    : "Sin tutor"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reportes
