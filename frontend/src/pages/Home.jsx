
import { useNavigate, Outlet } from "react-router-dom"
import { Beaker, Brain, Calculator, Code, Rocket, Users } from "lucide-react"
import logo from "../assets/logo.png"
import { getOlimpiadasActivas } from "../../service/olimpiadas.api"
import { useState, useEffect } from "react"
import { Typewriter } from 'react-simple-typewriter';


import Error from "./Error"

const Home = () => {
  const navigate = useNavigate();
  const [olimpiadas, setOlimpiadas] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOlimpiadas = async () => {
      try {
        const response = await getOlimpiadasActivas();
        setOlimpiadas(response.data);
      } catch (err) {
        setError("Error al cargar las olimpiadas activas.");
        console.error(err);

      }
    };

    fetchOlimpiadas();
  }, []);

  const handleSeleccionarOlimpiada = (olimpiada) => {
    navigate(`IdentificarEncargado`,{state: {idOlimpiada: olimpiada.id}});
  };

  if (error) return <Error error={error} />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* HERO */}


      <section className="bg-gradient-to-b from-blue-900 via-white to-red-600 py-16">
        <div className="container  flex flex-col items-center gap-5">

          {/* LOGO + INFORMACIÓN */}
          <div className="flex flex-col md:flex-row items-center gap-10 w-full px-10">

            {/* LOGO */}
            <div className="flex-shrink-0">
              <img src={logo} alt="Logo" className="w-144 h-144 object-contain" />
            </div>

            {/* TEXTO AL LADO */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 mt-20">
              <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900">
                <Typewriter
                  words={['Oh! SanSi', 'Ciencia y Tecnologia']}
                  loop={0} // 0 = infinito
                  cursor
                  cursorStyle="_"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1500}
                />
              </h1>
              <p className="text-lg md:text-2xl text-blue-800">Olimpiada de Ciencia y Tecnología</p>
              {/* OLIMPIADA ACTIVA */}
              {olimpiadas.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">{olimpiadas[0].nombre}</h2>
                  {/* DESCRIPCIÓN */}
                  {olimpiadas.length > 0 && olimpiadas[0].descripcion && (
                    <p className="text-blue-800 mt-4 max-w-2xl text-center">{olimpiadas[0].descripcion}</p>
                  )}

                  <div className="text-blue-800 text-lg">

                    <p><span className="font-bold">Costo:</span> {olimpiadas[0].costo ? `Bs. ${olimpiadas[0].costo}` : 'Gratuito'}</p>
                    <p><span className="font-bold">Inscripciones:</span> {olimpiadas[0].fechaInicio} - {olimpiadas[0].fechaFin}</p>
                  </div>

                  {/* BOTÓN */}
                  {olimpiadas.length > 0 && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => handleSeleccionarOlimpiada(olimpiadas[0])}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg text-lg transition duration-300 animate-pulse"
                      >
                        Inscribirme
                      </button>
                    </div>
                  )}



                </div>
              )}
            </div>

          </div>




        </div>
      </section>




      {/* SOBRE LAS OLIMPIADAS */}
      <section className="bg-blue-100 py-16">
        <div className="container mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">¿Qué son las Olimpiadas STEM?</h2>
          <p className="text-gray-700 text-lg mb-12">
            Compite en Ciencia, Tecnología, Ingeniería y Matemáticas representando a tu colegio en la Universidad Mayor de San Simón.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="flex flex-col items-center">
              <Beaker className="h-12 w-12 text-blue-700 mb-3" />
              <h3 className="text-xl font-semibold text-blue-900">Ciencia</h3>
              <p className="text-sm text-gray-600 text-center">Experimentación y descubrimiento</p>
            </div>
            <div className="flex flex-col items-center">
              <Code className="h-12 w-12 text-red-600 mb-3" />
              <h3 className="text-xl font-semibold text-blue-900">Tecnología</h3>
              <p className="text-sm text-gray-600 text-center">Innovación y programación</p>
            </div>
            <div className="flex flex-col items-center">
              <Brain className="h-12 w-12 text-blue-700 mb-3" />
              <h3 className="text-xl font-semibold text-blue-900">Ingeniería</h3>
              <p className="text-sm text-gray-600 text-center">Diseño y solución de problemas</p>
            </div>
            <div className="flex flex-col items-center">
              <Calculator className="h-12 w-12 text-red-600 mb-3" />
              <h3 className="text-xl font-semibold text-blue-900">Matemáticas</h3>
              <p className="text-sm text-gray-600 text-center">Razonamiento lógico y análisis</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN FINAL */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">¿Qué ofrece Oh! SanSi?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Users className="h-10 w-10 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Registro Simplificado</h3>
            <p className="text-gray-600">Inscripción fácil para tutores y estudiantes participantes.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Rocket className="h-10 w-10 text-blue-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Desafíos Científicos</h3>
            <p className="text-gray-600">Fomento del pensamiento crítico y creatividad.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Brain className="h-10 w-10 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Desarrollo Técnico</h3>
            <p className="text-gray-600">Formación en áreas científicas y tecnológicas clave.</p>
          </div>
        </div>
      </section>

      {/* OTRAS RUTAS */}
      <div className="container mx-auto px-6 py-12">
        <Outlet />
      </div>

    </div>
  );
};

export default Home
