import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import OlympiadAreas from './OlympiadAreas'




const Olympiad = () => {

    const [olympiad, setCreate] = useState()

    const Rendercreate = () => {
    if (olympiad === 'CREAR') {
            return <OlympiadAreas />
        }
    }






    return (
        <div className="flex flex-col h-screen">
            {/* Sidebar */}
            <div className="h-1/10 p-4 bg-gray-800 text-white">
                <h1> LISTA DE OLYMPIAD </h1>
            </div>


            {/* Main Content */}
            <div className="h-9/10 p-4">
                <h1>CREAR OLIMPIADA </h1>
                <button onClick={() => setCreate('OLIMPIADAS')} className="block mb-4">paso 1</button>
            </div>

            <div className="h-9/10 p-4">
            {Rendercreate()}
            </div>
        </div>
    )

}

export default Olympiad
