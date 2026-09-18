import { API_BASE_URL } from '@/lib/api/client';
import type { Appointment, AppointmentStatus, BookingDoctor, Patient } from './types';
import { getAuthHeader } from './auth';
export type DoctorOverviewData = {
  doctor: BookingDoctor;
  today_date?: string;
  metrics: {
    today_appointments: number;
    waiting_patients: number;
    in_progress: number;
    completed_today: number;
    upcoming_appointments?: number;
    total_patients: number;
    [key: string]: number | string | undefined;
  };
  today_queue: Appointment[];
  upcoming_queue?: Appointment[];
  recent_patients: Appointment[];
  today_appointments?: Appointment[];
  upcoming_appointments?: Appointment[];
};

export type DoctorOverviewResponse = DoctorOverviewData;

export async function fetchDoctorOverview(): Promise<DoctorOverviewData> {
  const res = await fetch(`${API_BASE_URL}/doctor/dashboard/overview`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat overview dokter.');
  return json.data;
}

export async function fetchDoctorAppointments(params?: {
  date?: string;
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ data: Appointment[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/doctor/appointments?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat jadwal appointment.');
  return json.data;
}

export async function fetchDoctorAppointmentDetail(id: number): Promise<{
  appointment: Appointment;
  patient_history: Appointment[];
}> {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat detail appointment pasien.');
  return json.data;
}

export async function updateDoctorAppointmentStatus(
  id: number,
  status: AppointmentStatus | string,
  notes?: string
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, notes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengubah status konsultasi.');
  return json.data;
}

export async function saveDoctorNotes(
  id: number,
  payload: {
    diagnosis?: string;
    doctor_notes?: string;
    treatment_plan?: string;
    prescription?: string;
    mark_completed?: boolean;
  }
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menyimpan catatan medis.');
  return json.data;
}

export async function updatePatientMedicalRecordByDoctor(
  patientId: number,
  payload: {
    allergies?: string;
    medical_history?: string;
    skin_type?: string;
    notes?: string;
  }
): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}/medical-record`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui rekam medis pasien.');
  return json.data;
}

export async function fetchDoctorPatients(params?: {
  search?: string;
  page?: number;
}): Promise<{ data: Patient[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/doctor/patients?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat daftar pasien dokter.');
  return json.data;
}

// Aliases for convenience
export const getDoctorOverview = fetchDoctorOverview;
export const getDoctorAppointments = fetchDoctorAppointments;
export const getDoctorAppointmentDetail = fetchDoctorAppointmentDetail;
export const getDoctorPatients = fetchDoctorPatients;
export const updatePatientMedicalRecord = updatePatientMedicalRecordByDoctor;
