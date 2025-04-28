import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

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
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <div style={{ width: "100%", maxWidth: "600px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "20px" }}>Validar Comprobante de Pago</h2>

        <button
          onClick={() => inputRef.current.click()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          Subir comprobante (.docx, .pdf, .jpg, .png)
        </button>

        <input
          type="file"
          accept=".docx,.pdf,.jpg,.jpeg,.png"
          onChange={handleArchivo}
          ref={inputRef}
          style={{ display: "none" }}
        />

        {cargando && (
          <div style={{ margin: "20px", fontWeight: "bold", color: "#555" }}>
            ⏳ Procesando archivo, por favor espera...
          </div>
        )}

        {!cargando && (
          <>
            {error && (
              <p style={{ color: "red", marginTop: "10px" }}>
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
              <details style={{ marginTop: "20px", textAlign: "left" }}>
                <summary style={{ cursor: "pointer" }}>Ver texto completo extraído</summary>
                <pre style={{ background: "#f4f4f4", padding: "10px", whiteSpace: "pre-wrap" }}>
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
