import React from 'react'
import { useState } from 'react'

import Olympiadareas from './OlympiadAreas'
import Levels from './Levels'
import PaymentOrder from './PaymentOrder'

const OlympiadAreas = () => {

    const [jump, setJump] = useState('OLIMPIADAS')
    

    const RenderJump = () => {
        if (jump === 'OLIMPIADAS') {
            return <Olympiadareas />
        } else if (jump === 'AREAS') {
            return <Levels />
        } else if (jump === 'CATEEGORIA') {
            return <Pago />
        } else if (jump === 'PAGO') {
            return <PaymentOrder />
        }
    }




    return (
        <div className="flex flex-col h-screen">
            {/* Sidebar */}
            <div className="h-1/10 p-4 bg-gray-800 text-white">
                <h1> hola  soy  LA PAGINACION </h1>
                <button onClick={() => setJump('OLIMPIADAS')} className="block mb-4">paso 1</button>
                <button onClick={() => setJump('AREAS')} className="block mb-4">paso 1</button>
                <button onClick={() => setJump('CATEGORIA')} className="block mb-4">paso 1</button>
                <button onClick={() => setJump('PAGO')} className="block mb-4">paso 1</button>
            </div>

            {/* Main Content */}
            <div className="h-9/10 p-4">
            {RenderJump()}
            </div>
        </div>
    )
}

export default OlympiadAreas
