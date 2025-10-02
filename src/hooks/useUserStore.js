
import { useDispatch, useSelector } from 'react-redux'

import { checking, clearErrorMessage, onFalse, onTrue } from '../store/functions/authFunctions';
import { inventarioApi } from '../api/inventario';


export const useUserStore = () => {

  const { message, load } = useSelector(state => state.functions);
  const dispatch = useDispatch();
  const token = sessionStorage.getItem('token');

  const getUsers = async () => {
    dispatch(checking());
    try {
      const { data } = await inventarioApi.get('auth/usuarios', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(onTrue({ message: true }));

      return data;
    } catch (error) {
      console.log("catch", error);
      dispatch(onFalse(error.response.data.error));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);
    }
  }

  const createUser = async (form) => {
    const datos = {
      username: form.username || '',
      password: form.password || '',
      fullName: form.nombre || '',
      roles: [form.rol],
    };

    dispatch(checking());
    try {
      const { data } = await inventarioApi.post('/auth/register', datos, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      dispatch(onTrue({ message: data }));
      return data;
    } catch (error) {
      console.log("catch", error);
      dispatch(onFalse(error.response.data.error));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);

      throw error.response?.data;
    }
  };

  const getUser = async (id) => {
    dispatch(checking());
    try {
      const { data } = await inventarioApi.get(`auth/usuarios/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(onTrue({ message: true }));

      return data;
    } catch (error) {
      console.log("catch", error);
      dispatch(onFalse(error.response.data.error));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);
    }
  }
  const updateUser = async (form, id) => {
    const datos = {
      username: form.username || '',
      password: form.password || '',
      fullName: form.nombre || '',
      roles: [form.rol],

    };
    if (datos.password==='') {
      delete datos.password;
    }

    dispatch(checking());
    try {
      const { data } = await inventarioApi.patch(`/auth/usuarios/${id}`, datos, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      dispatch(onTrue({ message: data }));
      return data;
    } catch (error) {
      console.log("catch", error);
      dispatch(onFalse(error.response.data.error));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);

      throw error.response?.data;
    }
  };

  const isStatus = async (id) => {
    dispatch(checking());
    try {
      const { data } = await inventarioApi.patch(`auth/deactivate/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(onTrue({ message: true }));

      return data;
    } catch (error) {
      console.log("catch", error);
      dispatch(onFalse(error.response.data.error));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);
    }
  }
  const deleteUser = async (id) => {
    dispatch(checking());
    try {
      const { data } = await inventarioApi.delete(`auth/usuario/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(onTrue({ message: true }));

      return data;
    } catch (error) {
      console.log("catch", error);
      dispatch(onFalse(error.response.data.error));

      // Limpia el mensaje de error después de 5 segundos
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 5000);
      throw error.response?.data;
    }
  }

  return {
    message,
    load,
    createUser,
    getUsers,
    getUser,
    updateUser,
    isStatus,
    deleteUser

  }
}