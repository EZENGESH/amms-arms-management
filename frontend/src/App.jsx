import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import RequisitionForm from './pages/RequisitionForm';
import Reports from './pages/Reports';
import RegisterForm from './pages/RegisterForm';
import RequisitionList from './pages/RequisitionList';
import NotFound from './pages/NotFound';
import LogFirearm from './pages/LogFirearm';

function App() {
  return (
    <Routes>
      {/* Redirect root path to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Private routes */}
      <Route 
        path="/dashboard" 
        element={<Dashboard />}
        aria-label="Dashboard Page"
      />
      <Route 
        path="/inventory" 
        element={<Inventory />}
      />
      <Route 
        path="/requisitions"
        element={ <RequisitionForm/>} />
      <Route 
        path="/reports" 
        element={<Reports />}
      />
      <Route path="/requisition/new"
        element={<RequisitionForm />} /> {/* 👈 form route */}
      <Route path="/requisitions"
        element={<RequisitionList />} />
      <Route path="/logfirearm" element={<LogFirearm />} />
      <Route path="/requisitionlist" element={<RequisitionList />} />
      <Route path="*" element={<NotFound />} />


    </Routes>
  );
}

export default App;