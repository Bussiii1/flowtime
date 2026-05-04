/**
 * Workforce Management Type Definitions
 */

/**
 * Represents a single work shift
 */
export interface Shift {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  status: 'pending' | 'validated' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

/**
 * User roles in the application
 */
export type UserRole = 'admin' | 'employee';

/**
 * Employee status types for tax/legal purposes
 */
export type EmployeeStatusType = 'student' | 'volunteer' | 'extra';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status_type: EmployeeStatusType;
  hourly_rate: number;
  avatar_url?: string;
  qr_token?: string;
}

/**
 * Aggregated statistics for an employee
 */
export interface EmployeeStats {
  total_hours: number;
  total_paid: number;
  remaining_student_hours?: number; // For student status (475h limit)
}
