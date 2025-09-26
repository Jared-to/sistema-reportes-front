import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const RoutesProtected = ({ element, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  // Si el usuario no tiene el rol requerido, redirigir o mostrar un mensaje
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/user/unauthorized" />;
  }
  // Si tiene el rol, renderizar la ruta normalmente
  return element;
}
