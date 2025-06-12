import { Navigate } from "react-router-dom";

function AdminPrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" />;
}

export default AdminPrivateRoute;