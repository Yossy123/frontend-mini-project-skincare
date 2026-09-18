import { API_BASE_URL } from '@/lib/api/client';
import type { CustomerMedicalAppointment, PatientHealthProfile } from './types';
export async function fetchMyAppointments(token: string): Promise<CustomerMedicalAppointment[]> {
  const appointments: CustomerMedicalAppointment[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetch(`${API_BASE_URL}/my-appointments?page=${page}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal memuat jadwal konsultasi.');

    // Laravel may wrap a paginated resource collection in a nested `data` key.
    const collection = json.data?.data ?? json.data;
    if (!Array.isArray(collection)) throw new Error('Format data rekam medis tidak dikenali.');
    appointments.push(...collection);
    const reportedLastPage = json.data?.meta?.last_page ?? json.meta?.last_page;
    // The current controller nests a resource collection in a JSON response,
    // which may omit Laravel's paginator metadata. Continue until a short page.
    lastPage = Number(reportedLastPage ?? (collection.length === 15 ? page + 1 : page));
    page += 1;
  } while (page <= lastPage);

  return appointments;
}

export const fetchMyMedicalAppointments = fetchMyAppointments;

export async function fetchMyHealthProfile(token: string): Promise<PatientHealthProfile | null> {
  const res = await fetch(`${API_BASE_URL}/my-profile/health`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat profil kesehatan.');
  const profile = json.data?.patient ?? json.data;
  if (profile == null) return null;
  if (typeof profile !== 'object' || !profile.id) throw new Error('Format profil kesehatan tidak dikenali.');
  return profile as PatientHealthProfile;
}

export async function fetchMyAppointmentDetail(id: number | string, token: string): Promise<CustomerMedicalAppointment> {
  const res = await fetch(`${API_BASE_URL}/my-appointments/${id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memuat detail reservasi.');
  const appointment = json.data?.data ?? json.data;
  if (!appointment?.id) throw new Error('Detail reservasi tidak ditemukan.');
  return appointment as CustomerMedicalAppointment;
}

export async function cancelMyAppointment(
  id: number | string,
  token: string,
  reason = 'Dibatalkan melalui akun pasien'
): Promise<CustomerMedicalAppointment> {
  const res = await fetch(`${API_BASE_URL}/my-appointments/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Reservasi tidak dapat dibatalkan.');
  const appointment = json.data?.data ?? json.data;
  if (!appointment?.id) throw new Error('Respons pembatalan reservasi tidak dikenali.');
  return appointment as CustomerMedicalAppointment;
}
