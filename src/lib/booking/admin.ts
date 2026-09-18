import { API_BASE_URL } from '@/lib/api/client';
import type { Appointment, AppointmentStatus, BookingDoctor, Patient } from './types';
import { getAuthHeader } from './auth';
export async function fetchAdminAppointments(params?: {
  date?: string;
  doctor_id?: string | number;
  service_id?: string | number;
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ data: Appointment[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.doctor_id) query.set('doctor_id', params.doctor_id.toString());
  if (params?.service_id) query.set('service_id', params.service_id.toString());
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/admin/appointments?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat daftar appointment.');
  return json.data;
}

export async function updateAdminAppointmentStatus(
  id: number,
  status: AppointmentStatus,
  notes?: string,
  cancellation_reason?: string
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/admin/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, notes, cancellation_reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui status appointment.');
  return json.data;
}

export async function updateAdminAppointment(id: number, payload: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui appointment.');
  return json.data;
}

// 4. ADMIN PATIENTS
export async function fetchAdminPatients(params?: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<{ data: Patient[]; total: number; current_page: number; last_page: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', params.page.toString());

  const res = await fetch(`${API_BASE_URL}/admin/patients?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat data pasien.');
  return json.data;
}

export async function fetchAdminPatientDetail(id: number): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat detail pasien.');
  return json.data;
}

export async function updateAdminPatient(id: number, payload: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui data pasien.');
  return json.data;
}

// 5. ADMIN DOCTORS
export async function fetchAdminDoctors(): Promise<BookingDoctor[]> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat data dokter.');
  return json.data;
}

export async function createAdminDoctor(payload: Record<string, unknown>): Promise<BookingDoctor> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menambahkan dokter.');
  return json.data;
}

export async function updateAdminDoctor(id: number, payload: Partial<BookingDoctor>): Promise<BookingDoctor> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui dokter.');
  return json.data;
}

export async function toggleAdminDoctor(id: number): Promise<BookingDoctor> {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengubah status dokter.');
  return json.data;
}

