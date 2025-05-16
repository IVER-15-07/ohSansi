import React, { useState } from 'react'
import * as XLSX from "xlsx";
import { FileUp, FileCheck2, FileX2 } from "lucide-react";
import { enviarRegistrosLote } from '../../../service/registros.api';
import { useParams } from "react-router-dom";

const RegistrarListaPostulantes = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [enviar, setEnviar] = useState(false);

  // Obtener ids del URL
  const { idOlimpiada, idEncargado } = useParams();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setFile(file);
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

    reader.readAsBinaryString(file);
  };

  const enviarRegistro = async () => {
    if (!file) {
      alert("Debes seleccionar un archivo Excel.");
      return;
    }
    if (!idOlimpiada || !idEncargado) {
      alert("No se encontraron los IDs en la URL.");
      return;
    }
    setEnviar(true);
    try {
      const response = await enviarRegistrosLote(file, idOlimpiada, idEncargado);
      if (response.success) {
        alert('Postulantes registrados exitosamente.');
      } else {
        alert('Error al registrar postulantes: ' + response.message);
      }
    } catch (error) {
      console.error("Error al registrar postulantes:", error);
      alert('Ocurrió un error al registrar los postulantes.');
    }
    setEnviar(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Subir Excel de Postulantes</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Sube un archivo en formato <strong>.xlsx</strong> o <strong>.xls</strong> con los datos de los postulantes.
        </p>

        <div className="flex flex-col items-center mb-6">
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
            <p className="mt-3 text-gray-800 flex items-center gap-2">
              <FileCheck2 className="text-green-600 w-5 h-5" /> {fileName}
            </p>
          )}

          {error && (
            <p className="mt-3 text-red-600 flex items-center gap-2">
              <FileX2 className="w-5 h-5" /> {error}
            </p>
          )}
        </div>

        {headers.length > 0 && (
          <div className="overflow-auto rounded shadow border border-gray-300">
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
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, colIndex) => {
                        // Detectar si la columna es fecha_nacimiento
                        const header = headers[colIndex]?.toLowerCase();
                        let displayValue = cell;

                        // Si es fecha_nacimiento y es un número, convertirlo a aaaa-mm-dd
                        if (header === "fecha_nacimiento" && cell !== "" && !isNaN(cell)) {
                          // Excel almacena fechas como números, así que convertimos:
                          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                          const date = new Date(excelEpoch.getTime() + (cell - 0) * 86400000);
                          displayValue = date.toISOString().slice(0, 10);
                        }

                        return (
                          <td key={colIndex} className="px-4 py-2 border">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={enviarRegistro}
          disabled={enviar}
          className={`mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${enviar ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {enviar ? 'Enviando...' : 'Enviar Registros'}
        </button>
      </div>
    </div>
  );
};

export default RegistrarListaPostulantes;