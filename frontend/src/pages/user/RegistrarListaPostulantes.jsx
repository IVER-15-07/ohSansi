
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
            <div className="overflow-x-auto rounded border border-gray-300">
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

export default RegistrarListaPostulantes
