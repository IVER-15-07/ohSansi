
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { FileUp, FileCheck2, FileX2 } from "lucide-react";
import { enviarRegistrosLote } from '../../../service/registros.api';
import { useParams } from "react-router-dom";



const RegistrarListaPostulantes = () => {
  const { idOlimpiada, idEncargado } = useParams();

  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [enviar, setEnviar] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [erroresPorCelda, setErroresPorCelda] = useState({});

  // Restaurar datos desde localStorage al montar el componente
  useEffect(() => {
    const savedHeaders = localStorage.getItem("postulantes_excel_headers");
    const savedData = localStorage.getItem("postulantes_excel_data");
    const savedFileName = localStorage.getItem("postulantes_excel_fileName");
    if (savedHeaders && savedData) {
      setHeaders(JSON.parse(savedHeaders));
      setData(JSON.parse(savedData));
      setFileName(savedFileName || "");
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivo(file); // Guarda el objeto File real
    setFileName(file.name);
    setFile(file);
    setError("");
    setErroresPorCelda({});

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

        // Guardar en localStorage
        localStorage.setItem("postulantes_excel_headers", JSON.stringify(cleanHeaders));
        localStorage.setItem("postulantes_excel_data", JSON.stringify(cleanRows));
        localStorage.setItem("postulantes_excel_fileName", file.name);
      } catch (err) {
        setError("Hubo un error al procesar el archivo. Asegúrate de que esté en formato correcto.");
        setData([]);
        setHeaders([]);
        localStorage.removeItem("postulantes_excel_headers");
        localStorage.removeItem("postulantes_excel_data");
        localStorage.removeItem("postulantes_excel_fileName");
      }
    };


    reader.readAsBinaryString(file);
    e.target.value = "";
  };


  const enviarRegistro = async () => {
    try {
      setError("");
      setEnviar(true);
      setErroresPorCelda({});
      console.log("idOlimpiada:", idOlimpiada, "idEncargado:", idEncargado);
      // Llama a la función con los parámetros separados
      const response = await enviarRegistrosLote(
        archivo,
        idOlimpiada,
        idEncargado
      );

      if (response && response.message && !response.errors && !response.error) {
        alert(response.message);
        localStorage.removeItem("postulantes_excel_headers");
        localStorage.removeItem("postulantes_excel_data");
        localStorage.removeItem("postulantes_excel_fileName");
        setHeaders([]);
        setData([]);
        setFileName("");
        setArchivo(null);
        setErroresPorCelda({});
      } else {
        let msg = response?.message || "Ocurrió un error desconocido.";
        if (response?.errors && typeof response.errors === "object") {
          setErroresPorCelda(response.errors);
          msg += "\nErrores en el archivo. Revisa la tabla.";
        }
        if (response?.error) {
          msg += "\n" + response.error;
        }
        setError(msg);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setEnviar(false);
    }
    setEnviar(false);
  };

  const limpiarLista = () => {
    setHeaders([]);
    setData([]);
    setFileName("");
    setArchivo(null);
    setFile(null);
    setError("");
    setErroresPorCelda({});
    localStorage.removeItem("postulantes_excel_headers");
    localStorage.removeItem("postulantes_excel_data");
    localStorage.removeItem("postulantes_excel_fileName");
  };


  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
        {/* Título y descripción */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Importar Lista de Postulantes</h2>
          <p className="text-sm text-gray-600">
            Sube un archivo <strong>.xlsx</strong> o <strong>.xls</strong> con los postulantes. El archivo debe tener los encabezados correctos.
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
            <div className="flex items-center gap-3 mt-1">
              <p className="text-green-700 flex items-center gap-2 text-sm">
                <FileCheck2 className="w-5 h-5" /> {fileName}
              </p>
              <button
                type="button"
                onClick={limpiarLista}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Borrar lista
              </button>
            </div>
          )}



          {error && (
            <p className="mt-1 text-red-600 flex items-center gap-2 text-sm">
              <FileX2 className="w-5 h-5" /> {error}
            </p>
          )}

          {/* Mostrar errores personalizados por fila si existen */}
          {Object.keys(erroresPorCelda).length > 0 ? (
            <div className="mt-3 bg-red-50 border border-red-300 rounded p-3 text-red-700 text-sm">
              <strong>Errores en el archivo:</strong>
              <ul className="list-disc ml-5">
                {Object.entries(erroresPorCelda).map(([celda, mensaje], idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{celda}:</span> {mensaje}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            error && (
              <p className="mt-1 text-red-600 flex items-center gap-2 text-sm">
                <FileX2 className="w-5 h-5" /> {error}
              </p>
            )
          )}


        </div>

        {/* Tabla de datos */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 min-h-[300px]">
          {headers.length > 0 && (
            <div className="overflow-x-auto rounded border border-gray-300">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="px-4 py-2 border text-left">1</th>
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
                        <td className="px-4 py-2 border font-bold text-blue-700 text-center">{rowIndex + 2}</td>
                        {row.map((cell, colIndex) => {
                          const header = headers[colIndex]?.toLowerCase();
                          let displayValue = cell;

                          if (header === "fecha_nacimiento" && cell !== "" && !isNaN(cell)) {
                            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                            const date = new Date(excelEpoch.getTime() + (Number(cell) * 86400000));
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
        </div>

        {/* Botón enviar */}
        <div className="text-center">
          <button
            onClick={enviarRegistro}
            disabled={enviar || !data.length || !archivo}
            className={`mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition ${enviar || !data.length || !archivo ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {enviar ? "Enviando..." : "Enviar Registros"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrarListaPostulantes;