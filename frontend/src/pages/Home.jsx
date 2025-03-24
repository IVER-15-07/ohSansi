import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()

    const handleNavigate = () => {
            navigate('/AdminLayout')
    }


  return (
    <div>
    <h1>Hola, ¿cómo estás? Soy Home</h1>
    <button
      onClick={handleNavigate}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Ir a AdminLayout
    </button>
  </div>
  )
}

export default Home
