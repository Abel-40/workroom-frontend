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
import { useDeviceClass } from '@/composables/useDeviceClass'

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
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
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

// ── Request interceptor: block mutations app-wide on mobile ───
// Mobile is read-only (see useDeviceClass.ts) -- every store's HTTP call
// already flows through this one shared instance, so gating it here covers
// every current and future mutating call without touching each store
// individually. The rejection is shaped like a normal axios error
// (response.data.message) so it flows through the exact same
// error.response?.data?.message convention every store's catch block
// already uses to surface a toast -- no separate toast plumbing needed.
const READ_ONLY_MESSAGE = 'Read-only on mobile'
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const { isReadOnly } = useDeviceClass()

axiosInstance.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (isReadOnly.value && MUTATING_METHODS.has(method)) {
    const blocked = new Error(READ_ONLY_MESSAGE) as Error & { response: unknown; isReadOnlyBlock: true }
    blocked.response = { data: { message: READ_ONLY_MESSAGE } }
    blocked.isReadOnlyBlock = true
    return Promise.reject(blocked)
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
        // Use the bare `axios` client (not axiosInstance) so this call never
        // flows back through our own response interceptor — a 401 here would
        // otherwise trigger another refresh attempt with no `_retry` guard.
        const { data } = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh-token/`,
          {},
          { withCredentials: true },
        )
        const newAccessToken = data.data.access
        sessionStorage.setItem('currentAuthTokens', JSON.stringify({
          accessToken: newAccessToken,
          refreshToken: '',
        }))
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
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
