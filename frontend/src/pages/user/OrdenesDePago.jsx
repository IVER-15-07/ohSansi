import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getEncargado, obtenerConteoRegistrosPorEncargado } from "../../../service/encargados.api";
import { getOlimpiada } from "../../../service/olimpiadas.api";
import { guardarPago, obtenerIdPago, agregarPago, obtenerOrdenDePago } from "../../../service/pagos.api"; // Importar el nuevo servicio
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toWords } from "number-to-words";

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const [encargado, setEncargado] = useState(null);
  const [olimpiada, setOlimpiada] = useState(null);
  const [conteoRegistros, setConteoRegistros] = useState(null);
  const [sinRegistros, setSinRegistros] = useState(false); // Estado para manejar si no hay registros
  const [ordenesDePago, setOrdenesDePago] = useState([]); // Estado para almacenar las órdenes de pago
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
  
    obtenerConteoRegistrosPorEncargado(idEncargado, idOlimpiada)
      .then(res => {
        console.log("Conteo de registros:", res);
        if (res.conteo_registros === 0) {
          setSinRegistros(true); // Si no hay registros, actualiza el estado
          obtenerOrdenDePago({ id_encargado: idEncargado }) // Llamar al endpoint para obtener órdenes de pago
            .then((response) => {
              console.log("Órdenes de pago obtenidas:", response);
              setOrdenesDePago(response.data); // Guardar las órdenes en el estado
            })
            .catch((error) => {
              console.error("Error al obtener órdenes de pago:", error);
            });
        } else {
          setConteoRegistros(res);
        }
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

      // Descargar el PDF generado
      pdf.save("orden_de_pago.pdf");

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

      alert("PDF generado, descargado y pago registrado exitosamente.");
    } catch (error) {
      console.error("Error al generar el PDF o registrar el pago:", error);
      alert("Ocurrió un error al generar el PDF o registrar el pago.");
    }
  };

  if (sinRegistros) {
    return (
      <div>
        <h2>No existen registros pendientes para generar una orden de pago.</h2>
        {ordenesDePago.length > 0 ? (
          <div>
            <h3>Órdenes de Pago Existentes:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Monto</th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Fecha Generado</th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Concepto</th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Orden</th>
                </tr>
              </thead>
              <tbody>
                {ordenesDePago.map((orden) => (
                  <tr key={orden.id_pago}>
                    <td style={{ border: "1px solid black", padding: "5px" }}>{orden.monto} Bs.</td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>{orden.fecha_generado}</td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>{orden.concepto}</td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>
                      <a href={orden.orden} target="_blank" rel="noopener noreferrer">
                        Descargar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No se encontraron órdenes de pago existentes.</p>
        )}
      </div>
    );
  }

  if (!encargado || !olimpiada || !conteoRegistros) {
    return (
      <div>
        <h2>Cargando datos...</h2>
      </div>
    );
  }

  const totalRegistros = conteoRegistros.conteo_registros;
  const costoPorUnidad = olimpiada.costo;
  const importeTotal = (totalRegistros * costoPorUnidad).toFixed(2);
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
        className="p-6 bg-blue-50 border border-gray-300 rounded-lg max-w-3xl mx-auto"
      >
        <h3 className="text-center font-bold text-lg">
          Universidad Mayor de San Simón
          <br />
          Facultad de Ciencias y Tecnología
          <br />
          Secretaría Administrativa
          <br />
          <span className="text-xl block mt-2">Orden de pago</span>
        </h3>
  
        <p className="mt-4">
          <strong>Emitido por la Unidad:</strong> {olimpiada.nombre}
        </p>
        <p className="mt-2">
          <strong>Señor:</strong> {encargado.nombre} {encargado.apellido}{" "}
          <span className="ml-8">
            <strong>NIT/CI:</strong> {encargado.ci}
          </span>
        </p>
  
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-black p-2">Cantidad</th>
              <th className="border border-black p-2">Concepto</th>
              <th className="border border-black p-2">Precio por unidad</th>
              <th className="border border-black p-2">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">
                {totalRegistros}
              </td>
              <td className="border border-black p-2">
                DECANATO OLIMPIADA DE CIENCIAS {olimpiada.nombre}
                <br />
                Detalle: Inscritos en las áreas de {detalleAreas}
              </td>
              <td className="border border-black p-2 text-center">
                {costoPorUnidad} Bs.
              </td>
              <td className="border border-black p-2 text-center">
                {importeTotal} Bs.
              </td>
            </tr>
          </tbody>
        </table>
  
        <p className="mt-4">
          <strong>Nota:</strong> no vale como factura oficial
        </p>
        <p className="text-right">[ ]</p>
        <p className="mt-2">
          <strong>Son:</strong> {importeEnLiteral} Bolivianos.
        </p>
  
        <p className="mt-4">
          Cochabamba, {dia} de {mesCapitalizado} de {año}
        </p>
        <p className="mt-4">
          <strong>Firma del responsable:</strong> ___________________________
        </p>
        <p className="mt-4">
          <strong>Observaciones:</strong>
        </p>
        <div className="border border-black h-16 mb-5"></div>
      </div>
  
      <div className="text-center mt-6">
        <button
          onClick={generarPDF}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Generar Orden de Pago
        </button>
      </div>
    </div>
  );
};

export default OrdenesDePago;