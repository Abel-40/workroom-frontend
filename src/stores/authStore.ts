import { defineStore } from "pinia";
import type { User,ApiResponse,UserProfile,Departments,Sectors,Company, TaskType,DefaultTaskType } from "@/types/types";
import axiosInstance from "@/plugins/axios";
interface Step3Form {
  selected_types?: number[]
  use_all_default_task_types?: boolean 
  company_id: number
  isStep3Complete: boolean
}
interface Step4Form {
  selected_types?: number[]
  use_all_default_departments?: boolean    
  company_id: number
  isStep3Complete: boolean
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
        sector:0,
        isStep2Complete:false
    },
    step3Form:{
      selected_types:[],
      use_all_default_task_types:false,
      company_id:0,
      isStep3Complete:false
    } as Step3Form,
    step4Form:{
      selected_types:[],
      use_all_default_departments:false,
      company_id:0,
      isStep3Complete:false
    } as Step4Form ,
    departments:{} as DefaultTaskType[],
    logedInUserInfo:{} as { user: User; is_authenticated:boolean; access:string },
    company:{} as Company,
    sectors:{} as Sectors,
    defaultTaskTypes: {} as DefaultTaskType[]
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
        sector:0,
        isStep2Complete:false
      }
      this.step3Form={
      selected_types:[],
      use_all_default_task_types:false,
      company_id:0,
      isStep3Complete:false
    }
      this.step4Form={
      selected_types:[],
      use_all_default_departments:false,
      company_id:0,
      isStep3Complete:false
    }
    },
    async registerUser(form: Record<string, string|boolean>): Promise<{ user?: User; errors?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ user: User }>>('/auth/signup/', {...form });
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
    async loginUser(form: Record<string, string>): Promise<{ user?: User; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ user: User; is_authenticated:boolean; access: string;}>>(
          '/auth/signin/',
          { ...form }
        )
        console.log(data.data)
        this.logedInUserInfo = data.data
        sessionStorage.setItem("currentUserContent", JSON.stringify(this.logedInUserInfo))
        sessionStorage.setItem("currentAuthTokens", JSON.stringify({accessToken:this.logedInUserInfo.access}))
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${this.logedInUserInfo.access}`;
        return { user: data.data.user }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || "Login failed"
        return { error: errorMsg }
      }
    },
    logout(){
      this.logedInUserInfo.access = '',
      this.logedInUserInfo.is_authenticated = false
      this.logedInUserInfo.user = {
        id:'',
        username:'',
        email:''
      }
      sessionStorage.removeItem("currentUserContent")
      sessionStorage.removeItem("currentAuthTokens")
    },
    async register_company(form: Record<string, string | boolean | number>): Promise<{
      company?: Company;
      errors?: Record<string, string[]>;
      message?: string;
    }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<Company>>('/company/register/', form);

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
    async getDefaultTaskTypes(sectorId: number): Promise<DefaultTaskType[]> {
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
    async createTaskType(form:Record<string,number[] | boolean | number |undefined>):Promise<{
            created_task_types?:any[];
            errors?: Record<string, string[]>;
            message?: string;
    }>{
      try{
        const {data} = await axiosInstance.post<ApiResponse<{company_name:string;sector:string;owner_email:String;created_task_types:[]}>>('/default_task_type/default_task_type/',form)
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
    async getDefaultDepartmentTypes(sectorId: number): Promise<DefaultTaskType[]> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ Department_types: DefaultTaskType[] }>>(
          `/department/${sectorId}/dept_types/`
        )
        this.departments = data.data.Department_types
        return data.data.Department_types
      } catch (error) {
        console.error('Failed to fetch default Department types:', error)
        throw error
      }
    },
      async getCompanyDepartment(userId: number): Promise<DefaultTaskType[]> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ Department_types: DefaultTaskType[] }>>(
          `/department/${userId}/dept_types/`
        )
        return data.data.Department_types
      } catch (error) {
        console.error('Failed to fetch default Department types:', error)
        throw error
      }
    },
    async createDepartmentType(form:Record<string,number[] | boolean | number |undefined>):Promise<{
            created_departments?:any[];
            errors?: Record<string, string[]>;
            message?: string;
    }>{
      try{
        const {data} = await axiosInstance.post<ApiResponse<{company_name:string;sector:string;owner_email:String;created_departments:[]}>>('/department/create_departments_from_defaults/',form)
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
    async inviteNewEmployee(form:Record<string,string | number>):Promise<{email?:string,errors?:Record<string,string[]>,message?:string}>{
      try{
        const {data} = await axiosInstance.post<ApiResponse<{email:string; token:string}>>('/auth/send_invite/',form)
         if(data.success){
          console.log(data.data)
          return {email:data.data.email}
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
          message: error.response?.data?.message ||'failed to Invite new Employee',
        };
      }
    }
    
  },
  persist:{
    storage:sessionStorage
  }
})