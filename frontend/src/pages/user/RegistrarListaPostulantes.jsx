
import * as XLSX from "xlsx";
import { useState } from "react";
import { FileUp, FileCheck2, FileX2 } from "lucide-react";
import { enviarRegistrosLote } from '../../../service/registros.api';

const RegistrarListaPostulantes = () => {
 const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [enviar, setEnviar] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 });

        const filteredData = jsonData.filter((row) => row.some((cell) => cell !== ""));
        let [firstRow, ...rows] = filteredData;

        const nonEmptyColumns = firstRow
          .map((_, colIndex) => rows.some((row) => row[colIndex] !== "") || firstRow[colIndex] !== "")
          .map((isValid, index) => (isValid ? index : -1))
          .filter((index) => index !== -1);

        const cleanHeaders = nonEmptyColumns.map((colIndex) => firstRow[colIndex]);
        const cleanRows = rows.map((row) => nonEmptyColumns.map((colIndex) => row[colIndex]));

        setHeaders(cleanHeaders);
        setData(cleanRows);
      } catch (err) {
        setError("Hubo un error al procesar el archivo. Asegúrate de que esté en formato correcto.");
        setData([]);
        setHeaders([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const enviarRegistro = async () => {
    try {
      setError(""); // Limpia errores previos
      setEnviar(true); // Desactiva el botón mientras se envía

      const registros = data.map((row) => ({
        nombres: row[0],
        apellidos: row[1],
        ci: row[2],
        id_opcion_inscripcion: row[5],
        id_encargado: row[6],
        datos: [
          { id_campo_inscripcion: 1, valor: row[3] },
          { id_campo_inscripcion: 2, valor: row[4] },
        ],
      }));

      const response = await enviarRegistrosLote({ registros });

      if (response.success) {
        alert("Postulantes registrados exitosamente.");
      } else {
        setError(response.message || "Ocurrió un error desconocido.");
      }
    } catch (error) {
      console.error("Error al registrar postulantes:", error);
      setError(error.message);
    } finally {
      setEnviar(false); // Reactiva el botón después de enviar
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
        {/* Título y descripción */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Subir Excel de Postulantes</h2>
          <p className="text-sm text-gray-600">
            Sube un archivo en formato <strong>.xlsx</strong> o <strong>.xls</strong> con los datos de los postulantes.
          </p>
        </div>

        {/* Selector de archivo */}
        <div className="flex flex-col items-center space-y-3">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <FileUp className="w-5 h-5" /> Seleccionar Archivo Excel
          </label>

          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          {fileName && (
            <p className="mt-1 text-green-700 flex items-center gap-2 text-sm">
              <FileCheck2 className="w-5 h-5" /> {fileName}
            </p>
          )}

          {error && (
            <p className="mt-1 text-red-600 flex items-center gap-2 text-sm">
              <FileX2 className="w-5 h-5" /> {error}
            </p>
          )}
        </div>

        {/* Tabla de datos */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 min-h-[300px]">
          {headers.length > 0 && (
            <div className="overflow-auto rounded border border-gray-300">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="px-4 py-2 border text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 even:bg-gray-50">
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 border">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Botón enviar */}
        <div className="text-center">
          <button
            onClick={enviarRegistro}
            disabled={enviar}
            className={`mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition ${
              enviar ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {enviar ? "Enviando..." : "Enviar Registros"}
          </button>
        </div>
      </div>
    </div>


  );
};

export default RegistrarListaPostulantes
