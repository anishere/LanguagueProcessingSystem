import axios from 'axios';

export const axiosCus = axios.create({
	// ser chạy gì thay chuẩn đó
    baseURL: `http://127.0.0.1:8000/`,
});

axiosCus.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });

  export default axiosCus