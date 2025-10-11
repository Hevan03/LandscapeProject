import axios from "axios";

const API = "http://localhost:5001/api/landscaper-requests";

export const createLandscaperRequest = (data) => axios.post(API, data);
export const getAllLandscaperRequests = () => axios.get(API);