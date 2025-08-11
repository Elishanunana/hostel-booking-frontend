// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'provider' | 'administrator';
}

export interface AuthResponse {
  message: string;
  user: User;
  refresh: string;
  access: string;
}

// Student Registration
export interface StudentRegistration {
  username: string;
  email: string;
  password: string;
  role: 'student';
  phone_number: string;
  date_of_birth: string;
  program: string;
}

// Provider Registration
export interface ProviderRegistration {
  username: string;
  password: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  bank_details: string;
}

// Login
export interface LoginData {
  email?: string;
  username?: string;
  password: string;
}