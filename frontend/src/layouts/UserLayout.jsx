

import { Outlet , useLocation} from 'react-router-dom'
import Navbar from '../components/Navbar' 
import Footer from '../components/Footer'

const UserLayout = () => {

   const location = useLocation();

  const rutasSinFooter = ['/registros'];
   // Verificar si la ruta actual comienza con alguna de las rutas sin footer
  const mostrarFooter = !rutasSinFooter.some((ruta) =>
    location.pathname.startsWith(ruta)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Outlet />
      {mostrarFooter && <Footer />}
    </div>
  )
}

export default UserLayout
