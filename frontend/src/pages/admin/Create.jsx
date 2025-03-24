import React from 'react'
import { useState } from 'react'

const Create = () => {

    const [jump, setJump] = useState('CREAR')

    const handleJump = () => {
        if (jump === 'CREAR') {
            return <Create />
        } else if (jump === 'CATEGORIA') {
            return <Categoria />
        } else if (jump === 'PAGO') {
            return <Pago />
        } else if (jump === 'ABRIR') {
            return <Abrir />
        }
    }



    return (
        <div className="flex flex-col h-screen">
      {/* Sidebar */}
      <div className="h-1/10 p-4 bg-gray-800 text-white">
        <h1> crear olimpia                configurar olimpiada  </h1>
      </div>

      {/* Main Content */}
      <div className="h-9/10 p-4">
        <h1>hola aqui esta el contenido de los formularios</h1>
      </div>
    </div>
    )

}

export default Create
