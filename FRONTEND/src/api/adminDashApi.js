import axios from "axios";

export const getAllDrivers = () => axios.get("http://localhost:5001/api/delivery/driver");
export const getAllVehicles = () => axios.get("http://localhost:5001/api/vehicles");
