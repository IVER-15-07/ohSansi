import React from "react";
import { X } from "lucide-react";

const ErrorModal = ({ isOpen, onClose, errorMessage, suggestions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-red-600">Error</h3>
          <button onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-gray-700 mb-4">{errorMessage}</p>
        {suggestions && (
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Sugerencias:</h4>
            <ul className="list-disc list-inside text-gray-600">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
