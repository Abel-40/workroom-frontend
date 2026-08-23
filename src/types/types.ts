
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  errors?: Record<string, string[]> | string[]; 
  code?: string | number;                       
  meta?: Record<string, any>;                   
  pagination?: {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
    [key: string]: any;
  };
};



// Supporting types
export type ImageType = File | string; // File (uploaded) or string (URL)

// Main User Types
export type UserRole = "company_admin" | "department_leader" | "member";

export type User = {
  id: string;
  email: string;
  username: string;
  role?: UserRole;
};

export type UserProfile = {
  email: string;
  address: string;
  profile_picture: ImageType | null;
  phone_number: string;
  department: string | null;
  resume: File | null;
};

// Department
type Department = {
  readonly id: string;
  name: string;
  created_by: string;
  leader: string;
};

// Sector
interface Sector{
  id:string,
  name:string,
  description:string
}

// Company
export interface Company{
  id:string;
  name:string;
  code?:string;
  created_at:Date;
  owner:string;
  sector:string;
  plan?:string;
  stripe_customer_id?:string;
  stripe_subscription_id?:string;
  subscription_status?:string;
  is_trial?:boolean;
  trial_end?:Date;
  ai_agent_enabled:boolean;
}


export type Sectors = Sector[]
// Task — real backend shape (projects_and_tasks.models.Task / api/routers/tasks.py:task_data()).
export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskSource = 'manual' | 'ai_generated';

export interface TaskType {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  createdById: string | null;
  assignedToId: string | null;
  assigneeName: string | null; // resolved via employeeStore, not sent by the API directly
  departmentId: string | null;
  taskTypeId: string | null;
  deadline: string;
  estimatedTimeHours: number | null;
  spentTimeHours: number | null;
  // Formatted percentage string, e.g. "0%", "33%", "100%" — computed from spentTimeHours/estimatedTimeHours.
  progress: string;
  createdAt: string;
  updatedAt: string;
}

// default task type
export interface DefaultTaskType {
   id:string;
   name:string;
   description:string;
   sector:string;
}
// Project
export type ProjectVisibility = 'public' | 'company' | 'department' | 'private';

// A project's cover image is either an uploaded file (streamed back through
// an authenticated endpoint -- there's no public /media/ route for uploads)
// or a plain external link the browser can load directly.
export type ProjectCoverImage = { kind: 'upload' | 'link'; url: string };

export interface Project {
  id: string;
  title: string;
  icon: string;
  createdAt: string;
  status: 'Active' | 'In Active' | 'Done';
  image?: ProjectCoverImage | null;
  priority: {
    level: 'low' | 'medium' | 'high';
    icon: 'ArrowDown' | 'ArrowUp';
    color: string;
  };
  task: {
    tasks: TaskType[] | null;
    total: number;
    active: number;
  };
  assignee: string[];
  assignedBy: string;
  description: string;
  deadline: string;
  // Real backend fields (Phase C) -- absent from decorative mock/demo data.
  departmentId?: string | null;
  visibility?: ProjectVisibility;
  startDate?: string;
  assigneeIds?: string[];
  createdById?: string | null;
  currentOwnerId?: string | null;
  currentOwnerName?: string | null;
}

export type Departments = Department[];
