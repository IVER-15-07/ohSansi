import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import SubirArchivo from "../../components/SubirArchivo";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ValidarComprobante = () => {
  const [nombre, setNombre] = useState("");
  const [olimpiada, setOlimpiada] = useState("");
  const [textoExtraido, setTextoExtraido] = useState("");
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [monto, setMonto] = useState("");
  const inputRef = useRef(null);

  const extraerDatos = (texto) => {
    setTextoExtraido(texto);
  
    const nombreMatch = texto.match(/Recibido de:\s*(.*)/i);
    const olimpiadaMatch = texto.match(/OLIMPIADA DE CIENCIAS:\s*(.*)/i);
    const montoMatch = texto.match(/Total:\s*Bs\s+([\d.,]+)/i);

    setNombre(nombreMatch ? nombreMatch[1].trim() : "");
    setOlimpiada(olimpiadaMatch ? olimpiadaMatch[1].trim() : "");
    setMonto(montoMatch ? montoMatch[1].replace(",", ".") : "");
    setError(!nombreMatch || !olimpiadaMatch || !montoMatch);
    setCargando(false);
  };
  
  const handleArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setCargando(true);
    setNombre("");
    setOlimpiada("");
    setTextoExtraido("");
    setError(false);

    const tipo = archivo.type;

    if (tipo.includes("image")) {
      const image = URL.createObjectURL(archivo);
      const result = await Tesseract.recognize(image, "spa");
      extraerDatos(result.data.text);
    }

    else if (tipo === "application/pdf") {
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
      reader.readAsArrayBuffer(archivo);
    }

    else if (tipo === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
        extraerDatos(result.value);
      };
      reader.readAsArrayBuffer(archivo);
    }

    else {
      alert("Tipo de archivo no soportado.");
      setCargando(false);
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
        {cargando && (
          <div className="my-5 font-bold text-gray-600">
            ⏳ Procesando archivo, por favor espera...
          </div>
        )}

        {!cargando && (
          <>
            {error && (
              <p className="text-red-500 mt-2">
                ❌ No se encontraron los datos requeridos en el comprobante.
              </p>
            )}

            {nombre && (
              <p><strong>Nombre completo:</strong> {nombre}</p>
            )}

            {olimpiada && (
              <p><strong>Olimpiada:</strong> {olimpiada}</p>
            )}

            {monto && (
                <p><strong>Monto pagado:</strong> {monto} Bs</p>
            )}

            {textoExtraido && (
              <details className="mt-5 text-left">
                <summary className="cursor-pointer">Ver texto completo extraído</summary>
                <pre className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap">
                  {textoExtraido}
                </pre>
              </details>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default ValidarComprobante;
