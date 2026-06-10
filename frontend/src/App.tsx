import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Dispatch } from './pages/Dispatch';
import { Drivers } from './pages/Drivers';
import { Trucks } from './pages/Trucks';
import { Companies } from './pages/Companies';
import { IssuesPanel } from './pages/IssuesPanel';
import { DriverLayout } from './components/layout/DriverLayout';
import { DriverDashboard } from './pages/DriverDashboard';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Dispatch />} />
            <Route path="/fleet" element={<Trucks />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/issues" element={<IssuesPanel />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Driver Routes */}
        <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<DriverDashboard />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
