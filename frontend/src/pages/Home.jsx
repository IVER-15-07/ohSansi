import { useState, useEffect, useCallback } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import {
  Beaker,
  Brain,
  Calculator,
  Code,
  Rocket,
  Users,
  Mail,
  ExternalLink,
  Calendar,
  DollarSign,
  Trophy,
  Star,
} from "lucide-react"
import { Typewriter } from "react-simple-typewriter"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/autoplay"

import { getOlimpiadasActivas } from "../../service/olimpiadas.api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Alert, LoadingSpinner } from "../components/ui"
import logo from "../assets/logo.png"

const Home = () => {
  const navigate = useNavigate()
  const [olimpiadas, setOlimpiadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOlimpiadas = async () => {
      try {
        const response = await getOlimpiadasActivas()
        setOlimpiadas(response.data || [])
      } catch (err) {
        setError("Error al cargar las olimpiadas activas.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOlimpiadas()
  }, [])

  const formatDate = useCallback((dateString) => {
          if (!dateString) return "No disponible";
          try {
              return new Date(dateString).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              });
          } catch {
              return dateString;
          }
      }, []);

  const handleSeleccionarOlimpiada = (olimpiada) => {
    navigate(`/olimpiadas/${olimpiada.id}`)
  }

  const stemAreas = [
    {
      icon: Beaker,
      title: "Ciencia",
      description: "Experimentación y descubrimiento",
      color: "text-blue-600",
    },
    {
      icon: Code,
      title: "Tecnología",
      description: "Innovación y programación",
      color: "text-rose-600",
    },
    {
      icon: Brain,
      title: "Ingeniería",
      description: "Diseño y solución de problemas",
      color: "text-blue-600",
    },
    {
      icon: Calculator,
      title: "Matemáticas",
      description: "Razonamiento lógico y análisis",
      color: "text-rose-600",
    },
  ]

  const features = [
    {
      icon: Users,
      title: "Registro Simplificado",
      description: "Inscripción fácil para tutores y estudiantes participantes.",
    },
    {
      icon: Rocket,
      title: "Desafíos Científicos",
      description: "Fomento del pensamiento crítico y creatividad.",
    },
    {
      icon: Brain,
      title: "Desarrollo Técnico",
      description: "Formación en áreas científicas y tecnológicas clave.",
    },
  ]

  const contactInfo = [
    {
      area: "Astronomía y Astrofísica",
      contact: "Juan Carlos Terrazas Vargas",
      email: "juan.terrazas@fcyt.umss.edu.bo",
    },
    {
      area: "Biología",
      contact: "Erika Fernández",
      email: "e.fernandez@umss.edu",
    },
    {
      area: "Física",
      contact: "Marko Andrade",
      email: "markoandrade.u@fcyt.umss.edu.bo",
    },
    {
      area: "Informática",
      contact: "Vladimir Costas",
      email: "vladimircostas.j@fcyt.umss.edu.bo",
    },
    {
      area: "Matemática",
      contact: "Vidal Matias",
      email: "v.matias@umss.edu",
    },
    {
      area: "Química",
      contact: "Boris Moreira",
      email: "borismoreira.r@fcyt.umss.edu.bo",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando olimpiadas..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </div>
    )
  }

  const hasOlimpiadas = olimpiadas && olimpiadas.length > 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-rose-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={logo}
                alt="Logo Oh! SANSI"
                className="w-95 h-95 object-contain"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=200&width=200"
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                <Typewriter
                  words={["Olimpiadas Científicas", "Oh! SANSI 2025"]}
                  loop={0}
                  cursor={true}
                  cursorStyle="_"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1500}
                />
              </h1>

              <p className="text-xl text-slate-200 mb-8 max-w-2xl">
                El Comité de Olimpiadas Científicas San Simón convoca a estudiantes del Sistema de Educación Regular a
                participar en las <strong>Olimpiadas Oh! SANSI 2025</strong>.
              </p>

              {/* <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" variant="secondary">
                  <Trophy className="h-5 w-5 mr-2" />
                  Ver Olimpiadas
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-slate-900"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Más Información
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="warning" title="ATENCIÓN - Fechas Importantes">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>El formulario de pre-inscripción estará abierto el miércoles 14 de mayo de 9:00 a 12:00.</li>
              <li>El sistema de pagos estará disponible hasta medio día (12:00) del 19 de mayo.</li>
            </ul>
          </Alert>
        </div>
      </section>

      {/* Active Olimpiadas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Olimpiadas Activas</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Descubre las olimpiadas disponibles y únete a la competencia científica más importante del país.
            </p>
          </div>

          {hasOlimpiadas ? (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }}
              className="w-full"
            >
              {olimpiadas.map((olimpiada) => (
                <SwiperSlide key={olimpiada.id}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-rose-700">{olimpiada.nombre}</CardTitle>
                        {olimpiada.id === olimpiadas[0].id && (
                          <div className="flex items-center space-x-1 text-amber-500">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="text-sm font-medium">Destacada</span>
                          </div>
                        )}
                      </div>
                      {olimpiada.descripcion && (
                        <CardDescription className="text-slate-700 line-clamp-2">
                          {olimpiada.descripcion}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">Periodo de Inscripción</span>
                            <span className="text-sm text-slate-600">
                              Del {formatDate(olimpiada?.inicio_inscripcion)}
                            </span>
                            <span className="text-sm text-slate-600">
                              Al {formatDate(olimpiada?.fin_inscripcion)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Costo:</strong> {olimpiada.costo ? `Bs. ${olimpiada.costo}` : "Gratuito"}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSeleccionarOlimpiada(olimpiada)}
                        variant={olimpiada.id === olimpiadas[0].id ? "accent" : "outline"}
                        className="w-full"
                      >
                        Ver Detalles e Inscribirse
                      </Button>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No hay olimpiadas activas</h3>
                <p className="text-slate-600">Mantente atento a nuestras próximas convocatorias.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* STEM Areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Qué son las Olimpiadas STEM?</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Compite en Ciencia, Tecnología, Ingeniería y Matemáticas representando a tu colegio en la Universidad
              Mayor de San Simón.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stemAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="pt-6">
                    <Icon className={`h-12 w-12 mx-auto mb-4 ${area.color}`} />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{area.title}</h3>
                    <p className="text-sm text-slate-600">{area.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Qué ofrece Oh! SANSI?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <Icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Información de Contacto por Área</h2>
            <p className="text-lg text-slate-600">Si tienes dudas, contacta al responsable de tu área:</p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Área</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Responsable</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contactInfo.map((contact, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{contact.area}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{contact.contact}</td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <Mail className="h-4 w-4" />
                          <span>{contact.email}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <Outlet />
    </div>
  )
}

export default Home