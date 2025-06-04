import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-sm">info@osansi.edu.bo</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-sm">+591 4 4542563</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span className="text-sm">UMSS - Facultad de Ciencias y Tecnología</span>
              </div>
            </div>
          </div>

          {/* Enlaces útiles */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Útiles</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-slate-300 hover:text-white transition-colors duration-200">
                Reglamento
              </a>
              <a href="#" className="block text-sm text-slate-300 hover:text-white transition-colors duration-200">
                Preguntas Frecuentes
              </a>
              <a href="#" className="block text-sm text-slate-300 hover:text-white transition-colors duration-200">
                Resultados Anteriores
              </a>
              <a href="#" className="block text-sm text-slate-300 hover:text-white transition-colors duration-200">
                Recursos de Estudio
              </a>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-sm text-slate-400">
            © 2025 Olimpiadas Científicas San Simón. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
