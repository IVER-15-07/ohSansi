import { FileUp, CheckCircle2, Edit3, AlertTriangle } from "lucide-react";
import { memo, useState } from "react";
import Alert from "./Alert";

/**
 * SubirArchivo - Componente flexible para subir archivos con validación
 * 
 * @param {string} nombreArchivo - Nombre del archivo seleccionado o mensaje por defecto
 * @param {string} tipoArchivo - Tipo de archivo para mostrar en la UI
 * @param {function} handleArchivo - Función para manejar el archivo seleccionado
 * @param {object} inputRef - Referencia al input de archivo
 * @param {string} id - ID único para el input de archivo
 * @param {function} onFileValidationError - Callback para errores de validación
 * @param {array} acceptedFormats - Array de formatos aceptados ['pdf', 'jpg', 'png']
 * @param {array} acceptedMimeTypes - Array de MIME types ['application/pdf', 'image/jpeg']
 * @param {string} acceptAttribute - Atributo accept del input ".pdf,.jpg,.png"
 * @param {number} maxFileSize - Tamaño máximo en bytes (10MB por defecto)
 * @param {boolean} allowEdit - Permitir editar archivo ya subido
 * 
 * Ejemplos de uso:
 * 
 * // Solo PDF:
 * <SubirArchivo
 *   acceptedFormats={['pdf']}
 *   acceptedMimeTypes={['application/pdf']}
 *   acceptAttribute=".pdf,application/pdf"
 * />
 * 
 * // PDF e imágenes:
 * <SubirArchivo
 *   acceptedFormats={['pdf', 'jpg', 'jpeg', 'png']}
 *   acceptedMimeTypes={['application/pdf', 'image/jpeg', 'image/png']}
 *   acceptAttribute=".pdf,.jpg,.jpeg,.png"
 * />
 * 
 * // Solo imágenes:
 * <SubirArchivo
 *   acceptedFormats={['jpg', 'jpeg', 'png', 'gif']}
 *   acceptedMimeTypes={['image/jpeg', 'image/png', 'image/gif']}
 *   acceptAttribute=".jpg,.jpeg,.png,.gif"
 * />
 */

const SubirArchivo = memo(({ 
  nombreArchivo, 
  tipoArchivo, 
  handleArchivo, 
  inputRef, 
  id, 
  onFileValidationError, 
  acceptedFormats = ['pdf'], // Array de formatos aceptados
  acceptedMimeTypes = ['application/pdf'], // Array de MIME types aceptados
  acceptAttribute = ".pdf,application/pdf", // Atributo accept del input
  maxFileSize = 10 * 1024 * 1024, // Tamaño máximo en bytes (10MB por defecto)
  allowEdit = true // Permitir editar archivo ya subido
}) => {
  const [fileError, setFileError] = useState(null);

  // Función para manejar el click en el botón de subida
  const handleClick = () => {
    if (inputRef.current) {
      // Reiniciar el valor del input para asegurar que el evento change se dispare incluso si se selecciona el mismo archivo
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  // Función para obtener el mensaje de formatos aceptados
  const getFormatsMessage = () => {
    const formatList = acceptedFormats.map(format => format.toUpperCase()).join(', ');
    return `Formatos aceptados: ${formatList}`;
  };

  // Función para obtener sugerencias según el tipo de archivo
  const getSuggestions = () => {
    // Si acepta múltiples formatos, dar sugerencias más específicas
    if (acceptedFormats.length > 1) {
      const suggestions = [];
      
      if (acceptedFormats.includes('pdf')) {
        suggestions.push('PDF (.pdf) - Documentos digitales y escaneados');
      }
      
      if (acceptedFormats.some(format => ['jpg', 'jpeg'].includes(format))) {
        suggestions.push('JPG/JPEG (.jpg, .jpeg) - Fotos y capturas de pantalla');
      }
      
      if (acceptedFormats.includes('png')) {
        suggestions.push('PNG (.png) - Imágenes con transparencia y capturas');
      }
      
      if (acceptedFormats.includes('gif')) {
        suggestions.push('GIF (.gif) - Imágenes animadas');
      }
      
      // Agregar formatos adicionales si los hay
      const otherFormats = acceptedFormats.filter(format => 
        !['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(format)
      );
      
      if (otherFormats.length > 0) {
        suggestions.push(...otherFormats.map(format => 
          `${format.toUpperCase()} (.${format}) - Archivo de ${format.toUpperCase()}`
        ));
      }
      
      return suggestions;
    }
    
    // Sugerencias específicas para PDF únicamente
    if (acceptedFormats.includes('pdf')) {
      return [
        'PDF (.pdf) - Documentos portátiles',
        'Convertir desde Word, Excel, PowerPoint a PDF',
        'Usar herramientas online como SmallPDF o ILovePDF'
      ];
    }
    
    // Sugerencias específicas para imágenes únicamente
    if (acceptedFormats.some(format => ['jpg', 'jpeg', 'png', 'gif'].includes(format))) {
      return [
        'JPG/JPEG (.jpg, .jpeg) - Imágenes comprimidas',
        'PNG (.png) - Imágenes con transparencia',
        'Usar herramientas para convertir otros formatos'
      ];
    }
    
    // Fallback para otros tipos de archivo
    return acceptedFormats.map(format => `${format.toUpperCase()} (.${format})`);
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función para manejar la validación de archivos
  const handleFileChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Validar tanto por extensión como por MIME type
    const fileExtension = archivo.name.split('.').pop().toLowerCase();
    
    let esValido = false;
    let errorMsg = '';
    
    // Validar formato
    const formatoValido = acceptedFormats.includes(fileExtension);
    const mimeTypeValido = acceptedMimeTypes.includes(archivo.type);
    
    if (!formatoValido || !mimeTypeValido) {
      const formatosAceptados = acceptedFormats.map(f => f.toUpperCase()).join(', ');
      errorMsg = `El archivo "${archivo.name}" no tiene un formato válido. Se detectó: ${fileExtension.toUpperCase()}. ${getFormatsMessage()}`;
    }
    
    // Validar tamaño del archivo
    else if (archivo.size > maxFileSize) {
      errorMsg = `El archivo "${archivo.name}" es demasiado grande (${formatFileSize(archivo.size)}). El tamaño máximo permitido es ${formatFileSize(maxFileSize)}.`;
    }
    
    else {
      esValido = true;
    }
    
    // Si no es válido, mostrar error y sugerencias
    if (!esValido) {
      setFileError(errorMsg);
      
      // Notificar al componente padre del error
      if (onFileValidationError) {
        onFileValidationError(errorMsg);
      }
      
      // Limpiar el input para permitir nueva selección
      e.target.value = "";
      
      // Auto-ocultar el error después de 6 segundos
      setTimeout(() => {
        setFileError(null);
      }, 6000);
      
      return;
    }
    
    // Si llegamos aquí, el archivo es válido
    setFileError(null);
    
    // Llamar al handler original
    if (handleArchivo) {
      handleArchivo(e);
    }
  };

  // Verificar si hay un archivo cargado correctamente
  const archivoSubido = nombreArchivo && 
    nombreArchivo !== "Subir la convocatoria de la olimpiada" && 
    nombreArchivo !== `Subir archivo de tipo ${tipoArchivo}` &&
    nombreArchivo !== "Subir archivo";

  // Obtener el tipo de archivo principal para mostrar en la UI
  const tipoArchivoPrincipal = acceptedFormats[0]?.toUpperCase() || tipoArchivo?.toUpperCase() || 'ARCHIVO';
  
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg flex flex-col items-center mt-3">
        <h2 className={`block font-medium ${archivoSubido ? 'text-green-600' : 'text-secondary-600'} mt-1 text-center`}>
          {nombreArchivo || 'Ningún archivo seleccionado'}
        </h2>

        {/* Alerta de error para archivos inválidos */}
        {fileError && (
          <div className="w-full mt-3">
            <Alert
              variant="error"
              title="Formato de archivo no válido"
              onClose={() => setFileError(null)}
              autoClose={false}
              sticky={false}
              size="sm"
            >
              <div className="space-y-2">
                <p>{fileError}</p>
                <div className="text-xs">
                  <p className="font-medium">Formatos aceptados:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {getSuggestions().map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                  <p className="mt-2 font-medium text-red-700">
                    💡 Sugerencia: {acceptedFormats.length > 1
                      ? 'Busque otro archivo en formato válido o tome una foto clara del documento' 
                      : 'Busque otro archivo en formato válido o convierta su documento actual'}
                  </p>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {archivoSubido ? (
          <button
            onClick={handleClick}
            type="button"
            aria-label={`Cambiar archivo ${tipoArchivoPrincipal}`}
            title={`Hacer clic para cambiar el archivo ${tipoArchivoPrincipal}`}
            className="font-medium flex items-center justify-center gap-x-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 m-5 transition-colors duration-200 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Archivo {tipoArchivoPrincipal} cargado correctamente</span>
            <Edit3 className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            onClick={handleClick}
            type="button"
            aria-label={`Subir archivo de tipo ${tipoArchivoPrincipal}`}
            title={`Subir archivo de tipo ${tipoArchivoPrincipal}`}
            className="font-medium flex items-center justify-center gap-x-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 m-5 transition-colors duration-200"
          >
            <FileUp className="w-5 h-5" />
            <span>Subir archivo de tipo {tipoArchivoPrincipal}</span>
          </button>
        )}

        <input
          type="file"
          accept={acceptAttribute}
          onChange={handleFileChange}
          ref={inputRef}
          className="hidden"
          id={id}
        />
        
        {!archivoSubido && !fileError && (
          <div className="text-center space-y-1">
            <p className="text-xs text-primary-500">
              {getFormatsMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

SubirArchivo.displayName = 'SubirArchivo';

export default SubirArchivo;