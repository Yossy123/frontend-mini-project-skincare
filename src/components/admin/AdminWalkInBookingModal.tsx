'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CalendarDays, Clock, LoaderCircle, Search, UserPlus, Users, X } from 'lucide-react';
import {
  createAdminAppointment,
  fetchAdminPatients,
  fetchAvailableSlots,
  fetchBookingDoctors,
  fetchBookingServices,
  type BookingDoctor,
  type BookingService,
  type ConsultationMode,
  type Patient,
  type TimeSlot,
} from '@/lib/booking';

type PatientMode = 'new' | 'existing';

const fieldClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500';

const todayIso = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

interface AdminWalkInBookingModalProps {
  onClose: () => void;
  /** Called with the server's confirmation message after the appointment is created. */
  onCreated: (message: string) => void;
}

/** Lets clinic staff book an appointment for a walk-in or phone patient. */
export function AdminWalkInBookingModal({ onClose, onCreated }: AdminWalkInBookingModalProps) {
  const [services, setServices] = useState<BookingService[]>([]);
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [patientMode, setPatientMode] = useState<PatientMode>('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState<ConsultationMode>('offline');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slotRequest = useRef(0);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchBookingServices(), fetchBookingDoctors()])
      .then(([serviceList, doctorList]) => {
        if (!isMounted) return;
        setServices(serviceList);
        setDoctors(doctorList);
      })
      .catch((err: unknown) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Gagal memuat layanan dan dokter.');
      })
      .finally(() => {
        if (isMounted) setLoadingOptions(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /** Reload the free slots whenever doctor, date or service changes; stale answers are ignored. */
  const reloadSlots = async (nextDoctor: string, nextDate: string, nextService: string) => {
    const requestId = ++slotRequest.current;
    setStartTime('');
    setSlots([]);
    setSlotsMessage(null);

    if (!nextDoctor || !nextDate || !nextService) return;

    setLoadingSlots(true);
    try {
      const result = await fetchAvailableSlots({
        doctor_id: Number(nextDoctor),
        date: nextDate,
        service_id: Number(nextService),
      });
      if (requestId !== slotRequest.current) return;

      setSlots(result.slots);
      if (!result.is_doctor_available) {
        setSlotsMessage('Dokter tidak berpraktik pada tanggal ini.');
      } else if (!result.slots.some((slot) => !slot.is_booked)) {
        setSlotsMessage('Semua jam pada tanggal ini sudah terisi. Pilih tanggal atau dokter lain.');
      }
    } catch (err: unknown) {
      if (requestId !== slotRequest.current) return;
      setSlotsMessage(err instanceof Error ? err.message : 'Gagal memuat jadwal.');
    } finally {
      if (requestId === slotRequest.current) setLoadingSlots(false);
    }
  };

  const searchPatients = async () => {
    const term = patientSearch.trim();
    if (!term || searchingPatients) return;

    setSearchingPatients(true);
    setError(null);
    try {
      const result = await fetchAdminPatients({ search: term });
      setPatientResults(result.data.slice(0, 6));
      setSearchedOnce(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mencari pasien.');
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (patientMode === 'existing' && !selectedPatient) {
      setError('Pilih pasien dari hasil pencarian, atau beralih ke pasien baru.');
      return;
    }
    if (patientMode === 'new' && (!name.trim() || !phone.trim())) {
      setError('Nama dan nomor HP pasien baru wajib diisi.');
      return;
    }
    if (!serviceId || !doctorId || !date || !startTime) {
      setError('Lengkapi layanan, dokter, tanggal, dan pilih jam yang tersedia.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { message } = await createAdminAppointment({
        service_id: Number(serviceId),
        doctor_id: Number(doctorId),
        consultation_mode: mode,
        date,
        start_time: startTime,
        notes: notes.trim() || undefined,
        ...(patientMode === 'existing' && selectedPatient
          ? { patient_id: selectedPatient.id }
          : { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined }),
      });
      onCreated(message);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat reservasi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl"
        aria-label="Reservasi baru"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-serif text-lg text-white">Reservasi Baru</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Untuk pasien yang datang langsung atau memesan lewat telepon.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient */}
        <fieldset className="space-y-3 text-xs">
          <legend className="text-zinc-300 font-semibold mb-2">Pasien</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['new', 'Pasien baru', UserPlus],
                ['existing', 'Pasien lama', Users],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPatientMode(value);
                  setError(null);
                }}
                aria-pressed={patientMode === value}
                className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                  patientMode === value
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {patientMode === 'new' ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="walkInName" className="text-zinc-400 block mb-1.5 font-semibold">Nama pasien *</label>
                <input id="walkInName" type="text" maxLength={255} value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="walkInPhone" className="text-zinc-400 block mb-1.5 font-semibold">No. HP *</label>
                  <input id="walkInPhone" type="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="walkInEmail" className="text-zinc-400 block mb-1.5 font-semibold">Email (opsional)</label>
                  <input id="walkInEmail" type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="search"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchPatients();
                    }
                  }}
                  placeholder="Cari nama atau nomor HP..."
                  aria-label="Cari pasien"
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={searchPatients}
                  disabled={searchingPatients || !patientSearch.trim()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {searchingPatients ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Cari
                </button>
              </div>

              {selectedPatient && (
                <p className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                  Dipilih: <strong>{selectedPatient.name}</strong> · {selectedPatient.phone}
                </p>
              )}

              {patientResults.length > 0 ? (
                <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
                  {patientResults.map((patient) => (
                    <li key={patient.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedPatient(patient)}
                        aria-pressed={selectedPatient?.id === patient.id}
                        className={`w-full text-left px-3.5 py-2.5 cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id ? 'bg-rose-500/10' : 'hover:bg-zinc-800/70'
                        }`}
                      >
                        <span className="block text-zinc-100 font-medium">{patient.name}</span>
                        <span className="block text-zinc-500 text-[11px]">{patient.phone}{patient.email ? ` · ${patient.email}` : ''}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                searchedOnce && <p className="text-zinc-500">Tidak ada pasien yang cocok. Beralih ke &quot;Pasien baru&quot; untuk mendaftarkannya.</p>
              )}
            </div>
          )}
        </fieldset>

        {/* Schedule */}
        <fieldset className="space-y-3 text-xs">
          <legend className="text-zinc-300 font-semibold mb-2">Jadwal</legend>
          {loadingOptions ? (
            <p className="text-zinc-500 flex items-center gap-2"><LoaderCircle className="w-3.5 h-3.5 animate-spin" />Memuat layanan dan dokter...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="walkInService" className="text-zinc-400 block mb-1.5 font-semibold">Layanan *</label>
                  <select
                    id="walkInService"
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(e.target.value);
                      reloadSlots(doctorId, date, e.target.value);
                    }}
                    className={fieldClass}
                  >
                    <option value="">Pilih layanan</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.name} ({service.duration_minutes} mnt)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="walkInDoctor" className="text-zinc-400 block mb-1.5 font-semibold">Dokter *</label>
                  <select
                    id="walkInDoctor"
                    value={doctorId}
                    onChange={(e) => {
                      setDoctorId(e.target.value);
                      reloadSlots(e.target.value, date, serviceId);
                    }}
                    className={fieldClass}
                  >
                    <option value="">Pilih dokter</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="walkInDate" className="text-zinc-400 block mb-1.5 font-semibold">Tanggal *</label>
                  <input
                    id="walkInDate"
                    type="date"
                    min={todayIso()}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      reloadSlots(doctorId, e.target.value, serviceId);
                    }}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="walkInMode" className="text-zinc-400 block mb-1.5 font-semibold">Jenis konsultasi</label>
                  <select id="walkInMode" value={mode} onChange={(e) => setMode(e.target.value as ConsultationMode)} className={fieldClass}>
                    <option value="offline">Tatap muka di klinik</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1.5 font-semibold">Jam *</span>
                {loadingSlots ? (
                  <p className="text-zinc-500 flex items-center gap-2"><LoaderCircle className="w-3.5 h-3.5 animate-spin" />Memuat jam tersedia...</p>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Jam tersedia">
                    {slots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={slot.is_booked}
                        onClick={() => setStartTime(slot.start)}
                        aria-pressed={startTime === slot.start}
                        className={`inline-flex items-center justify-center gap-1 py-2 rounded-xl border font-semibold transition-all ${
                          startTime === slot.start
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : slot.is_booked
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 line-through cursor-not-allowed'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-rose-500/50 cursor-pointer'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {slot.start}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {slotsMessage ?? 'Pilih layanan, dokter, dan tanggal untuk melihat jam tersedia.'}
                  </p>
                )}
                {slots.length > 0 && slotsMessage && <p className="mt-2 text-amber-400">{slotsMessage}</p>}
              </div>
            </>
          )}
        </fieldset>

        <div className="text-xs">
          <label htmlFor="walkInNotes" className="text-zinc-400 block mb-1.5 font-semibold">Catatan / keluhan (opsional)</label>
          <textarea id="walkInNotes" rows={2} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer">
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
          >
            {submitting && <LoaderCircle className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? 'Menyimpan...' : 'Buat Reservasi'}
          </button>
        </div>
      </form>
    </div>
  );
}
