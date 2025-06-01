import { FileUp, CheckCircle2 } from "lucide-react";
import { memo } from "react";

const SubirArchivo = memo(({ nombreArchivo, tipoArchivo, handleArchivo, inputRef, id }) => {
  // Función para manejar el click en el botón de subida
  const handleClick = () => {
    if (inputRef.current) {
      // Reiniciar el valor del input para asegurar que el evento change se dispare incluso si se selecciona el mismo archivo
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  // Verificar si hay un archivo cargado correctamente
  const archivoSubido = nombreArchivo && nombreArchivo !== "Subir la convocatoria de la olimpiada";
  
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg flex flex-col items-center mt-3">
        <h2 className={`block font-medium ${archivoSubido ? 'text-green-600' : 'text-secondary-600'} mt-1 text-center`}>
          {nombreArchivo || 'Ningún archivo seleccionado'}
        </h2>

        {archivoSubido ? (
          <div 
            className="font-medium flex items-center justify-center gap-x-2 px-5 py-2 bg-green-600 text-white rounded-lg m-5 transition-colors duration-200 cursor-default"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Archivo PDF cargado correctamente</span>
          </div>
        ) : (
          <button
            onClick={handleClick}
            type="button"
            aria-label={`Subir archivo de tipo ${tipoArchivo}`}
            title={`Subir archivo de tipo ${tipoArchivo}`}
            className="font-medium flex items-center justify-center gap-x-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 m-5 transition-colors duration-200"
          >
            <FileUp className="w-5 h-5" />
            <span>Subir archivo de tipo {tipoArchivo}</span>
          </button>
        )}

        <input
          type="file"
          accept={`.${tipoArchivo},application/pdf`}
          onChange={handleArchivo}
          ref={inputRef}
          className="hidden"
          id={id}
        />
        
        {!archivoSubido && (
          <p className="text-xs text-danger-500">
            Solo se permiten archivos con formato {tipoArchivo.toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
});

SubirArchivo.displayName = 'SubirArchivo';

export default SubirArchivo;