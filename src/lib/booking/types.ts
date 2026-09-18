
export type ConsultationMode = 'offline' | 'online';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BookingService = {
  id: number;
  code: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: string | number;
  category?: string;
  is_active: boolean;
};

export type BookingDoctor = {
  id: number;
  user_id?: number;
  name: string;
  title: string;
  specialization: string;
  license_number?: string;
  phone?: string;
  experience: string;
  rating: string | number;
  review_count: number;
  avatar_color: string;
  bio: string;
  skills: string[];
  schedule_days: string;
  available_days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  work_start_time: string;
  work_end_time: string;
  status: 'active' | 'inactive';
};

export type Patient = {
  id: number;
  user_id?: number | null;
  name: string;
  phone: string;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  skin_type?: string | null;
  notes?: string | null;
  allergies?: string | null;
  medical_history?: string | null;
  emergency_contact?: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  appointments_count?: number;
  appointments?: Appointment[];
};

export type AppointmentStatusHistory = {
  id: number;
  appointment_id: number;
  from_status?: string | null;
  to_status: AppointmentStatus;
  changed_by?: number | null;
  notes?: string | null;
  created_at: string;
  changer?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export type Appointment = {
  id: number;
  booking_code: string;
  patient_id: number;
  doctor_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time?: string;
  start_time: string;
  end_time: string;
  consultation_mode: ConsultationMode;
  consultation_type?: ConsultationMode;
  meeting_link?: string | null;
  complaint?: string | null;
  patient_notes?: string | null;
  photo_url?: string | null;
  doctor_notes?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  prescription?: string | null;
  status: AppointmentStatus;
  cancellation_reason?: string | null;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: BookingDoctor;
  service?: BookingService;
  status_histories?: AppointmentStatusHistory[];
};

export type CustomerMedicalAppointment = {
  id: number;
  booking_code: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  consultation_mode: ConsultationMode;
  status: AppointmentStatus;
  complaint?: string | null;
  doctor_notes?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  prescription?: string | null;
  cancellation_reason?: string | null;
  patient_notes?: string | null;
  status_histories?: Array<{
    id: number;
    from_status?: string | null;
    to_status: AppointmentStatus;
    created_at: string;
  }>;
  doctor?: { id: number; name: string; title?: string | null; specialization?: string | null } | null;
  service?: { id: number; name: string; duration_minutes?: number } | null;
};

export type PatientHealthProfile = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  allergies?: string | null;
  medical_history?: string | null;
  emergency_contact?: string | null;
};

export type TimeSlot = {
  start: string;
  end: string;
  is_booked?: boolean;
};

export type AvailableSlotsResponse = {
  doctor: BookingDoctor;
  date: string;
  is_doctor_available: boolean;
  slots: TimeSlot[];
};

export type CreateBookingPayload = {
  service_id: number;
  doctor_id: number;
  consultation_mode: ConsultationMode;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  photo_url?: string;
};

