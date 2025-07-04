
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
export type FileLink = {
  type: 'file';
  file: File;
  name: string;
};

export type UrlLink = {
  type: 'link';
  url: string;
  label?: string;
};

export type ImageType = File | string; // File (uploaded) or string (URL)

// Main User Types
export type User = {
  id: string;
  email: string;
  username: string;
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
  readonly id: number;
  name: string;
  company:number
  description: string;
  leader: string;
  created_at:string;
};

// Sector 
interface Sector{
  id:number,
  name:string,
  description:string
}

// Company
export interface Company{
  id:number;
  name:string;
  code?:string;
  created_at:Date;
  owner:string;
  sector:number;
  plan?:string;
  stripe_customer_id?:string;
  stripe_subscription_id?:string;
  subscription_status?:string;
  is_trial?:boolean;
  trial_end?:Date;
  ai_agent_enabled:boolean;
}


export type Sectors = Sector[]
// Task
export interface TaskType {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  description: string;
  priority: {
    level: 'low' | 'medium' | 'high';
  };
  assignee: string;
  status: 'Done' | 'In Progress' | 'To Do' | 'In Review';
  EstimatedTime?: string;
  attachments?: Array<FileLink | UrlLink>;
  SpentTime?: string;
  Progress: '0%' | '10%' | '50%' | '75%' | '100%';
  deadline: string;
}

// default task type
export interface DefaultTaskType {
   id:number;
   name:string;
   description:string;
   sector:string;
}
// Project
export interface Project {
  id: string;
  title: string;
  icon: string;
  createdAt: string;
  status: 'Active' | 'In Active' | 'Done';
  image?: ImageType;
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
}

export type Departments = Department[];
