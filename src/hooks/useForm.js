import { useState } from "react";

export const useForm = (use = {}) => {


  //este hook es para el formulario tiene un useState para guardar ahi los valores y poder mandarlos ya sea
  //a la api o a los reducer(redux) 

  const [formState, setFormState] = useState(use);


  const onInputChange = ({ target }) => {
    const { name, value, files, type } = target;

    if (type === 'file') {
      setFormState((prevState) => ({
        ...prevState,
        [name]: files[0]
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormState(use);
  }


  return {
    ...formState,
    setFormState,
    formState,
    onInputChange,
    resetForm,

  }


}