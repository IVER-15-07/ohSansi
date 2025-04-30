import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getEncargado, obtenerConteoRegistrosPorEncargado } from "../../../service/encargados.api";
import { getOlimpiada } from "../../../service/olimpiadas.api";
import { guardarPago, obtenerIdPago, agregarPago } from "../../../service/pagos.api"; // Importar los servicios de pagos
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toWords } from "number-to-words";

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const [encargado, setEncargado] = useState(null);
  const [olimpiada, setOlimpiada] = useState(null);
  const [conteoRegistros, setConteoRegistros] = useState(null);
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
  
    obtenerConteoRegistrosPorEncargado(idEncargado)
      .then(res => {
        console.log("Conteo de registros:", res);
        setConteoRegistros(res);
      })
      .catch(err => console.error("Error al obtener conteo de registros:", err));
  }, [idEncargado, idOlimpiada]);

  const traducirNumeroALiteral = (numero) => {
    const palabrasEnIngles = toWords(numero).toLowerCase();
    const traducciones = {
      zero: "cero",
      one: "uno",
      two: "dos",
      three: "tres",
      four: "cuatro",
      five: "cinco",
      six: "seis",
      seven: "siete",
      eight: "ocho",
      nine: "nueve",
      ten: "diez",
      eleven: "once",
      twelve: "doce",
      thirteen: "trece",
      fourteen: "catorce",
      fifteen: "quince",
      sixteen: "dieciséis",
      seventeen: "diecisiete",
      eighteen: "dieciocho",
      nineteen: "diecinueve",
      twenty: "veinte",
      thirty: "treinta",
      forty: "cuarenta",
      fifty: "cincuenta",
      sixty: "sesenta",
      seventy: "setenta",
      eighty: "ochenta",
      ninety: "noventa",
      hundred: "cien",
      thousand: "mil",
      million: "millón",
      billion: "mil millones",
    };

    const palabrasEnEspañol = palabrasEnIngles
      .split(" ")
      .map((palabra) => traducciones[palabra] || palabra)
      .join(" ");

    return palabrasEnEspañol.charAt(0).toUpperCase() + palabrasEnEspañol.slice(1);
  };

  const generarPDF = async () => {
    try {
      const input = pdfRef.current;

      // Generar el PDF
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Convertir el PDF a un archivo Blob
      const pdfBlob = pdf.output("blob");

      // Crear un objeto FormData para enviar el PDF al servidor
      const formData = new FormData();
      formData.append("monto", importeTotal);
      formData.append("fecha_generado", new Date().toISOString().split("T")[0]); // Formato AAAA-MM-DD
      formData.append("concepto", `DECANATO OLIMPIADA DE CIENCIAS ${olimpiada.nombre}`);
      formData.append("orden", new File([pdfBlob], "orden_de_pago.pdf", { type: "application/pdf" }));

      // Guardar el pago en el servidor
      const guardarPagoResponse = await guardarPago(formData);
      console.log("Pago guardado:", guardarPagoResponse);

      // Obtener el ID del pago recién creado
      const obtenerIdResponse = await obtenerIdPago({
        monto: importeTotal,
        fecha_generado: new Date().toISOString().split("T")[0],
        concepto: `DECANATO OLIMPIADA DE CIENCIAS ${olimpiada.nombre}`,
      });
      console.log("ID del pago obtenido:", obtenerIdResponse);

      const idPago = obtenerIdResponse.data.id;

      // Asociar el ID del pago a los registros del encargado
      const agregarPagoResponse = await agregarPago({
        id_encargado: idEncargado,
        id_pago: idPago,
      });
      console.log("Pago asociado a los registros:", agregarPagoResponse);

      alert("PDF generado y pago registrado exitosamente.");
    } catch (error) {
      console.error("Error al generar el PDF o registrar el pago:", error);
      alert("Ocurrió un error al generar el PDF o registrar el pago.");
    }
  };

  if (!encargado || !olimpiada || !conteoRegistros) {
    return (
      <div>
        <h2>Cargando datos...</h2>
      </div>
    );
  }

  const totalRegistros = conteoRegistros.conteo_registros;
  const costoPorUnidad = olimpiada.costo;
  const importeTotal = totalRegistros * costoPorUnidad;
  const detalleAreas = Object.entries(conteoRegistros.areas)
    .map(([area, cantidad]) => `${area}: ${cantidad}`)
    .join(", ");

  const importeEnLiteral = traducirNumeroALiteral(importeTotal);

  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.toLocaleString("es-ES", { month: "long" });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const año = fechaActual.getFullYear();

  return (
    <div className="p-4">
      <div
        ref={pdfRef}
        style={{
          padding: "20px",
          backgroundColor: "#f5faff",
          border: "1px solid #ccc",
          borderRadius: "10px",
          maxWidth: "700px",
          margin: "auto",
        }}
      >
        <h3 style={{ textAlign: "center", fontWeight: "bold" }}>
          Universidad Mayor de San Simón
          <br />
          Facultad de Ciencias y Tecnología
          <br />
          Secretaría Administrativa
          <br />
          <span
            style={{
              fontSize: "20px",
              display: "block",
              marginTop: "10px",
            }}
          >
            Orden de pago
          </span>
        </h3>

        <p>
          <strong>Emitido por la Unidad:</strong> {olimpiada.nombre}
        </p>
        <p>
          <strong>Señor:</strong> {encargado.nombre} {encargado.apellido}{" "}
          &nbsp;&nbsp;&nbsp;&nbsp; <strong>NIT/CI:</strong> {encargado.ci}{" "}
        </p>

        <table
          width="100%"
          style={{ borderCollapse: "collapse", marginTop: "10px" }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "5px" }}>
                Cantidad
              </th>
              <th style={{ border: "1px solid black", padding: "5px" }}>
                Concepto
              </th>
              <th style={{ border: "1px solid black", padding: "5px" }}>
                Precio por unidad
              </th>
              <th style={{ border: "1px solid black", padding: "5px" }}>
                Importe
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                {totalRegistros}
              </td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                DECANATO OLIMPIADA DE CIENCIAS {olimpiada.nombre}
                <br />
                Detalle: Inscritos en las áreas de {detalleAreas}
              </td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                {costoPorUnidad} Bs.
              </td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                {importeTotal} Bs.
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>Nota:</strong> no vale como factura oficial
        </p>
        <p style={{ textAlign: "right" }}>[ ]</p>
        <p>
          <strong>Son:</strong> {importeEnLiteral} Bolivianos.
        </p>

        <p>
          Cochabamba, {dia} de {mesCapitalizado} de {año}
        </p>
        <p>
          <strong>Firma del responsable:</strong> ___________________________
        </p>
        <p>
          <strong>Observaciones:</strong>
        </p>
        <div
          style={{
            border: "1px solid black",
            height: "60px",
            marginBottom: "20px",
          }}
        ></div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={generarPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generar PDF
        </button>
      </div>
    </div>
  );
};

export default OrdenesDePago;