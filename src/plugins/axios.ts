import router from '@/router'
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL:'http://127.0.0.1:8000/api'
})

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post('/user/refresh_token/', {}, { withCredentials: true })
        sessionStorage.setItem('currentAuthTokens', JSON.stringify({
          accessToken: data.access,
          refreshToken: '' // refresh remains in cookie
        }))
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        sessionStorage.clear()
        router.push('/Auth/login/')
      }
    }
    return Promise.reject(error)
  }
)

export default  axiosInstance