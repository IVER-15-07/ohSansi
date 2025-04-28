import React from 'react'
import { useState } from 'react'

const ValidarComprobante = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = "tu_token_aqui"; // Reemplaza con tu token real

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            setError("Solo se permiten archivos .jpg, .jpeg, .png o .pdf");
            setFile(null);
            setPreview(null);
            return;
        }

        setFile(selectedFile);
        setError("");

        if (selectedFile.type.startsWith("image")) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Por favor selecciona un archivo válido.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("comprobante", file);

        try {
            const response = await axios.post("/api/verificar-comprobante", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            alert(response.data.message || "Comprobante subido correctamente");
            setFile(null);
            setPreview(null);
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || "Error al subir el archivo");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md border">
                <h1 className="text-2xl font-bold mb-2 text-center">Validar Comprobante</h1>
                <p className="text-gray-600 text-sm text-center mb-4">
                    Sube un archivo en formato <strong>.jpg, .jpeg, .png o .pdf</strong>
                </p>

                <label
                    htmlFor="file-upload"
                    className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition mb-4"
                >
                    {file ? `Archivo: ${file.name}` : "Haz clic o arrastra un archivo aquí"}
                </label>

                <input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {preview && (
                    <img
                        src={preview}
                        alt="Vista previa"
                        className="w-40 h-40 object-contain mx-auto mb-4 border rounded-md"
                    />
                )}

                {file && file.type === "application/pdf" && (
                    <p className="text-center text-sm text-gray-500 mb-4">Archivo PDF cargado.</p>
                )}

                {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full px-4 py-2 text-white font-medium rounded-md transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Subiendo..." : "Subir Comprobante"}
                </button>




            </div>

        </div>
    )
}

export default ValidarComprobante
