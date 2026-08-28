import { defineStore } from "pinia";
import type { User,ApiResponse,UserProfile,Departments,Sectors,Company, TaskType,DefaultTaskType } from "@/types/types";
import type { Role } from "@/lib/permissions";
import axiosInstance from "@/plugins/axios";
import axios from "axios";
import { DUMMY_LOGGED_IN, DUMMY_LOGGED_IN_BY_ROLE, DUMMY_COMPANY } from "@/mock/mockData";
import { useTheme } from "@/composables/useTheme";
interface Step3Form {
  selected_types?: string[]
  use_all_default_task_types?: boolean
  company_id: string
  isStep3Complete: boolean
}
interface Step4Form {
  selected_types?: string[]
  use_all_default_departments?: boolean
  company_id: string
  isStep4Complete: boolean
}


export const useAuthStore =  defineStore('AuthStore',{
  state:()=>({
    step1Form:{
      email:'',
      username:'',
      password:'',
      isStep1Complete:false
    },
    step2Form:{
        name:'',
        owner:'',
        sector:'',
        isStep2Complete:false
    },
    step3Form:{
      selected_types:[],
      use_all_default_task_types:false,
      company_id:'',
      isStep3Complete:false
    } as Step3Form,
    step4Form:{
      selected_types:[],
      use_all_default_departments:false,
      company_id:'',
      isStep4Complete:false
    } as Step4Form ,
    departments:{} as DefaultTaskType[],
    logedInUserInfo:{} as {
      user: User
      is_authenticated: boolean
      access: string
      role?: Role | null
      company_id?: string | null
      company_name?: string | null
      company_created_at?: string | null
      departmentId?: string | null
    },
    company:{} as Company,
    sectors:{} as Sectors,
    defaultTaskTypes: {} as DefaultTaskType[],
    defaultEventTypes: {} as DefaultTaskType[]
  }),
  actions:{
    updateStep1Form(payload:Partial<typeof this.step1Form>){
      this.step1Form = {...this.step1Form,...payload}
    },
    updateStep2Form(payload:Partial<typeof this.step2Form>){
      this.step2Form = {...this.step2Form, ...payload}
    },
    updateStep3Form(payload:Partial<typeof this.step3Form>){
      this.step3Form = {...this.step3Form, ...payload}
    },
    updateStep4Form(payload:Partial<typeof this.step4Form>){
      this.step4Form = {...this.step4Form, ...payload}
    },
    restoreData(){
      this.step1Form = {
        email:'',
        username:'',
        password:'',
        isStep1Complete:false
      }
      this.step2Form = {
        name:'',
        owner:'',
        sector:'',
        isStep2Complete:false
      }
      this.step3Form={
      selected_types:[],
      use_all_default_task_types:false,
      company_id:'',
      isStep3Complete:false
    }
      this.step4Form={
      selected_types:[],
      use_all_default_departments:false,
      company_id:'',
      isStep4Complete:false
    }
    },
    async registerUser(form: Record<string, string|boolean>): Promise<{ user?: User; errors?: string }> {
      try {
        // step1Form carries isStep1Complete for wizard-navigation purposes
        // only -- never send it to the API.
        const { isStep1Complete, ...payload } = form
        const { data } = await axiosInstance.post<ApiResponse<{ user: User }>>('/auth/signup/', payload);
        return { user: data.data.user }
      } catch (error: any) {
        console.log("Full error response:", error.response)
        
        // Handle email exists case
        if (error.response?.data?.errors?.email) {
          const emailError = error.response.data.errors.email[0];
          if (emailError.includes("already registered")) {
            return { errors: "Account exists, please sign in" }
          }
          return { errors: emailError }
        }
        
        // Handle other cases
        return { 
          errors: error.response?.data?.message || 
                 "Signup failed. Please check your information and try again."
        }
      }
    },

    async userProfile(form:FormData):Promise<{userprofile?:UserProfile;errors?:string}>{
      try {
        const {data} = await axiosInstance.patch<ApiResponse<{userprofile:UserProfile}>>('/user/create_userprofile_info/',form,{
          headers:{'Content-Type':'multipart/form-data'}
        })
        return {userprofile:data.data.userprofile};
      }catch(error:any){
        console.log(error.respone?.data?.errors)
        const errorMsg = error.respone?.data?.errors || "please try again"
        return {errors:errorMsg}
      }
    },
    async updateTimezone(tz: string): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ timezone: string }>>(
          '/company/members/me/timezone/',
          { timezone: tz }
        )
        if (this.logedInUserInfo.user) this.logedInUserInfo.user.timezone = data.data.timezone
        return {}
      } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to update timezone' }
      }
    },
    async updateTheme(theme: 'light' | 'dark' | 'system'): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ theme: string }>>(
          '/company/members/me/theme/',
          { theme }
        )
        if (this.logedInUserInfo.user) this.logedInUserInfo.user.theme = data.data.theme as 'light' | 'dark' | 'system'
        return {}
      } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to update theme' }
      }
    },
    async acceptInvite(form: FormData): Promise<{ error?: string }> {
      try {
        await axiosInstance.post('/emp/accept_invite/', form)
        return {}
      } catch (error: any) {
        const fieldErrors = error.response?.data?.errors
        const passwordError = fieldErrors?.password?.[0]
        return { error: passwordError || error.response?.data?.message || 'Unable to accept this invitation.' }
      }
    },
    async loginUser(form: Record<string, string>): Promise<{ user?: User; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{
          user: User
          is_authenticated: boolean
          access: string
          role: Role | null
          company_id: string | null
          company_name: string | null
          company_created_at: string | null
          department_id: string | null
        }>>(
          '/auth/signin/',
          { ...form }
        )
        const { department_id, ...sessionData } = data.data
        this.logedInUserInfo = { ...sessionData, departmentId: department_id }
        sessionStorage.setItem("currentUserContent", JSON.stringify(this.logedInUserInfo))
        sessionStorage.setItem("currentAuthTokens", JSON.stringify({accessToken:this.logedInUserInfo.access}))

        // Follow the account's saved theme across devices/browsers -- but
        // never override a preference the user already set locally on this
        // device (e.g. right on the login screen before authenticating).
        const serverTheme = data.data.user.theme
        if (serverTheme && !localStorage.getItem('wr-theme')) {
          const { setTheme } = useTheme()
          setTheme(serverTheme)
        }

        return { user: data.data.user }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || "Login failed"
        return { error: errorMsg }
      }
    },
    logout(){
      this.logedInUserInfo.access = ''
      this.logedInUserInfo.is_authenticated = false
      this.logedInUserInfo.role = null
      this.logedInUserInfo.company_id = null
      this.logedInUserInfo.company_name = null
      this.logedInUserInfo.company_created_at = null
      this.logedInUserInfo.departmentId = null
      this.logedInUserInfo.user = {
        id:'',
        username:'',
        email:''
      }
      sessionStorage.removeItem("currentUserContent")
      sessionStorage.removeItem("currentAuthTokens")
      delete axiosInstance.defaults.headers.common['Authorization']
    },
    async register_company(form: Record<string, string | boolean | number>): Promise<{
      company?: Company;
      errors?: Record<string, string[]>;
      message?: string;
    }> {
      try {
        // step2Form carries isStep2Complete for wizard-navigation purposes
        // only -- never send it to the API.
        const { isStep2Complete, ...payload } = form
        const { data } = await axiosInstance.post<ApiResponse<Company>>('/company/register/', payload);

        if (data.success) {
          this.company = data.data
          return { company: data.data };
        } else {
          const errors = data.errors;

          if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
            
            return {
              errors,
              message: data.message || 'Validation failed',
            };
          } else {
            
            return {
              message: data.message || 'Something went wrong',
            };
          }
        }
      } catch (error: any) {
        return {
          message: error.response?.data?.message || 'Registration failed',
        };
      }
    },
    async getSectors():Promise<Sectors>{
      const {data} = await axiosInstance.get<ApiResponse<{sectors:Sectors}>>('/sectors/get_all_sectors/')
      this.sectors = data.data.sectors
      return data.data.sectors

    },
    async getDefaultTaskTypes(sectorId: string): Promise<DefaultTaskType[]> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ tasktypes: DefaultTaskType[] }>>(
          `/default_task_type/${sectorId}/default-tasktypes/`
        )
        this.defaultTaskTypes = data.data.tasktypes
        return data.data.tasktypes
      } catch (error) {
        console.error('Failed to fetch default task types:', error)
        throw error
      }
    },
    async createTaskType(form:Record<string,string[] | boolean | string |undefined>):Promise<{
            created_task_types?:any[];
            errors?: Record<string, string[]>;
            message?: string;
    }>{
      try{
        // step3Form carries isStep3Complete for wizard-navigation purposes
        // only -- never send it to the API.
        const { isStep3Complete, ...payload } = form
        const {data} = await axiosInstance.post<ApiResponse<{company_name:string;sector:string;owner_email:String;created_task_types:[]}>>('/default_task_type/default_task_type/',payload)
        if(data.success){
          console.log(data.data)
          return {created_task_types:data.data.created_task_types}
        }else{
          const errors = data.errors;

          if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
            
            return {
              errors,
              message: data.message || 'Validation failed',
            };
          } else {
            
            return {
              message: data.message || 'Something went wrong',
            };
          }        
        }
      }
      catch(error:any){
        return {
          message: error.response?.data?.message ||'failed to create task types',
        };
      }
    },
    // Unlike getDefaultTaskTypes/createTaskType above (the onboarding-wizard
    // pair, which needs an explicit sectorId/company_id since those legacy
    // endpoints predate auth-derived company resolution), event types are
    // fetched/enabled through company_config.py's post-registration
    // endpoints, which resolve the caller's company from the JWT -- no id
    // params needed. See the backend router's docstring for why.
    async getDefaultEventTypes(): Promise<DefaultTaskType[]> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ event_types: DefaultTaskType[] }>>(
          '/company/default-config/'
        )
        this.defaultEventTypes = data.data.event_types
        return data.data.event_types
      } catch (error) {
        console.error('Failed to fetch default event types:', error)
        throw error
      }
    },
    async createEventTypes(form: { selected_ids: string[]; use_all: boolean }): Promise<{
      created_event_types?: any[]
      errors?: Record<string, string[]>
      message?: string
    }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ created_event_types: any[] }>>(
          '/company/default-config/event-types/', form
        )
        if (data.success) return { created_event_types: data.data.created_event_types }
        return data.errors
          ? { errors: data.errors, message: data.message || 'Validation failed' }
          : { message: data.message || 'Something went wrong' }
      } catch (error: any) {
        return { message: error.response?.data?.message || 'failed to create event types' }
      }
    },
    async getDefaultDepartmentTypes(sectorId: string): Promise<DefaultTaskType[]> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ department_types: DefaultTaskType[] }>>(
          `/department/${sectorId}/dept_types/`
        )
        this.departments = data.data.department_types
        return data.data.department_types
      } catch (error) {
        console.error('Failed to fetch default Department types:', error)
        throw error
      }
    },
    async createDepartmentType(form:Record<string,string[] | boolean | string |undefined>):Promise<{
            created_departments?:any[];
            errors?: Record<string, string[]>;
            message?: string;
    }>{
      try{
        // step4Form carries isStep4Complete for wizard-navigation purposes
        // only -- never send it to the API.
        const { isStep4Complete, ...payload } = form
        const {data} = await axiosInstance.post<ApiResponse<{company_name:string;sector:string;owner_email:String;created_departments:[]}>>('/department/create_departments_from_defaults/',payload)
        if(data.success){
          console.log(data.data)
          return {created_departments:data.data.created_departments}
        }else{
          const errors = data.errors;

          if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
            
            return {
              errors,
              message: data.message || 'Validation failed',
            };
          } else {
            
            return {
              message: data.message || 'Something went wrong',
            };
          }        
        }
      }
      catch(error:any){
        return {
          message: error.response?.data?.message ||'failed to create task types',
        };
      }
    },
    
    // ──────────────────────────────────────────────────────────
    //  DEMO / MOCK LOGIN  –  works without any running backend
    // ──────────────────────────────────────────────────────────
    /**
     * Instantly authenticate as the demo user.
     * Use this when the API is unavailable (VITE_MOCK_API=true or
     * any time the backend is down).
     *
     * Dummy Credentials (for the real login form):
     *   Email    : demo@workroom.dev
     *   Password : Demo@1234
     */
    loginAsDummy(role: Role = 'Owner') {
      this.logedInUserInfo = { ...DUMMY_LOGGED_IN_BY_ROLE[role] }
      this.company          = { ...DUMMY_COMPANY }
      sessionStorage.setItem('currentUserContent', JSON.stringify(this.logedInUserInfo))
      sessionStorage.setItem('currentAuthTokens', JSON.stringify({ accessToken: DUMMY_LOGGED_IN.access }))
    },
  },
  persist:{
    storage:sessionStorage
  }
})
