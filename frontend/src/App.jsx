import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import RequisitionForm from './pages/RequisitionForm';
import Reports from './pages/Reports';
import RequisitionList from './pages/RequisitionList';
import NotFound from './pages/NotFound';
import LogFirearm from './pages/LogFirearm';

function App() {
  return (
    <Routes>
      {/* Redirect root path to dashboard */}
      {/*<Route path="/" element={<Navigate to="/dashboard" replace />} />*/}

      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Private routes */}
      <Route 
        path="/dashboard" 
        element={<PrivateRoute><Dashboard /></PrivateRoute>}
        aria-label="Dashboard Page"
      />
      <Route 
        path="/inventory" 
        element={<PrivateRoute><Inventory /></PrivateRoute>}
      />
      <Route 
        path="/logfirearm"
        element={<PrivateRoute><LogFirearm /></PrivateRoute>}
      />
      <Route 
        path="/requisitionslist"
        element={<PrivateRoute><RequisitionList /></PrivateRoute>}
      />
      <Route 
        path="/requisitions"
        element={<PrivateRoute><RequisitionForm /></PrivateRoute>}
      />
      <Route 
        path="/reports"
        element={<PrivateRoute><Reports /></PrivateRoute>}
      />
      
      {/* Fallback for any other route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;