
import { useNavigate, Outlet } from "react-router-dom"
import { Beaker, Brain, Calculator, Code, Rocket, Users } from "lucide-react"
import logo from "../assets/logo.png"
import { getOlimpiadasActivas } from "../../service/olimpiadas.api"
import { useState, useEffect } from "react"
import { Typewriter } from 'react-simple-typewriter';
import Error from "./Error"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; // <-- Cambia esto
import 'swiper/css';
import 'swiper/css/autoplay';






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
    navigate(`/olimpiadas/${olimpiada.id}`);
  };

  if (error) return <Error error={error} />;

  return (


    
    <div className=" flex flex-col min-h-screen  bg-gray-50">

      




      {/* SECCIÓN DE PRESENTACIÓN */}
      <section className="bg-gradient-to-b from-blue-900 via-white to-red-600 py-16">
        <div className="container  flex flex-col items-center gap-5">

          <div className="flex flex-col md:flex-row items-center gap-10 w-full px-10">

            {/* LOGO */}
            <div className="flex-shrink-0">
              <img src={logo} alt="Logo" className="w-144 h-144 object-contain" />
            </div>

            <div>
              {/* PRESENTACIÓN OLIMPIADA */}
              <div className="container mx-auto px-6 py-4 mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-4 rounded-lg shadow">
                  <p className="font-semibold">
                    El Comité de la Olimpiadas Científica Nacional San Simón <b>O! SANSI</b>, a través de la Facultad de Ciencias y Tecnología de la Universidad Mayor de San Simón, convoca a los estudiantes del Sistema de Educación Regular a participar en las Olimpiadas <b>O! SANSI 2025</b>.
                  </p>
                </div>
              </div>

              {/* NOTIFICACIONES IMPORTANTES */}
              <div className="container mx-auto px-6 py-4 mb-6">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg shadow flex flex-col gap-2">
                  <p className="font-bold">ATENCIÓN</p>
                  <ul className="list-disc list-inside text-sm mb-2">
                    <li>El formulario de pre-inscripción estará abierto el miércoles 14 de mayo de 9:00 a 12:00.</li>
                    <li>El sistema de pagos estará disponible hasta medio día (12:00) del 19 de mayo.</li>
                  </ul>
                  <a href="#mas-informacion" className="self-start mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded transition">
                    Más información
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SECCIÓN DE OLIMPIADAS ACTIVAS */}

      <section className="container mx-auto px-6 py-16">
        {/* TÍTULO PRINCIPAL */}
        <div className="w-full flex justify-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight text-center">
            <Typewriter
              words={['Olimpiadas Activas', '¡Inscribite ya!']}
              loop={0}
              cursor
              cursorStyle="_"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1500}
            />
          </h1>
        </div>

        {/* FILA DE OLIMPIADAS */}
        <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch">
          {/* OLIMPIADA DESTACADA */}
          {olimpiadas.length > 0 && (
            <div className="flex-1 max-w-xl border-4 border-red-500 rounded-2xl p-8 shadow-xl bg-white flex flex-col justify-between mb-8 lg:mb-0 h-full min-h-[340px]">
              <h2 className="text-3xl font-extrabold text-red-700 mb-4 uppercase tracking-wide">
                {olimpiadas[0].nombre}
              </h2>
              {olimpiadas[0].descripcion && (
                <p className="text-blue-800 mt-2 text-lg">{olimpiadas[0].descripcion}</p>
              )}
              <div className="text-blue-800 text-lg mt-4 space-y-1">
                <p><span className="font-bold">Costo:</span> {olimpiadas[0].costo ? `Bs. ${olimpiadas[0].costo}` : 'Gratuito'}</p>
                <p><span className="font-bold">Inscripciones:</span> {olimpiadas[0].fechaInicio} - {olimpiadas[0].fechaFin}</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => handleSeleccionarOlimpiada(olimpiadas[0])}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-lg transition duration-300 shadow-md animate-pulse"
                >
                  Más Detalles
                </button>
              </div>
            </div>
          )}

          {/* CARRUSEL DE OTRAS OLIMPIADAS */}
          <div className="w-full overflow-x-hidden flex-1">
            {olimpiadas.length > 1 && (
              <Swiper
                modules={[Autoplay]}
                spaceBetween={30}
                slidesPerView={
                  olimpiadas.length - 1 >= 3 ? 3 : olimpiadas.length - 1
                }
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                loop={olimpiadas.length - 1 > 3}
                className="w-full"
                style={{ padding: "10px 0" }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: Math.min(2, olimpiadas.length - 1) },
                  1024: { slidesPerView: Math.min(3, olimpiadas.length - 1) },
                }}
              >
                {olimpiadas.slice(1).map((olimpiada) => (
                  <SwiperSlide key={olimpiada.id} className="flex h-full">
                    <div className="max-w-xs w-full h-full border rounded-xl p-6 shadow bg-white flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 mx-auto min-h-[340px]">
                      <h3 className="text-xl font-bold text-blue-900 mb-2">{olimpiada.nombre}</h3>
                      {olimpiada.descripcion && (
                        <p className="text-blue-800 mt-1 text-sm">{olimpiada.descripcion}</p>
                      )}
                      <div className="text-blue-800 text-sm mt-2 space-y-1">
                        <p><span className="font-bold">Costo:</span> {olimpiada.costo ? `Bs. ${olimpiada.costo}` : 'Gratuito'}</p>
                        <p><span className="font-bold">Inscripciones:</span> {olimpiada.fechaInicio} - {olimpiada.fechaFin}</p>
                      </div>
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => handleSeleccionarOlimpiada(olimpiada)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition duration-300"
                        >
                          Más Detalles
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </section>


      <section id="mas-informacion">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight text-center">
            <Typewriter
              words={['Noticias']}
              loop={2}
              cursor
              cursorStyle="_"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1500}
            />
          </h1>

          <div className="container mx-auto px-6 py-4 mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-4 rounded-lg shadow">
              <p className="font-semibold">
                El Comité de la Olimpiadas Científica Nacional San Simón <b>O! SANSI</b>, a través de la Facultad de Ciencias y Tecnología de la Universidad Mayor de San Simón, convoca a los estudiantes del Sistema de Educación Regular a participar en las Olimpiadas <b>O! SANSI 2025</b>.
              </p>
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


      {/* INFORMACIÓN DE ÁREA Y CONTACTO */}
      <section className="container mx-auto px-6 py-5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Información de Área y Contacto</h2>
          <p className="text-gray-700">Si tienes dudas, contacta al responsable de tu área:</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-left">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b font-bold text-blue-900">Área</th>
                <th className="py-3 px-4 border-b font-bold text-blue-900">Contacto</th>
                <th className="py-3 px-4 border-b font-bold text-blue-900">Correo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">Astronomía y Astrofísica</td>
                <td className="py-2 px-4 border-b">Juan Carlos Terrazas Vargas</td>
                <td className="py-2 px-4 border-b"><a href="https://mail.google.com/mail/?view=cm&to=juan.terrazas@fcyt.umss.edu.bo" className="text-blue-700 underline">juan.terrazas@fcyt.umss.edu.bo</a></td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Biología</td>
                <td className="py-2 px-4 border-b">Erika Fernández</td>
                <td className="py-2 px-4 border-b"><a href="https://mail.google.com/mail/?view=cm&to=e.fernandez@umss.edu" className="text-blue-700 underline">e.fernandez@umss.edu</a></td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Física</td>
                <td className="py-2 px-4 border-b">Marko Andrade</td>
                <td className="py-2 px-4 border-b"><a href="https://mail.google.com/mail/?view=cm&to=markoandrade.u@fcyt.umss.edu.bo" className="text-blue-700 underline">markoandrade.u@fcyt.umss.edu.bo</a></td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Informática</td>
                <td className="py-2 px-4 border-b">Vladimir Costas</td>
                <td className="py-2 px-4 border-b"><a href="https://mail.google.com/mail/?view=cm&to=vladimircostas.j@fcyt.umss.edu.bo" className="text-blue-700 underline">vladimircostas.j@fcyt.umss.edu.bo</a></td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Matemática</td>
                <td className="py-2 px-4 border-b">Vidal Matias</td>
                <td className="py-2 px-4 border-b"><a href="https://mail.google.com/mail/?view=cm&to=v.matias@umss.edu" className="text-blue-700 underline">v.matias@umss.edu</a></td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Química</td>
                <td className="py-2 px-4 border-b">Boris Moreira</td>
                <td className="py-2 px-4 border-b"><a target="_blank" href="https://mail.google.com/mail/?view=cm&to=borismoreira.r@fcyt.umss.edu.bo" className="text-blue-700 underline">borismoreira.r@fcyt.umss.edu.bo</a></td>

              </tr>
            </tbody>
          </table>
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
