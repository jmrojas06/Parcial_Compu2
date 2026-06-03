import { Navigate } from 'react-router';

// Guarda de ruta: si no hay token en localStorage → redirige a /login
// Envuelve las rutas que requieren autenticación en App.jsx
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
