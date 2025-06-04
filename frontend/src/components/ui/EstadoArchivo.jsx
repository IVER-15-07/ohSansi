import { memo } from "react";
import Button from "./Button";

/**
 * EstadoArchivo - Componente para mostrar el estado de archivos subidos
 * 
 * @param {boolean} tieneArchivoExistente - Si hay un archivo existente en el servidor
 * @param {string} archivoActualNombre - Nombre del archivo actual en el servidor
 * @param {object} archivoNuevo - Archivo nuevo seleccionado {name: string}
 * @param {function} onCancelarArchivo - Función para cancelar la selección del nuevo archivo
 * @param {string} baseUrl - URL base para descargar archivos (opcional)
 * @param {string} mensajeSinArchivo - Mensaje personalizado cuando no hay archivo
 * @param {string} tipoArchivo - Tipo de archivo para el mensaje (ej: "convocatoria", "imagen")
 * @param {boolean} mostrarLink - Si mostrar el link de descarga del archivo existente
 */
const EstadoArchivo = memo(({
  tieneArchivoExistente = false,
  archivoActualNombre = '',
  archivoNuevo = null,
  onCancelarArchivo,
  baseUrl = 'http://127.0.0.1:8000/storage',
  mensajeSinArchivo = 'No hay archivo subido',
  tipoArchivo = 'archivo',
  mostrarLink = true
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {/* Archivo existente en el servidor */}
      {tieneArchivoExistente && !archivoNuevo && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
          <span className="text-blue-600 text-sm">📄 Archivo actual:</span>
          {mostrarLink ? (
            <a
              href={`${baseUrl}/${archivoActualNombre}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              {archivoActualNombre}
            </a>
          ) : (
            <span className="text-blue-600 text-sm font-medium">
              {archivoActualNombre}
            </span>
          )}
        </div>
      )}
      
      {/* Sin archivo */}
      {!tieneArchivoExistente && !archivoNuevo && (
        <div className="p-2 bg-yellow-50 rounded-md">
          <span className="text-yellow-600 text-sm">
            ⚠️ {mensajeSinArchivo.replace('{tipo}', tipoArchivo)}
          </span>
        </div>
      )}
      
      {/* Nuevo archivo seleccionado */}
      {archivoNuevo && (
        <div className="p-2 bg-green-50 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-green-600 text-sm">
              ✅ Nuevo archivo seleccionado: {archivoNuevo.name}
            </span>
            {onCancelarArchivo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelarArchivo}
                className="text-red-600 hover:text-red-800 border-red-300"
              >
                Cancelar
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-600">
            Este archivo sera guardado.
          </p>
        </div>
      )}
    </div>
  );
});

EstadoArchivo.displayName = 'EstadoArchivo';

export default EstadoArchivo;
