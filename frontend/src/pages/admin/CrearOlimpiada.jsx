import React from 'react'
import { useState } from 'react';
import Datosgenerales from './Datosgenerales';
import Divisiones from './Divisiones';
import Detalles from './Detalles';

const CrearOlimpiada = ({ onBack }) => {

    const [step, setStep] = useState(1);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);
    const handleFinish = () => {
        alert("¡Olimpiada creada con éxito!");
        onBack(); // Regresa al listado de olimpiadas
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Crear Olimpiada</h1>
            <div className="bg-blue-100 p-4 rounded shadow-md">
                {/* Renderiza el contenido basado en el paso actual */}
                {step === 1 && <Datosgenerales nextStep={nextStep} />}
                {step === 2 && <Divisiones prevStep={prevStep} nextStep={nextStep} />}
                {step === 3 && <Detalles prevStep={prevStep} onFinish={handleFinish} />}
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between mt-4">
                {/* Botón "Anterior" */}
                {step > 1 && (
                    <button
                        onClick={prevStep}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                        Anterior
                    </button>
                )}

                {/* Botón "Siguiente" o "Finalizar" */}
                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Siguiente
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Finalizar
                    </button>
                )}
            </div>

            {/* Botón "Volver al Listado" */}
            <div className="mt-4">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Volver al Listado
                </button>
            </div>
        </div>
    )
}

export default CrearOlimpiada
