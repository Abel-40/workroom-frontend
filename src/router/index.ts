import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
// Dynamic imports for better code splitting
const Login = () => import('@/views/Auth/login.vue')
const Signup = () => import('@/views/Auth/Signup.vue')
const AcceptInvite = () => import('@/views/Auth/AcceptInvite.vue')
const StepOne = () => import('@/views/Auth/StepOne.vue')
const StepTwo = () => import('@/views/Auth/StepTwo.vue')
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')
const Dashboard = () => import('@/views/Dashboard/DashboardHome.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login/'
    },
    {
      path: '/auth/login/',
      name: 'auth-login',
      component: Login
    },
    {
      path: '/invite/accept',
      name: 'accept-invite',
      component: AcceptInvite,
    },
    {
      path: '/auth/',
      name: 'auth',
      component: Signup,
      children: [
        {
          path: '', 
          name: 'owner-info',
          component: StepOne
        },
        {
          path: 'step2/',
          name: 'company-info',
          component: StepTwo,
          beforeEnter: (to, from, next) => {
            const authStore = useAuthStore()
            authStore.step1Form.isStep1Complete ? next() : next('/auth/')
          }
        }
      ]
    },
    {
      path: '/admin/dashboard/',
      name: 'admin-dashboard',
      component: DashboardLayout,
      meta: { requiredAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: Dashboard,
        }
      ]
    }
  ]
})


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiredAuth)

  // Redirect to login if user is not authenticated and the route requires it
  if (!authStore.logedInUserInfo.is_authenticated && requiresAuth) {
    return next('/auth/login/')
  }

  // Multi-step registration enforcement logic (steps are ?section= query
  // switches under the single /auth/ route, not separate paths)
  const step = to.query.section
  if (to.path.startsWith('/auth/')) {
    if (step === 'step2' && !authStore.step1Form.isStep1Complete) {
      return next({ path: '/auth/', query: { section: 'step1' } })
    }

    if (step === 'step3' && !authStore.step2Form.isStep2Complete) {
      return next({ path: '/auth/', query: { section: 'step2' } })
    }

    if (step === 'step4' && !authStore.step3Form.isStep3Complete) {
      return next({ path: '/auth/', query: { section: 'step3' } })
    }
  }

  next()
})


export default router
