import axios from "axios";

const redirectToLogin = () => (window.location.href = "/");
const redirectToForbidden = () => (window.location.href = "/forbidden");

export const paramsSerializer = (params) => {
  const searchParams = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const param = params[key];
    if (Array.isArray(param)) {
      for (const p of param) {
        searchParams.append(key, p);
      }
    } else if (params[key] !== null && params[key] !== undefined)
      searchParams.append(key, param);
  }
  return searchParams.toString();
}

const client = axios.create({
  timeout: 50000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  paramsSerializer
});

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) 
        redirectToForbidden()
    if (error.response && error.response.status === 401) 
        redirectToLogin()
    return Promise.reject(error)
  }
);
export default client