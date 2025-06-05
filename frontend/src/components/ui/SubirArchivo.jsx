import { FileUp, CheckCircle2, Edit3 } from "lucide-react";
import { memo, useState } from "react";
import Alert from "./Alert";
import Button from "./Button";
import EstadoArchivo from "./EstadoArchivo";

/**
 * SubirArchivo - Componente para subir archivos con validación
 * 
 * @param {string} nombreArchivo - Nombre del archivo o mensaje por defecto
 * @param {function} handleArchivo - Función para manejar el archivo seleccionado
 * @param {object} inputRef - Referencia al input de archivo
 * @param {string} id - ID único para el input
 * @param {array} acceptedFormats - Formatos aceptados ['pdf', 'jpg']
 * @param {string} acceptAttribute - Atributo accept ".pdf,.jpg"
 * @param {number} maxFileSize - Tamaño máximo en bytes (10MB por defecto)
 * @param {boolean} allowEdit - Permitir editar archivo ya subido
 * @param {boolean} hasExistingFile - Si hay archivo existente
 * @param {boolean} showFileStatus - Mostrar estado del archivo
 * @param {string} currentFileName - Nombre del archivo actual
 * @param {object} newFile - Nuevo archivo seleccionado
 * @param {function} onCancelFile - Cancelar selección
 * @param {string} baseUrl - URL base para descargas
 * @param {string} fileTypeMessage - Tipo de archivo para mensajes
 */
const SubirArchivo = memo(({ 
  nombreArchivo, 
  handleArchivo, 
  inputRef, 
  id, 
  acceptedFormats = ['pdf'],
  acceptAttribute = ".pdf",
  maxFileSize = 10 * 1024 * 1024,
  allowEdit = true,
  hasExistingFile = false,
  showFileStatus = false,
  currentFileName = '',
  newFile = null,
  onCancelFile,
  baseUrl = 'http://127.0.0.1:8000/storage',
  fileTypeMessage = 'archivo'
}) => {
  const [fileError, setFileError] = useState(null);

  // Verificar si hay un archivo válido subido
  const tieneArchivoValido = () => {
    if (typeof hasExistingFile === 'boolean') return hasExistingFile;
    if (!nombreArchivo?.trim()) return false;
    
    const nombre = nombreArchivo.trim();
    
    // Patrones que indican que NO hay archivo
    if (/^Subir archivo|^Ningún archivo|^Seleccionar|^No hay archivo/i.test(nombre)) return false;
    if (nombre.length < 4) return false;
    
    // Verificar que tenga extensión válida
    const match = nombre.match(/\.([a-zA-Z0-9]{1,6})$/);
    if (!match) return false;
    
    const extension = match[1].toLowerCase();
    return acceptedFormats.some(format => format.toLowerCase() === extension);
  };

  // Validar archivo seleccionado
  const validarArchivo = (archivo) => {
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    if (!acceptedFormats.includes(extension)) {
      return `Formato no válido. Solo se permiten: ${acceptedFormats.map(f => f.toUpperCase()).join(', ')}`;
    }
    
    if (archivo.size > maxFileSize) {
      const maxMB = Math.round(maxFileSize / (1024 * 1024));
      const fileMB = Math.round(archivo.size / (1024 * 1024) * 100) / 100;
      return `Archivo muy grande (${fileMB}MB). Máximo permitido: ${maxMB}MB`;
    }
    
    return null;
  };

  // Manejar cambio de archivo con validación
  const handleFileChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const error = validarArchivo(archivo);
    if (error) {
      setFileError(error);
      e.target.value = "";
      setTimeout(() => setFileError(null), 6000);
      return;
    }

    setFileError(null);
    if (handleArchivo) handleArchivo(e);
  };

  // Manejar click del botón
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const archivoSubido = tieneArchivoValido();
  const tipoArchivoPrincipal = acceptedFormats[0]?.toUpperCase() || 'ARCHIVO';
  const formatsMessage = `Formatos aceptados: ${acceptedFormats.map(f => f.toUpperCase()).join(', ')}`;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg flex flex-col items-center mt-3">
        {/* Estado del archivo */}
        {showFileStatus && (
          <div className="w-full mt-3">
            <EstadoArchivo
              tieneArchivoExistente={hasExistingFile}
              archivoActualNombre={currentFileName || (hasExistingFile ? nombreArchivo : '')}
              archivoNuevo={newFile}
              onCancelarArchivo={onCancelFile}
              baseUrl={baseUrl}
              mensajeSinArchivo={`No hay ${fileTypeMessage} subido`}
              tipoArchivo={fileTypeMessage}
              mostrarLink={true}
            />
          </div>
        )}

        {/* Error de validación */}
        {fileError && (
          <Alert
            variant="error"
            title="Archivo inválido"
            onClose={() => setFileError(null)}
            autoClose={true}
            autoCloseDelay={6000}
            size="sm"
          >
            {fileError}
          </Alert>
        )}

        {/* Botón principal */}
        {archivoSubido ? (
          <Button
            onClick={handleClick}
            type="button"
            variant="success"
            className="flex items-center gap-2 m-5"
          >
            <CheckCircle2 className="w-5 h-5" />
            {allowEdit ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Cambiar archivo</span>
              </>
            ) : (
              <span>Archivo cargado</span>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleClick}
            type="button"
            className="flex items-center gap-2 m-5"
          >
            <FileUp className="w-5 h-5" />
            <span>Subir {tipoArchivoPrincipal}</span>
          </Button>
        )}

        {/* Input file oculto */}
        <input
          type="file"
          accept={acceptAttribute}
          onChange={handleFileChange}
          ref={inputRef}
          className="hidden"
          id={id}
        />
        
        {/* Mensaje de formatos */}
        {!archivoSubido && !fileError && (
          <p className="text-xs text-gray-500 text-center">
            {formatsMessage}
          </p>
        )}
      </div>
    </div>
  );
});

SubirArchivo.displayName = 'SubirArchivo';

export default SubirArchivo;