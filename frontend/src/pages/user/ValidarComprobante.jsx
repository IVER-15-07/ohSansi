import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import SubirArchivo from "../../components/SubirArchivo";
import { obtenerPagoAsociado, validarComprobantePago } from "../../../service/pagos.api";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ValidarComprobante = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [olimpiada, setOlimpiada] = useState("");
  const [textoExtraido, setTextoExtraido] = useState("");
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [monto, setMonto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [pagoAsociado, setPagoAsociado] = useState(null);
  const inputRef = useRef(null);

  const extraerDatos = (texto) => {
    console.log("Texto extraído por OCR:", texto); // Depuración del texto extraído
    setTextoExtraido(texto);

    const nombreMatch = texto.match(/Recibido de:\s*(.*)/i);
    const olimpiadaMatch = texto.match(/Por concepto de:\s*(.*)/i);
    const montoMatch = texto.match(/Total:\s*(Bs)?\s*([\d.,]+)/i); // "Bs" ahora es opcional

    if (nombreMatch) {
      const nombreCompleto = nombreMatch[1].trim();
      const partes = nombreCompleto.split(" ");

      if (partes.length === 2) {
        setNombre(partes[0]);
        setApellido(partes[1]);
      } else if (partes.length === 3) {
        setNombre(partes[0]);
        setApellido(`${partes[1]} ${partes[2]}`);
      } else if (partes.length === 4) {
        setNombre(`${partes[0]} ${partes[1]}`);
        setApellido(`${partes[2]} ${partes[3]}`);
      } else {
        setNombre(nombreCompleto);
        setApellido("");
      }
    } else {
      setNombre("");
      setApellido("");
    }

    setOlimpiada(olimpiadaMatch ? olimpiadaMatch[1].trim() : "");
    setMonto(montoMatch ? montoMatch[2].replace(",", ".") : ""); // Captura el número directamente
    setError(!nombreMatch || !olimpiadaMatch || !montoMatch);
    setCargando(false);
  };

  const handleArchivo = async (e) => {
    const archivoSeleccionado = e.target.files[0];
    if (!archivoSeleccionado) return;

    setArchivo(archivoSeleccionado);
    setCargando(true);
    setNombre("");
    setApellido("");
    setOlimpiada("");
    setTextoExtraido("");
    setError(false);

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
      setError(true);
      setCargando(false);
    }
  };

  const buscarPagoAsociado = async () => {
    try {
      const data = { nombre, apellido, concepto: olimpiada, monto: parseFloat(monto) };
      console.log("Datos enviados al backend:", data); // Depuración
      const response = await obtenerPagoAsociado(data);
      setPagoAsociado(response.data);
    } catch (error) {
      console.error("Error al buscar el pago asociado:", error);
      setPagoAsociado(null);
    }
  };

  const verificarComprobante = async () => {
    try {
      const formData = new FormData();
      formData.append("id_pago", pagoAsociado.id_pago);
      formData.append("comprobante", archivo);
      formData.append("fecha_pago", new Date().toISOString().split("T")[0]);

      const response = await validarComprobantePago(formData);
      alert("Comprobante validado exitosamente.");
      console.log("Respuesta del servidor:", response);
    } catch (error) {
      console.error("Error al validar el comprobante:", error);
      alert("Error al validar el comprobante.");
    }
  };

  return (
    <div>
      <SubirArchivo
        nombreArchivo="Subir Comprobante"
        tipoArchivo="jpg"
        handleArchivo={handleArchivo}
        inputRef={inputRef}
      />
      <div>
        {cargando && <p>⏳ Procesando archivo, por favor espera...</p>}

        {!cargando && (
          <>
            <div className="mt-5">
              <h3>Datos extraídos del comprobante:</h3>
              <p><strong>Nombre:</strong> {nombre || "No disponible"}</p>
              <p><strong>Apellido:</strong> {apellido || "No disponible"}</p>
              <p><strong>Concepto:</strong> {olimpiada || "No disponible"}</p>
              <p><strong>Monto:</strong> {monto || "No disponible"} Bs</p>
            </div>

            {textoExtraido && (
              <button onClick={buscarPagoAsociado} className="btn btn-primary mt-3">
                Buscar Pago Asociado
              </button>
            )}

            {pagoAsociado ? (
              <div className="mt-5">
                <p><strong>ID del Pago:</strong> {pagoAsociado.id_pago}</p>
                <p><strong>Fecha Generado:</strong> {pagoAsociado.fecha_generado}</p>
                <p><strong>Monto:</strong> {pagoAsociado.monto} Bs</p>
                <p><strong>Concepto:</strong> {pagoAsociado.concepto}</p>
                <button onClick={verificarComprobante} className="btn btn-success mt-3">
                  Validar Comprobante
                </button>
              </div>
            ) : (
              textoExtraido && (
                <p className="text-red-500 mt-3">
                  ❌ No existen pagos asociados o el comprobante ya está validado.
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