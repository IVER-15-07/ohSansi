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
        <div className="">
            {/* Título */}


            {/* Contenido dinámico */}
            <div className=" p-3 border-2 border-gray-300 rounded-lg shadow-lg bg-white">
                {step === 1 && <Datosgenerales nextStep={nextStep} />}
                {step === 2 && <Divisiones prevStep={prevStep} nextStep={nextStep} />}
                {step === 3 && <Detalles prevStep={prevStep} onFinish={handleFinish} />}
            </div>

            {/* Botones de navegación */}



            <div className="mt-4 flex justify-between items-center">
                {/* Botón "Anterior" */}

                {/* Botón "Volver al Listado" */}
                <div className="mt-4 text-center">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                        Volver al Listado
                    </button>
                </div>


                <div>

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


            </div>


        </div>
    )
}

export default CrearOlimpiada
