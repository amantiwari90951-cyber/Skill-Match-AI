import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:3000" : window.location.origin,
  withCredentials: true,
});

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return error?.message || "Something went wrong. Please try again.";
};

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}