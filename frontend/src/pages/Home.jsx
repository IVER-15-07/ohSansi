"use client"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { Beaker, Brain, Calculator, Code, Rocket, Users } from "lucide-react"

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bienvenido a <span className="text-red-400">OhSansi</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">Sistema de Olimpiadas STEM de la Universidad Mayor de San Simón</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={() => navigate("/registro-tutor")}
                className="px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg shadow-md 
                          hover:bg-red-700 transition duration-300 flex items-center"
              >
                <Users className="mr-2 h-5 w-5" />
                Registro de Tutor
              </button>
              <button
                onClick={() => navigate("/AdminLayout")}
                className="px-6 py-3 bg-white text-blue-900 text-lg font-semibold rounded-lg shadow-md 
                          hover:bg-gray-100 transition duration-300 flex items-center"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Acceso Administrativo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* About Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Olimpiadas STEM para Estudiantes</h2>
          <p className="text-gray-700 text-lg mb-8 text-center">
            Explora y participa en competencias que integran Ciencia, Tecnología, Ingeniería y Matemáticas para
            estudiantes del sistema educativo regular de Bolivia.
          </p>

          {/* STEM Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-3">
                <Beaker className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="font-semibold text-blue-900">Ciencia</h3>
              <p className="text-sm text-gray-600 text-center mt-1">Experimentación y descubrimiento</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full mb-3">
                <Code className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Tecnología</h3>
              <p className="text-sm text-gray-600 text-center mt-1">Innovación digital y programación</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-3">
                <Brain className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="font-semibold text-blue-900">Ingeniería</h3>
              <p className="text-sm text-gray-600 text-center mt-1">Diseño y resolución de problemas</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full mb-3">
                <Calculator className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Matemáticas</h3>
              <p className="text-sm text-gray-600 text-center mt-1">Razonamiento lógico y análisis</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 text-center">¿Qué ofrece OhSansi?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Registro Simplificado</h3>
              <p className="text-gray-600">
                Proceso sencillo para tutores y competidores que deseen participar en las olimpiadas STEM.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Desafíos Científicos</h3>
              <p className="text-gray-600">
                Competencias que integran disciplinas STEM para fomentar el pensamiento crítico y la innovación.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Desarrollo Técnico</h3>
              <p className="text-gray-600">
                Oportunidades para que los estudiantes desarrollen habilidades científicas y tecnológicas clave.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-12 mt-8">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para participar?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Regístrate como tutor y comienza a inscribir a tus estudiantes en las olimpiadas STEM de la UMSS.
          </p>
          <button
            onClick={() => navigate("/registro-tutor")}
            className="px-8 py-4 bg-white text-red-600 text-lg font-bold rounded-lg shadow-lg 
                      hover:bg-gray-100 transition duration-300"
          >
            Registrarme Ahora
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="mb-2">© {new Date().getFullYear()} OhSansi - Universidad Mayor de San Simón</p>
          <p className="text-blue-200 text-sm">
            Sistema de Olimpiadas STEM para estudiantes del sistema educativo regular
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
