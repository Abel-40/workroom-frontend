import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type {Departments,ApiResponse} from "@/types/types"
export const useDepartmentStore = defineStore('useDepartmentStore',{
    actions:{
          async get_company_departments(): Promise<{
            company_departments?: Departments,
            errors?: Record<string, string[]> | string
          }> {
            try {
              const { data } = await axiosInstance.get<
                ApiResponse<{ company_departments?: Departments }>
              >('/department/get_company_departments/');

              // Check if response is successful and data exists
              if (data.success && data.data?.company_departments) {
                return {
                  company_departments: data.data.company_departments,
                };
              } else {
                return {
                  errors: data.message || 'Unexpected response format',
                };
              }

            } catch (error: any) {
              return {
                errors:
                  error.response?.data?.errors ||
                  error.response?.data?.message ||
                  'Failed to fetch company departments',
              };
            }
          }

    }

})