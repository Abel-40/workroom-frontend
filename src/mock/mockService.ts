/**
 * ============================================================
 *  MOCK SERVICE  –  WorkRoom Frontend  (dev / offline mode)
 * ============================================================
 *  Intercepts every axiosInstance call and returns realistic
 *  dummy responses so the frontend can be developed and tested
 *  without a running backend API.
 *
 *  Activation
 *  ----------
 *  Set  VITE_MOCK_API=true  in your .env.local file
 *  OR   the mock mode is auto-enabled when the real API is
 *       unreachable (see axios.ts).
 * ============================================================
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  DUMMY_LOGGED_IN,
  DUMMY_USER,
  DUMMY_COMPANY,
  DUMMY_SECTORS,
  DUMMY_DEFAULT_TASK_TYPES,
  DUMMY_DEFAULT_DEPARTMENTS,
  DUMMY_USER_PROFILE,
} from './mockData'

// ── helper: build a fake ApiResponse envelope ─────────────────
function ok<T>(data: T, message = 'Success'): AxiosResponse {
  return {
    data: {
      success: true,
      message,
      statusCode: 200,
      data,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  }
}

// Dummy credentials accepted by the mock service
const DEMO_EMAIL    = 'demo@workroom.dev'
const DEMO_PASSWORD = 'Demo@1234'

/** Simulates a short network delay (ms) */
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms))

// ── Route Table ───────────────────────────────────────────────
type Handler = (url: string, config: AxiosRequestConfig) => Promise<AxiosResponse>

const GET_ROUTES: Record<string, Handler> = {
  // sectors
  '/sectors/get_all_sectors/': async () => {
    await delay()
    return ok({ sectors: DUMMY_SECTORS }, 'Sectors retrieved')
  },

  // default task types (matches /default_task_type/<sectorId>/default-tasktypes/)
  '/default_task_type/': async (url) => {
    await delay()
    const sectorId = parseInt(url.split('/')[2] ?? '1', 10)
    const types = DUMMY_DEFAULT_TASK_TYPES.filter((_, i) => (sectorId === 1 ? i < 6 : true))
    return ok({ tasktypes: types }, 'Default task types retrieved')
  },

  // default department types (matches /department/<sectorId>/dept_types/)
  '/department/': async (url) => {
    await delay()
    const sectorId = parseInt(url.split('/')[2] ?? '1', 10)
    const depts = DUMMY_DEFAULT_DEPARTMENTS.filter((_, i) => (sectorId === 1 ? i < 6 : true))
    return ok({ Department_types: depts }, 'Department types retrieved')
  },
}

const POST_ROUTES: Record<string, Handler> = {
  // login
  '/auth/signin/': async (_, config) => {
    await delay(400)
    const body = JSON.parse((config.data as string) || '{}')
    if (body.email === DEMO_EMAIL && body.password === DEMO_PASSWORD) {
      return ok(DUMMY_LOGGED_IN, 'Login successful')
    }
    const err: any = new Error('Invalid credentials')
    err.response = {
      status: 401,
      data: { success: false, message: 'Invalid email or password', statusCode: 401 },
    }
    throw err
  },

  // signup
  '/auth/signup/': async (_, config) => {
    await delay(500)
    const body = JSON.parse((config.data as string) || '{}')
    return ok({ user: { id: 'usr-new', username: body.username, email: body.email } }, 'User registered')
  },

  // company registration
  '/company/register/': async (_, config) => {
    await delay(400)
    const body = JSON.parse((config.data as string) || '{}')
    const company = { ...DUMMY_COMPANY, name: body.name || DUMMY_COMPANY.name, sector: body.sector ?? 1 }
    return ok(company, 'Company registered')
  },

  // task types creation
  '/default_task_type/default_task_type/': async (_, config) => {
    await delay(400)
    const body = JSON.parse((config.data as string) || '{}')
    const selected: number[] = body.selected_types || []
    const created = DUMMY_DEFAULT_TASK_TYPES.filter(t => selected.includes(t.id))
    return ok({
      company_name: DUMMY_COMPANY.name,
      sector: 'Technology',
      owner_email: DUMMY_USER.email,
      created_task_types: created,
    }, 'Task types created')
  },

  // department creation
  '/department/create_departments_from_defaults/': async (_, config) => {
    await delay(400)
    const body = JSON.parse((config.data as string) || '{}')
    const selected: number[] = body.selected_types || []
    const created = DUMMY_DEFAULT_DEPARTMENTS.filter(d => selected.includes(d.id))
    return ok({
      company_name: DUMMY_COMPANY.name,
      sector: 'Technology',
      owner_email: DUMMY_USER.email,
      created_departments: created,
    }, 'Departments created')
  },

  // token refresh
  '/user/refresh_token/': async () => {
    await delay(200)
    return ok({ access: 'mock-refreshed-token-xyz789' }, 'Token refreshed')
  },
}

const PATCH_ROUTES: Record<string, Handler> = {
  // user profile
  '/user/create_userprofile_info/': async () => {
    await delay(400)
    return ok({ userprofile: DUMMY_USER_PROFILE }, 'Profile updated')
  },
}

// ── Main dispatcher ───────────────────────────────────────────
export async function mockDispatch(
  method: string,
  url: string,
  config: AxiosRequestConfig,
): Promise<AxiosResponse> {
  const m = method.toUpperCase()

  const findHandler = (routes: Record<string, Handler>) => {
    // exact match first
    if (routes[url]) return routes[url]
    // prefix match
    const prefix = Object.keys(routes).find(k => url.startsWith(k))
    return prefix ? routes[prefix] : null
  }

  let handler: Handler | null = null
  if      (m === 'GET')   handler = findHandler(GET_ROUTES)
  else if (m === 'POST')  handler = findHandler(POST_ROUTES)
  else if (m === 'PATCH') handler = findHandler(PATCH_ROUTES)

  if (handler) {
    return handler(url, config)
  }

  // 404-style fallback
  const err: any = new Error(`[MockService] No mock for ${m} ${url}`)
  err.response = {
    status: 404,
    data: { success: false, message: `Mock not found: ${m} ${url}`, statusCode: 404 },
  }
  console.warn(`[MockService] Unhandled route: ${m} ${url}`)
  throw err
}
