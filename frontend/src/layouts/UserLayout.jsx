import { Outlet, useLocation } from "react-router-dom"
import Navbar from "../components/layout/NavBar"
import Footer from "../components/layout/Footer"

const UserLayout = () => {
  const location = useLocation()

  const rutasSinFooter = ["/registros"]
  const mostrarFooter = !rutasSinFooter.some((ruta) => location.pathname.startsWith(ruta))

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {mostrarFooter && <Footer />}
    </div>
  )
}

export default UserLayout
