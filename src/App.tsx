import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<div>Clientes - Coming soon</div>} />
          <Route path="/prestamos" element={<div>Prestamos - Coming soon</div>} />
          <Route path="/pagos" element={<div>Pagos - Coming soon</div>} />
          <Route path="/inversores" element={<div>Inversores - Coming soon</div>} />
          <Route path="/reportes" element={<div>Reportes - Coming soon</div>} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
