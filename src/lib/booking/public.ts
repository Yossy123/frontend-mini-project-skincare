import { API_BASE_URL } from '@/lib/api/client';
import type {
  Appointment,
  AvailableSlotsResponse,
  BookingDoctor,
  BookingService,
  CreateBookingPayload,
} from './types';
import { getAuthHeader } from './auth';
export function resolvePhotoUrl(url: string): string {
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
}

export async function fetchBookingServices(): Promise<BookingService[]> {
  const res = await fetch(`${API_BASE_URL}/booking/services`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat layanan perawatan');
  return data.data || [];
}

export async function fetchBookingDoctors(): Promise<BookingDoctor[]> {
  const res = await fetch(`${API_BASE_URL}/booking/doctors`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat daftar dokter');
  return data.data || [];
}

export async function fetchAvailableSlots(params: {
  doctor_id: number;
  date: string;
  service_id?: number;
}): Promise<AvailableSlotsResponse> {
  const query = new URLSearchParams({
    doctor_id: params.doctor_id.toString(),
    date: params.date,
  });
  if (params.service_id) {
    query.set('service_id', params.service_id.toString());
  }

  const res = await fetch(`${API_BASE_URL}/booking/available-slots?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memeriksa slot waktu');
  return data.data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.errors
      ? Object.values(data.errors).flat().join(', ')
      : data.message || 'Gagal membuat reservasi.';
    throw new Error(errorMsg);
  }

  return data.data;
}

export async function lookupBooking(bookingCode: string): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/booking/lookup?booking_code=${encodeURIComponent(bookingCode)}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Booking tidak ditemukan');
  return data.data;
}

