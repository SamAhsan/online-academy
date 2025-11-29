/**
 * TypeScript type definitions
 */

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  teacher_id?: number;
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface TeacherWithStats extends Teacher {
  total_students: number;
  daily_hours: number;
  monthly_hours: number;
}

export interface Student {
  id: number;
  name: string;
  parent_contact?: string;
  teams_id?: string;
  assigned_teacher_id?: number;
  schedule?: string;
  fee_amount: number;
  fee_status: 'paid' | 'unpaid';
  notes?: string;
  created_at: string;
  updated_at?: string;
  teacher_name?: string;
}

export interface Lesson {
  id: number;
  student_id: number;
  teacher_id: number;
  date: string;
  start_time: string;
  end_time?: string;
  duration: number;
  notes?: string;
  created_at: string;
  student_name?: string;
  teacher_name?: string;
}

export interface Payment {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  student_name?: string;
}

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  active_teachers: number;
  unpaid_students: number;
  students_without_teams_id: number;
  lessons_today: number;
  lessons_this_month: number;
  total_revenue_this_month: number;
  pending_revenue_this_month: number;
}

export interface TeacherDailyHours {
  teacher_id: number;
  teacher_name: string;
  date: string;
  total_hours: number;
}

export interface StudentLessonHistory {
  student_id: number;
  student_name: string;
  total_lessons: number;
  total_hours: number;
}
