
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  employee_id: string | null;
  personId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  age: number | null;
  groupId: string | null;
  role: string;
  school: string | null;
  image: string | null;
  image_url: string | null;
  startDate: string | null;
  endDate: string | null;
  can_login: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventLog {
  id: number;
  entered_ipAddress: string | null;
  leaved_ipAddress: string | null;
  subEventType: number;
  userType: string;
  enter_dateTime: string | null;
  leave_dateTime: string | null;
  entered_face_mood: string | null;
  entered_face_confidence: number | null;
  entered_emotion: string | null;
  status: string | null;
  employee: number | null;
  entered_device: number | null;
  leaved_device: number | null;
}

export interface AttendanceLog {
  employee_id?: number;
  pupil_id?: number;
  employee_name?: string;
  pupil_name?: string;
  log_date: string;
  first_entry: string | null;
  last_exit: string | null;
  status: string | null;
  entered_face_mood: string | null;
  total_logs: number;
  worked_hours: string | number | null;
}

export interface Device {
  id: number | string;
  name: string;
  hikcentral_device_id?: string;
  ezvizSerialNo?: string;
  ipAddress?: string;
  deviceCategory?: string | null;
  model?: string;
  status?: 'Online' | 'Offline';
  type?: 'Camera' | 'Terminal' | 'NVR' | 'IN' | 'OUT';
  location?: string;
  lastSeen?: string;
  userName?: string; 
  password?: string;
  ezvizVerifyCode?: string;
}

export interface AccessResource {
  id: string;
  name: string;
  type: number;
  areaInfo: {
    id: string;
    name: string;
  };
}

export interface AccessLevel {
  id: string;
  name: string;
  remark: string;
  usageType: number;
  areaInfo: {
    id: string;
    name: string;
  };
  timeSchedule: {
    id: string;
    name: string;
  };
  associateResList: AccessResource[];
}

export interface School {
  id: number;
  name: string;
  code?: string | null;
  parentAreaID?: string;
  area_id?: string;
  has_children?: boolean;
  level?: number;
  children?: School[];
  devices?: Device[]; 
  device_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClassGroup {
  id: number;
  name: string;
  teacherName?: string;
  room?: string;
  studentCount: number;
  school?: number;
}

export interface Department {
  id: number;
  name: string;
  headName?: string;
  employeeCount: number;
  school?: number;
}

export interface ApiListResponse<T> {
  data: T[];
  total_elements: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  from: number;
  to: number;
}

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  employee_id: string;
  phone: string;
  email: string;
  role: string;
  gender: number;
  school_id: number;
  department_id?: number | null;
  classroom_id?: number | null;
  image_url?: string;
  startDate?: string;
  endDate?: string;
  attendanceRate?: number;
  checkIn?: string;
  checkOut?: string;
  mood?: Mood;
}

export interface Student extends Person {
  class?: string;
  parentPhone?: string;
}

export interface Employee extends Person {
  position?: string;
  status?: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export enum Mood {
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  SAD = 'SAD',
  TIRED = 'TIRED',
  ANGRY = 'ANGRY'
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  view?: string;
  children?: NavItem[];
}

// --- Dashboard Specific Types ---

export interface TrendMetric {
  value: number;
  trend_value: number | null;
  trend_label: string;
  trend_type: 'up' | 'down' | 'stable';
}

export interface MoodStatItem {
  count: number;
  percentage: number;
}

export interface MoodStats {
  xursand: MoodStatItem;
  oddiy: MoodStatItem;
  charchagan: MoodStatItem;
  no_face: MoodStatItem;
  total_detected: number;
  total: number;
}

export interface WeeklyChartItem {
  day: string;
  percentage: number;
}

export interface WeeklyMoodChartItem {
  day: string;
  xursand: number;
  oddiy: number;
  charchagan: number;
  no_face: number;
}

export interface DashboardUserLog {
  employee_id: number;
  employee_name: string;
  initials: string;
  school_name: string;
  status: 'late' | 'ontime' | 'early' | string;
  mood: string | null;
  mood_confidence: number | null;
  enter_time: string | null;
  leave_time: string | null;
}

export interface DashboardStats {
  total_students: TrendMetric;
  total_employees: TrendMetric;
  today_attendance: TrendMetric;
  today_late: TrendMetric;
  mood_stats: MoodStats;
  weekly_chart: WeeklyChartItem[];
  weekly_mood_chart: WeeklyMoodChartItem[];
  entered_users: DashboardUserLog[];
  leaved_users: DashboardUserLog[];
  status: string | null;
  mood: string | null;
}
