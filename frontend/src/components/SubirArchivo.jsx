
import { FileUp } from "lucide-react";

const SubirArchivo = ({ nombreArchivo, tipoArchivo, handleArchivo, inputRef }) => {
  console.log(nombreArchivo);
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg flex flex-col items-center mt-3">
        <h2 className="block font-medium text-gray-600 mt-1 text-center">
          {nombreArchivo || 'Ningún archivo seleccionado'}
        </h2>

        <button
          onClick={() => inputRef.current.click()}
          type="button"
          aria-label={`Subir archivo de tipo ${tipoArchivo}`}
          title={`Subir archivo de tipo ${tipoArchivo}`}
          className="font-medium flex items-center justify-center gap-x-2 px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 m-5 transition"
        >
          <FileUp className="w-5 h-5" />
          <span>Subir archivo de tipo {tipoArchivo}</span>
        </button>

        <input
          type="file"
          accept={`.${tipoArchivo}`}
          onChange={handleArchivo}
          ref={inputRef}
          className="hidden"
        />
      </div>
    </div>

  )
}

export default SubirArchivo;