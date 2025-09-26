
import { useAuthStore } from '../hooks/useAuthStore';
import { Navigate } from 'react-router-dom';

export const PrivateRoutes = ({children}) => {
const { status } = useAuthStore();
  return (status==="authenticated")?children:<Navigate to={'/'} />
}
