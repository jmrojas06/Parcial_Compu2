import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

// Configuración de rutas de la aplicación
// /login       → pública, formulario de autenticación
// /            → protegida, requiere token JWT en localStorage
// cualquier otra ruta → redirige al dashboard
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: página de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta protegida: tablero de pedidos (requiere estar autenticado) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Captura cualquier ruta desconocida y redirige al dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
