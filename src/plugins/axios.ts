/**
 * axios.ts
 *
 * When  VITE_MOCK_API=true  (set in .env.local) every request is
 * handled by the local mock service instead of the real API.
 * This lets the frontend team work fully offline without a backend.
 */
import router from '@/router'
import axios from 'axios'
import { mockDispatch } from '@/mock/mockService'

// ── Is mock mode active? ───────────────────────────────────────
export const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true'

if (MOCK_MODE) {
  console.info(
    '%c[WorkRoom] 🧪 MOCK API mode is ON — no real backend needed.\n' +
    '   Dummy credentials → demo@workroom.dev / Demo@1234',
    'color:#3F8CFF;font-weight:bold;',
  )
}

// ── Axios instance ─────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
})

// ── Request interceptor: attach the access token, if any ──────
axiosInstance.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('currentAuthTokens')
  const accessToken = raw ? (JSON.parse(raw).accessToken as string | undefined) : undefined
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
}, (error) => Promise.reject(error))

// ── Request interceptor: short-circuit in mock mode ───────────
axiosInstance.interceptors.request.use((config) => {
  if (!MOCK_MODE) return config   // real mode: pass through

  // Replacing the adapter prevents Axios from opening a real HTTP connection.
  config.adapter = async (requestConfig) => {
    const response = await mockDispatch(
      requestConfig.method ?? 'get',
      requestConfig.url ?? '',
      requestConfig,
    )
    return { ...response, config: requestConfig }
  }
  return config
}, (error) => Promise.reject(error))

// ── Response interceptor ───────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // --- Mock mode: propagate mock errors directly ---------------
    if (MOCK_MODE) {
      return Promise.reject(error)
    }

    // --- Real mode: handle 401 with token refresh ---------------
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post('/user/refresh_token/', {}, { withCredentials: true })
        sessionStorage.setItem('currentAuthTokens', JSON.stringify({
          accessToken: data.access,
          refreshToken: '',
        }))
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`
        return axiosInstance(originalRequest)
      } catch {
        sessionStorage.clear()
        router.push('/auth/login/')
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
