import React from 'react'

const SubirArchivo = ({nombreArchivo, tipoArchivo, handleArchivo, inputRef}) => {
    console.log(nombreArchivo);
    return(
        <div className="flex justify-center">
        <div className="w-full max-w-lg text-center">
            <h2 className="block font-medium text-gray-600 mb-1" >{nombreArchivo}</h2>

            <button
            onClick={() => inputRef.current.click()}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-5"
            >
            Subir archivo de tipo {tipoArchivo}
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