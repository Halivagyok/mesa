import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
  const { userData } = useAuth();

  if (!userData) {
    return <Navigate to="/login" />;
  }

  return userData.isAdmin ? <Outlet /> : <Navigate to="/" />;
}
