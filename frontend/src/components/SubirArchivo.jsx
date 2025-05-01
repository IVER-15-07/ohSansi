import React from 'react'

const SubirArchivo = ({nombreArchivo, tipoArchivo, handleArchivo, inputRef, id}) => {
    console.log(nombreArchivo);
    
    const handleButtonClick = (e) => {
        e.preventDefault(); // Prevenir comportamiento por defecto
        e.stopPropagation(); // Evitar propagación del evento
        inputRef.current.click();
    };
    
    return(
        <div className="flex justify-center">
        <div className="w-full max-w-lg text-center">
            <h2 className="block font-medium text-gray-600 mb-1" >{nombreArchivo}</h2>

            <button
            type="button" // Especificar explícitamente que es un botón de tipo button
            onClick={handleButtonClick}
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
            id={id || "file-upload-input"}
            />
        </div>
        </div>
    )
}

export default SubirArchivo;