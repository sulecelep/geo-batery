import { defineBoot } from "#q-app/wrappers";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: "https://localhost:7071/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// 📌 Request Interceptor (Token ekleme)
api.interceptors.request.use(
  (config) => {
    //const token = localStorage.getItem("token"); // 🔑 Token'ı localStorage'dan al
    const token = "Token Buraya Girilmelidir"; // 🔑 Token'ı localStorage'dan al
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 📌 Response Interceptor (Hata yönetimi)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⛔ Yetkisiz! Token geçersiz veya süresi dolmuş.");
      // Burada istersen logout yapabilirsin
    }
    return Promise.reject(error);
  }
);
export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
