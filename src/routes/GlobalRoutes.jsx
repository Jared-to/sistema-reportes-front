import  { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import PageLoading from '../components/PageLoading';
import { PublicRoutes } from './PublicRoutes';
import { PrivateRoutes } from './PrivateRoutes';
import { RouteAuth } from '../auth/RouteAuth';
import { RoutesUser } from '../user/RoutesUser';


export const GlobalRoutes = () => {
  const { status, checkAuth } = useAuthStore();
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
  
          await checkAuth();
        
      } catch (error) {
        // Manejar errores si es necesario
      } finally {
        setAuthChecking(false);
      }
    };

    authenticateUser();
  }, [status]);

  if (authChecking) {
    return <PageLoading />;
  }
  return (
    <Routes>

      <Route path="/*" element={
        <PublicRoutes>
          <RouteAuth/>
        </PublicRoutes>
      } />

      <Route path="/user/*" element={
        <PrivateRoutes>
          <RoutesUser />
        </PrivateRoutes>
      }/>

    </Routes>
  );
};
