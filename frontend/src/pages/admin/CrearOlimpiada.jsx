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
        <div>

            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Crear Olimpiada</h1>

                

                {step === 1 && <Datosgenerales nextStep={nextStep} />}
                {step === 2 && <Divisiones prevStep={prevStep} nextStep={nextStep} />}
                {step === 3 && <Detalles prevStep={prevStep} onFinish={handleFinish} />}

                <button
                    onClick={onBack}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Volver al Listado
                </button>
            </div>

        </div>
    )
}

export default CrearOlimpiada
