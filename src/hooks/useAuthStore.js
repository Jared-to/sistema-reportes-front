
import { useDispatch, useSelector } from 'react-redux'

import { checkingLogin, clearErrorMessage, onLogin, onLogout } from "../store/auth/authSlice";

import { inventarioApi } from '../api/inventario';


export const useAuthStore = () => {

  const { status, errorMessage } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  //aqui soran las peticiones a la api los comente por ahora pq aun no hay api
  //tambien llaman a los metodos reducer para cambiar el estado y asignar los valores

  const startLogin = async (formulario) => {
    const datos = {
      username: formulario.username,
      password: formulario.password
    };

    dispatch(checkingLogin());
    try {

      const { data } = await inventarioApi.post('/auth/login', datos)
      
      dispatch(onLogin({ name: data.fullName, id: data.id, rol: data.roles[0], foto: data.fotoUrl }));
      sessionStorage.setItem('userId', data.id);
      sessionStorage.setItem('email', data.email);
      sessionStorage.setItem('token', data.token);


    } catch (response) {
      console.error(response);

      // Maneja el error, despacha la acción de cierre de sesión con el mensaje de error
      dispatch(onLogout('Email o contraseña incorrectos'));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);
    }
  };

  const checkAuth = async () => {

    const token = sessionStorage.getItem('token');

    if (!token) {
      // No hay información de usuario en el sessionStorage, usuario no autenticado
      return dispatch(onLogout());
    }

    try {
      const { data } = await inventarioApi.get('/auth/check', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('userId', data.id);
      
      return dispatch(onLogin({ name: data.fullName, id: data.id, rol: data.roles[0],foto:data.fotoUrl }));

    } catch (error) {
      console.error('Error checking status', error);
      return dispatch(onLogout());
      // Manejar el error según sea necesario
    }

  };

  const starLogout = () => {

    //sessionStorage.clear();
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('welcomeModalShown');


    dispatch(onLogout());
  }

  return {
    errorMessage,
    status,
    //*operaciones
    startLogin,
    checkAuth,
    starLogout
  }
}