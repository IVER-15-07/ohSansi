import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import SubirArchivo from "../../components/ui/SubirArchivo";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import { obtenerPagoAsociado, validarComprobantePago } from "../../../service/pagos.api";
import { FileText, FileCheck2, AlertCircle, CheckCircle, Upload, Search } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ValidarComprobante = () => {
  const [idOrden, setIdOrden] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [monto, setMonto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [pagoAsociado, setPagoAsociado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const inputRef = useRef(null);

  // Ejecutar automáticamente buscarPagoAsociado cuando los datos estén completos
  useEffect(() => {
    if (idOrden && nombreCompleto && monto) {
      buscarPagoAsociado();
    }
  }, [idOrden, nombreCompleto, monto]);

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
        setMensajeError("Tipo de archivo no soportado. Solo se permiten archivos PDF, JPG, JPEG y PNG.");
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
    // Mostrar el mensaje del backend si existe
    if (error.response && error.response.data && error.response.data.message) {
      setMensajeError(error.response.data.message);
    } else {
      setMensajeError("Ocurrió un error al buscar el pago asociado.");
    }
  }
};

  const verificarComprobante = async () => {
    setValidating(true);
    try {
      const formData = new FormData();
      formData.append("id_pago", pagoAsociado.id_pago);
      formData.append("comprobante", archivo);

      const response = await validarComprobantePago(formData);
      setAlertMessage("Comprobante validado exitosamente.");
      setShowSuccessAlert(true);
      setShowConfirmModal(false);
      console.log("Respuesta del servidor:", response);
    } catch (error) {
      console.error("Error al validar el comprobante:", error);
      setAlertMessage("Error al validar el comprobante. Por favor, inténtelo nuevamente.");
      setShowErrorAlert(true);
      setShowConfirmModal(false);
    } finally {
      setValidating(false);
    }
  };

  const handleValidateClick = () => {
    setShowConfirmModal(true);
  };

  const handleFileValidationError = (errorMessage) => {
    setMensajeError(errorMessage);
    // Auto-limpiar después de un tiempo
    setTimeout(() => {
      setMensajeError("");
    }, 6000);
  };

  return (
    <div className="p-6">
      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert
          variant="success"
          title="Validación Exitosa"
          autoClose={true}
          autoCloseDelay={6000}
          onClose={() => setShowSuccessAlert(false)}
          className="mb-6"
        >
          {alertMessage}
        </Alert>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <Alert
          variant="error"
          title="Error de Validación"
          autoClose={true}
          autoCloseDelay={6000}
          onClose={() => setShowErrorAlert(false)}
          className="mb-6"
        >
          {alertMessage}
        </Alert>
      )}

      <SubirArchivo
        nombreArchivo={archivo ? archivo.name : "Subir Comprobante (JPG, PNG)"}
        tipoArchivo="comprobante"
        handleArchivo={handleArchivo}
        inputRef={inputRef}
        onFileValidationError={handleFileValidationError}
        acceptedFormats={['jpg', 'jpeg', 'png']}
        acceptedMimeTypes={['image/jpeg', 'image/jpg', 'image/png']}
        acceptAttribute=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
        maxFileSize={15 * 1024 * 1024} // 15MB para imágenes
        allowEdit={true}
      />

      <div className="mt-6">
        {cargando && (
          <p className="text-blue-500 flex items-center gap-2">
            <Upload className="animate-spin w-4 h-4" />
            Procesando archivo, por favor espera...
          </p>
        )}

        {!cargando && (
          <>
            {mensajeError && (
              <p className="text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {mensajeError}
              </p>
            )}

            <div className="mt-5 space-y-1 text-gray-700">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Datos extraídos del comprobante:
              </h3>
              <p><strong>ID Orden:</strong> {idOrden || "Sin datos"}</p>
              <p><strong>Nombre del Encargado:</strong> {nombreCompleto || "Sin datos"}</p>
              <p><strong>Monto:</strong> {monto || "Sin datos"} </p>
            </div>

            {pagoAsociado ? (
              <div className="mt-5 space-y-1 text-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-green-600" />
                  Pago Asociado:
                </h3>
                <p><strong>ID del Pago:</strong> {pagoAsociado.id_pago}</p>
                <p><strong>Monto:</strong> {pagoAsociado.monto} Bs</p>
                <p><strong>Concepto:</strong> {pagoAsociado.concepto}</p>
                <p><strong>Fecha Generado:</strong> {pagoAsociado.fecha_generado}</p>
                <button
                  onClick={handleValidateClick}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Validar Comprobante
                </button>
              </div>
            ) : (
              mensajeError && (
                <p className="text-red-500 mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {mensajeError}
                </p>
              )
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={verificarComprobante}
        variant="warning"
        title="Confirmar Validación"
        message="¿Está seguro que desea validar este comprobante? Esta acción confirmará el pago asociado."
        confirmText="Validar"
        cancelText="Cancelar"
        isLoading={validating}
      />
    </div>
  );
};

export default ValidarComprobante;