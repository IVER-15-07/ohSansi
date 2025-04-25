import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getEncargado } from "../../../service/encargados.api";
import { getOlimpiada } from "../../../service/olimpiadas.api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  console.log("idEncargado:", idEncargado, "idOlimpiada:", idOlimpiada);
  const [encargado, setEncargado] = useState(null);
  const [olimpiada, setOlimpiada] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    getEncargado(idEncargado)
      .then(res => {
        console.log("Encargado:", res);
        setEncargado(res);
      })
      .catch(err => console.error("Error al obtener encargado:", err));
  
    getOlimpiada(idOlimpiada)
      .then(res => {
        console.log("Olimpiada:", res);
        setOlimpiada(res);
      })
      .catch(err => console.error("Error al obtener olimpiada:", err));
  }, [idEncargado, idOlimpiada]);
  

  const generarPDF = () => {
    const input = pdfRef.current;
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("orden_de_pago.pdf");
    });
  };

  if (!encargado || !olimpiada) {
    return (
      <div>
        <h2>Cargando datos...</h2>
      </div>
    );
  }
  
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.toLocaleString('es-ES', { month: 'long' });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const año = fechaActual.getFullYear();

  return (
    <div className="p-4">
      <div ref={pdfRef} style={{ padding: "20px", backgroundColor: "#f5faff", border: "1px solid #ccc", borderRadius: "10px", maxWidth: "700px", margin: "auto" }}>
        <h3 style={{ textAlign: "center", fontWeight: "bold" }}>
          Universidad Mayor de San Simón<br />
          Facultad de Ciencias y Tecnología<br />
          Secretaría Administrativa<br />
          <span style={{ fontSize: "20px", display: "block", marginTop: "10px" }}>Orden de pago</span>
        </h3>

        <p><strong>Emitido por la Unidad:</strong> {olimpiada.nombre}</p>
        <p><strong>Señor:</strong> {encargado.nombre} {encargado.apellido} &nbsp;&nbsp;&nbsp;&nbsp; <strong>NIT/CI:</strong> {encargado.ci} </p>

        <table width="100%" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "5px" }}>Cantidad</th>
              <th style={{ border: "1px solid black", padding: "5px" }}>Concepto</th>
              <th style={{ border: "1px solid black", padding: "5px" }}>Precio por unidad</th>
              <th style={{ border: "1px solid black", padding: "5px" }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", padding: "5px" }}> </td>
              <td style={{ border: "1px solid black", padding: "5px" }}> </td>
              <td style={{ border: "1px solid black", padding: "5px" }}> </td>
              <td style={{ border: "1px solid black", padding: "5px" }}> </td>
            </tr>
          </tbody>
        </table>

        <p><strong>Nota:</strong> no vale como factura oficial</p>
        <p style={{ textAlign: "right" }}>[  ]</p>
        <p><strong>Son:</strong> _____________________________________ Bolivianos.</p>

        <p>Cochabamba, {dia} de {mesCapitalizado} de {año}</p>
        <p><strong>Firma del responsable:</strong> ___________________________</p>
        <p><strong>Observaciones:</strong></p>
        <div style={{ border: "1px solid black", height: "60px", marginBottom: "20px" }}></div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={generarPDF} style={{ padding: "10px 20px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Descargar como PDF
        </button>
      </div>
    </div>
  );
};

export default OrdenesDePago;
