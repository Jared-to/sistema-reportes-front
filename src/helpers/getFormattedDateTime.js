

// Función para obtener la fecha y hora formateada
const getFormattedDateTime = () => {
  const date = new Date();

  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = date.toLocaleDateString('es-ES', options).replace(/\//g, '/'); // 17/09/2024

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // La hora 0 la convertimos a 12
  const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}${ampm}`; // 12:00PM

  return `${formattedDate} ${formattedTime}`;
};


export default getFormattedDateTime;
