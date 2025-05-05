import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import SubirArchivo from "../../components/SubirArchivo";
import { obtenerPagoAsociado, validarComprobantePago } from "../../../service/pagos.api";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ValidarComprobante = () => {
  const [idOrden, setIdOrden] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [monto, setMonto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [pagoAsociado, setPagoAsociado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const inputRef = useRef(null);

  const extraerDatos = (texto) => {
    console.log("Texto extraído por OCR:", texto); // Depuración del texto extraído

    // Extraer el ID de la orden de pago (Aclaración OP XX)
    const idOrdenMatch = texto.match(/Aclaración: OP\s*(\d+)/i);
    setIdOrden(idOrdenMatch ? idOrdenMatch[1] : "");

    // Extraer el nombre completo (Recibido de:)
    const nombreMatch = texto.match(/Recibido de:\s*(.*)/i);
    setNombreCompleto(nombreMatch ? nombreMatch[1].trim() : "");

    // Extraer el monto (Total: Bs XX.XX)
    const montoMatch = texto.match(/Total:\s*(Bs)?\s*([\d.,]+)/i);
    setMonto(montoMatch ? montoMatch[2].replace(",", ".") : "");

    // Mostrar error si falta algún dato
    if (!idOrdenMatch || !nombreMatch || !montoMatch) {
      setMensajeError("No se pudieron extraer todos los datos necesarios del comprobante.");
    } else {
      setMensajeError("");
    }

    setCargando(false);
  };

  const handleArchivo = async (e) => {
    const archivoSeleccionado = e.target.files[0];
    if (!archivoSeleccionado) return;

    setArchivo(archivoSeleccionado);
    setCargando(true);
    setIdOrden("");
    setNombreCompleto("");
    setMonto("");
    setMensajeError("");
    setPagoAsociado(null);

    const tipo = archivoSeleccionado.type;

    try {
      if (tipo.includes("image")) {
        const image = URL.createObjectURL(archivoSeleccionado);
        const result = await Tesseract.recognize(image, "spa");
        extraerDatos(result.data.text);
      } else if (tipo === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let textoFinal = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/png");
            const ocr = await Tesseract.recognize(dataUrl, "spa");
            textoFinal += ocr.data.text + "\n";
          }

          extraerDatos(textoFinal);
        };
        reader.readAsArrayBuffer(archivoSeleccionado);
      } else {
        alert("Tipo de archivo no soportado.");
        setCargando(false);
      }
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      setMensajeError("Error al procesar el archivo.");
      setCargando(false);
    }
  };

  const buscarPagoAsociado = async () => {
    try {
      const data = { id: parseInt(idOrden), nombre_completo: nombreCompleto, monto: parseFloat(monto) };
      console.log("Datos enviados al backend:", data); // Depuración
      const response = await obtenerPagoAsociado(data);
      setPagoAsociado(response.data);
      setMensajeError("");
    } catch (error) {
      console.error("Error al buscar el pago asociado:", error);
      setPagoAsociado(null);
      setMensajeError("No se encontraron pagos asociados.");
    }
  };

  const verificarComprobante = async () => {
    try {
      const formData = new FormData();
      formData.append("id_pago", pagoAsociado.id_pago);
      formData.append("comprobante", archivo);

      const response = await validarComprobantePago(formData);
      alert("Comprobante validado exitosamente.");
      console.log("Respuesta del servidor:", response);
    } catch (error) {
      console.error("Error al validar el comprobante:", error);
      alert("Error al validar el comprobante.");
    }
  };

  return (
    <div className="p-6">
      <SubirArchivo
        nombreArchivo="Subir Comprobante"
        tipoArchivo="jpg, pdf"
        handleArchivo={handleArchivo}
        inputRef={inputRef}
      />

      <div className="mt-6">
        {cargando && <p className="text-blue-500">⏳ Procesando archivo, por favor espera...</p>}

        {!cargando && (
          <>
            {mensajeError && <p className="text-red-500">{mensajeError}</p>}

            <div className="mt-5">
              <h3 className="font-bold">Datos extraídos del comprobante:</h3>
              <p><strong>ID Orden:</strong> {idOrden || "No disponible"}</p>
              <p><strong>Nombre del Encargado:</strong> {nombreCompleto || "No disponible"}</p>
              <p><strong>Monto:</strong> {monto || "No disponible"} Bs</p>
            </div>

            {idOrden && nombreCompleto && monto && (
              <button
                onClick={buscarPagoAsociado}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Buscar Pago Asociado
              </button>
            )}

            {pagoAsociado ? (
              <div className="mt-5">
                <h3 className="font-bold">Pago Asociado:</h3>
                <p><strong>ID del Pago:</strong> {pagoAsociado.id_pago}</p>
                <p><strong>Monto:</strong> {pagoAsociado.monto} Bs</p>
                <p><strong>Concepto:</strong> {pagoAsociado.concepto}</p>
                <p><strong>Fecha Generado:</strong> {pagoAsociado.fecha_generado}</p>
                <button
                  onClick={verificarComprobante}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Validar
                </button>
              </div>
            ) : (
              mensajeError && (
                <p className="text-red-500 mt-3">
                  ❌ {mensajeError}
                </p>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ValidarComprobante;