
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PublicRoutes = ({ children }) => {
  const { user,status } = useSelector(state => state.auth);

  // Si no está autenticado, devuelve el componente de inicio de sesión
  if (status === "not-authenticated") {
    return children;
  }

  // Si está autenticado como usuario normal, redirige a la ruta de usuario
  if (status === "authenticated") {
    if(user.name==='admin'){

      return <Navigate to="/user" />;
    }else{
      return <Navigate to="/user"/>;
    }
  }

  // Otros casos (puedes manejarlos según tus necesidades)
  return null;
};
