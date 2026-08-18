/**
 * ============================================================
 *  MOCK DATA  –  WorkRoom Frontend  (dev / offline mode)
 * ============================================================
 *  All data lives here so the frontend team can develop and
 *  navigate every route without a running backend API.
 *
 *  Dummy Credentials
 *  -----------------
 *  Email    : demo@workroom.dev
 *  Password : Demo@1234
 * ============================================================
 */

// ── User ─────────────────────────────────────────────────────
export const DUMMY_USER = {
  id: 'usr-001',
  username: 'DemoUser',
  email: 'demo@workroom.dev',
  role: 'company_admin' as const,
}

export const DUMMY_ACCESS_TOKEN = 'mock-jwt-access-token-abcdef123456'

export const DUMMY_LOGGED_IN = {
  user: DUMMY_USER,
  is_authenticated: true,
  access: DUMMY_ACCESS_TOKEN,
}

// ── Company ──────────────────────────────────────────────────
export const DUMMY_COMPANY = {
  id: 1,
  name: 'Workroom Demo Corp',
  code: 'WDC-001',
  created_at: new Date('2025-01-15'),
  owner: 'demo@workroom.dev',
  sector: 1,
  plan: 'pro',
  stripe_customer_id: 'cus_mock_001',
  stripe_subscription_id: 'sub_mock_001',
  subscription_status: 'active',
  is_trial: false,
  trial_end: new Date('2025-02-15'),
  ai_agent_enabled: true,
}

// ── Sectors ──────────────────────────────────────────────────
export const DUMMY_SECTORS = [
  { id: 1, name: 'Technology',   description: 'Software, hardware, and IT services' },
  { id: 2, name: 'Healthcare',   description: 'Medical services and wellness' },
  { id: 3, name: 'Finance',      description: 'Banking, insurance, and investment' },
  { id: 4, name: 'Education',    description: 'Schools, training, and e-learning' },
  { id: 5, name: 'Retail',       description: 'Consumer goods and e-commerce' },
  { id: 6, name: 'Logistics',    description: 'Shipping, supply chain, and delivery' },
]

// ── Default Task Types (per sector) ──────────────────────────
export const DUMMY_DEFAULT_TASK_TYPES = [
  { id: 1,  name: 'Bug Fix',             description: 'Resolve a reported bug',              sector: 'Technology' },
  { id: 2,  name: 'Feature Development', description: 'Build a new product feature',         sector: 'Technology' },
  { id: 3,  name: 'Code Review',         description: 'Peer review of submitted code',       sector: 'Technology' },
  { id: 4,  name: 'Design Sprint',       description: 'UI/UX design and prototyping',        sector: 'Technology' },
  { id: 5,  name: 'Documentation',       description: 'Write technical documentation',       sector: 'Technology' },
  { id: 6,  name: 'QA Testing',          description: 'Quality assurance and testing',       sector: 'Technology' },
  { id: 7,  name: 'Patient Intake',      description: 'Process new patient registration',    sector: 'Healthcare' },
  { id: 8,  name: 'Clinical Review',     description: 'Medical record review',               sector: 'Healthcare' },
  { id: 9,  name: 'Invoice Processing',  description: 'Finance invoice handling',            sector: 'Finance' },
  { id: 10, name: 'Risk Assessment',     description: 'Evaluate financial risk factors',     sector: 'Finance' },
]

// ── Default Department Types (per sector) ────────────────────
export const DUMMY_DEFAULT_DEPARTMENTS = [
  { id: 1,  name: 'Engineering',       description: 'Software and systems engineering',      sector: 'Technology' },
  { id: 2,  name: 'Product',           description: 'Product management and strategy',       sector: 'Technology' },
  { id: 3,  name: 'Design',            description: 'UX/UI and graphic design',              sector: 'Technology' },
  { id: 4,  name: 'QA',               description: 'Quality assurance and testing',          sector: 'Technology' },
  { id: 5,  name: 'DevOps',           description: 'Infrastructure and deployments',          sector: 'Technology' },
  { id: 6,  name: 'Human Resources',   description: 'People operations and hiring',          sector: 'Technology' },
  { id: 7,  name: 'Clinical',          description: 'Clinical care and procedures',          sector: 'Healthcare' },
  { id: 8,  name: 'Administration',    description: 'Hospital admin and records',            sector: 'Healthcare' },
  { id: 9,  name: 'Risk Management',   description: 'Financial risk and compliance',         sector: 'Finance' },
  { id: 10, name: 'Accounts',          description: 'Payroll and invoicing',                 sector: 'Finance' },
]

// ── Projects + Tasks ─────────────────────────────────────────
export const DUMMY_PROJECTS = [
  {
    id: 'PNU001223',
    title: 'E-Learning Platform',
    icon: '🎓',
    createdAt: '2025-05-03',
    priority: { level: 'high', icon: 'ArrowUp', color: 'red' },
    assignee: ['Abel', 'Sarah', 'Michael'],
    assignedBy: 'John',
    status: 'Active',
    description: 'A comprehensive online learning system with courses, quizzes, and certification features.',
    deadline: '2025-08-30',
    task: {
      tasks: [
        {
          id: 'task-1',
          name: 'Define Course Modules',
          icon: '📘',
          createdAt: '2025-05-03',
          priority: { level: 'high' },
          assignee: 'Sarah',
          status: 'To Do',
          EstimatedTime: '2d',
          SpentTime: '0h',
          Progress: '0%',
          description: 'Outline the curriculum structure and learning objectives.',
          deadline: '2025-06-01',
        },
        {
          id: 'task-2',
          name: 'Create Landing Page',
          icon: '🖼️',
          createdAt: '2025-05-03',
          priority: { level: 'medium' },
          assignee: 'Michael',
          status: 'In Progress',
          EstimatedTime: '3d',
          SpentTime: '1d',
          Progress: '50%',
          description: 'Design and develop the main marketing page.',
          deadline: '2025-06-10',
        },
        {
          id: 'task-3',
          name: 'Build Quiz Engine',
          icon: '🧩',
          createdAt: '2025-05-05',
          priority: { level: 'high' },
          assignee: 'Abel',
          status: 'In Review',
          EstimatedTime: '4d',
          SpentTime: '4d',
          Progress: '100%',
          description: 'Implement the quiz creation and grading engine.',
          deadline: '2025-06-15',
        },
      ],
      total: 3,
      active: 2,
    },
  },
  {
    id: 'PNU001224',
    title: 'Hotel Booking App',
    icon: '🏨',
    createdAt: '2025-05-04',
    priority: { level: 'medium', icon: 'ArrowDown', color: 'orange' },
    assignee: ['Emma', 'David'],
    assignedBy: 'Emma',
    status: 'Active',
    description: 'Mobile and web app for booking hotels with real-time availability.',
    deadline: '2025-09-15',
    task: {
      tasks: [
        {
          id: 'task-4',
          name: 'User Authentication',
          icon: '🔐',
          createdAt: '2025-05-04',
          priority: { level: 'high' },
          assignee: 'Emma',
          status: 'In Progress',
          EstimatedTime: '2d',
          SpentTime: '1d',
          Progress: '50%',
          description: 'Implement secure login/signup flows.',
          deadline: '2025-06-20',
        },
        {
          id: 'task-5',
          name: 'Room Search & Filter',
          icon: '🔍',
          createdAt: '2025-05-06',
          priority: { level: 'medium' },
          assignee: 'David',
          status: 'To Do',
          EstimatedTime: '3d',
          SpentTime: '0h',
          Progress: '0%',
          description: 'Build search functionality with advanced filters.',
          deadline: '2025-06-30',
        },
      ],
      total: 2,
      active: 1,
    },
  },
  {
    id: 'PNU001225',
    title: 'Healthcare Dashboard',
    icon: '🏥',
    createdAt: '2025-05-05',
    priority: { level: 'high', icon: 'ArrowUp', color: 'red' },
    assignee: ['Lisa', 'James'],
    assignedBy: 'Alex',
    status: 'In Active',
    description: 'Platform for patient health monitoring and analytics.',
    deadline: '2025-10-01',
    task: {
      tasks: [
        {
          id: 'task-6',
          name: 'Data Visualization',
          icon: '📊',
          createdAt: '2025-05-05',
          priority: { level: 'medium' },
          assignee: 'Lisa',
          status: 'To Do',
          EstimatedTime: '3d',
          SpentTime: '0h',
          Progress: '0%',
          description: 'Create interactive health metrics charts.',
          deadline: '2025-07-01',
        },
      ],
      total: 1,
      active: 0,
    },
  },
  {
    id: 'PNU001226',
    title: 'Fitness Tracker',
    icon: '🏋️',
    createdAt: '2025-05-06',
    priority: { level: 'medium', icon: 'ArrowUp', color: 'orange' },
    assignee: ['Abel', 'Emma'],
    assignedBy: 'Lisa',
    status: 'Done',
    description: 'Mobile app for workout tracking and health metrics.',
    deadline: '2025-06-30',
    task: {
      tasks: [
        {
          id: 'task-7',
          name: 'Workout Logging',
          icon: '📝',
          createdAt: '2025-05-06',
          priority: { level: 'high' },
          assignee: 'Abel',
          status: 'Done',
          EstimatedTime: '2d',
          SpentTime: '2d',
          Progress: '100%',
          description: 'Implement exercise tracking functionality.',
          deadline: '2025-06-15',
        },
      ],
      total: 1,
      active: 0,
    },
  },
  {
    id: 'PNU001227',
    title: 'E-Commerce Platform',
    icon: '🛒',
    createdAt: '2025-05-07',
    priority: { level: 'high', icon: 'ArrowUp', color: 'red' },
    assignee: ['David', 'Sarah'],
    assignedBy: 'Mark',
    status: 'Active',
    description: 'Online store with product catalog and checkout system.',
    deadline: '2025-11-30',
    task: {
      tasks: [
        {
          id: 'task-8',
          name: 'Payment Gateway',
          icon: '💳',
          createdAt: '2025-05-07',
          priority: { level: 'high' },
          assignee: 'David',
          status: 'In Progress',
          EstimatedTime: '3d',
          SpentTime: '1d',
          Progress: '33%',
          description: 'Integrate Stripe payment processing.',
          deadline: '2025-07-20',
        },
      ],
      total: 1,
      active: 1,
    },
  },
  {
    id: 'PNU001228',
    title: 'AI Content Moderator',
    icon: '🤖',
    createdAt: '2025-05-10',
    priority: { level: 'high', icon: 'ArrowUp', color: 'red' },
    assignee: ['Henry', 'Ivy'],
    assignedBy: 'Emma',
    status: 'Active',
    description: 'Automated system for detecting inappropriate content using ML.',
    deadline: '2025-12-01',
    task: {
      tasks: [
        {
          id: 'task-9',
          name: 'Model Training',
          icon: '🧠',
          createdAt: '2025-05-10',
          priority: { level: 'high' },
          assignee: 'Henry',
          status: 'In Progress',
          EstimatedTime: '5d',
          SpentTime: '3d',
          Progress: '75%',
          description: 'Train NLP model on flagged content datasets.',
          deadline: '2025-08-01',
        },
        {
          id: 'task-10',
          name: 'Image Recognition',
          icon: '🖼️',
          createdAt: '2025-05-10',
          priority: { level: 'high' },
          assignee: 'Ivy',
          status: 'In Review',
          EstimatedTime: '4d',
          SpentTime: '4d',
          Progress: '100%',
          description: 'Implement visual content analysis system.',
          deadline: '2025-07-30',
        },
      ],
      total: 2,
      active: 2,
    },
  },
]

// ── User Profile ──────────────────────────────────────────────
export const DUMMY_USER_PROFILE = {
  email: 'demo@workroom.dev',
  address: '123 Demo Street, San Francisco, CA',
  profile_picture: null,
  phone_number: '+1 (555) 000-1234',
  department: 'Engineering',
  resume: null,
}
