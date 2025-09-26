import axios from 'axios'
import { getEnvVariables } from '../helpers/getEnvValriables';

const { VITE_API_URL } = getEnvVariables();

export const inventarioApi = axios.create({
  baseURL: VITE_API_URL
})




