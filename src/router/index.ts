import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
// Dynamic imports for better code splitting
const HomeView = () => import('@/views/HomeView.vue')
const Login = () => import('@/views/Auth/login.vue')
const Signup = () => import('@/views/Auth/Signup.vue')
const StepOne = () => import('@/views/Auth/StepOne.vue')
const StepTwo = () => import('@/views/Auth/StepTwo.vue')
const DashboardLayout = () => import('@/views/Admin/DashboardLayout.vue')
const Dashboard = () => import('@/components/Dashboard/Containers/Dashboard.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/check/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/auth/login/',
      name: 'auth-login',
      component: Login
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
            authStore.step1Form.isStep1Complete ? next() : next('/auth/step1/')
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
  const authPages = ['/auth/login/', '/auth/step1/', '/auth/step2/', '/auth/step3/', '/auth/step4/']
   const requiresAuth = to.matched.some(record => record.meta.requiredAuth)

  const step = to.query.section

  // Redirect to login if user is not authenticated and the route requires it
  if (!authStore.logedInUserInfo.is_authenticated && requiresAuth && !authPages.includes(to.path)) {
    return next('/auth/login/')
  }

  // Multi-step registration enforcement logic
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