import axios from 'axios';

export const getAllDrivers = () => axios.get('http://localhost:5000/drivers');
export const getAllVehicles = () => axios.get('http://localhost:5000/vehicles');
