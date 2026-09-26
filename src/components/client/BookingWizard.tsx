'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Barber, ServiceItem, Appointment, BookingRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayString } from '@/lib/date-utils';
import { bookingApi } from '@/services/booking-api';
import { getErrorMessage } from '@/lib/errors';
import { StepServiceSelection } from './booking/StepServiceSelection';
import { StepBarberSelection } from './booking/StepBarberSelection';
import { StepDateTimeSelection } from './booking/StepDateTimeSelection';
import { StepConfirmation } from './booking/StepConfirmation';
import { BookingSuccessCard } from './booking/BookingSuccessCard';

interface BookingWizardProps {
  onBookingSuccess: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ onBookingSuccess }) => {
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);

  const [clientName, setClientName] = useState<string>(user?.nome || '');
  const [clientPhone, setClientPhone] = useState<string>(user?.telefone || '(11) 98765-4321');
  const [clientEmail, setClientEmail] = useState<string>(user?.email || 'cliente@barbearia.com');

  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<Appointment | null>(null);

  // Carrega catálogo inicial de serviços e profissionais
  useEffect(() => {
    let isMounted = true;
    Promise.all([bookingApi.getServices(), bookingApi.getBarbers()])
      .then(([svcList, barberData]) => {
        if (isMounted) {
          setServices(svcList);
          setBarbers(barberData.barbers);
        }
      })
      .catch((err) => {
        console.error('Falha ao carregar dados:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshSlots = useCallback(async (barberId: string, date: string) => {
    setIsLoadingSlots(true);
    try {
      const data = await bookingApi.getBarbers({ barberId, date });
      setAvailableSlots(data.allSlots || []);
      setOccupiedSlots(data.occupiedSlots || []);
    } catch (e: unknown) {
      console.error('Erro ao carregar horários:', e);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;
    let isMounted = true;
    bookingApi
      .getBarbers({ barberId: selectedBarber.id, date: selectedDate })
      .then((data) => {
        if (!isMounted) return;
        setAvailableSlots(data.allSlots || []);
        setOccupiedSlots(data.occupiedSlots || []);
        setIsLoadingSlots(false);
      })
      .catch((e: unknown) => {
        console.error('Erro ao carregar horários:', e);
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBarber, selectedDate]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor, complete todos os passos antes de confirmar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: BookingRequest = {
      clienteId: user?.uid || `cli-${Date.now()}`,
      clienteNome: clientName,
      clienteTelefone: clientPhone,
      clienteEmail: clientEmail,
      barbeiroId: selectedBarber.id,
      servicoId: selectedService.id,
      data: selectedDate,
      horario: selectedTime,
    };

    try {
      const res = await bookingApi.createAppointment(payload);
      setSuccessData(res.appointment);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      const isConflict = msg.includes('CONFLITO') || msg.includes('409');
      if (isConflict) {
        setErrorMessage(
          `⚠️ Conflito de concorrência: O horário das ${selectedTime} foi reservado por outro cliente. Por favor selecione outro slot!`
        );
        refreshSlots(selectedBarber.id, selectedDate);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedTime('');
    setStep(1);
    setSuccessData(null);
    setErrorMessage(null);
  };

  if (successData) {
    return (
      <BookingSuccessCard
        appointment={successData}
        onReset={resetBooking}
        onViewAppointments={() => {
          resetBooking();
          onBookingSuccess();
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {step === 1 && (
        <StepServiceSelection
          services={services}
          selectedService={selectedService}
          onSelectService={setSelectedService}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepBarberSelection
          barbers={barbers}
          selectedBarber={selectedBarber}
          selectedService={selectedService}
          onSelectBarber={setSelectedBarber}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && selectedBarber && selectedService && (
        <StepDateTimeSelection
          selectedBarber={selectedBarber}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          availableSlots={availableSlots}
          occupiedSlots={occupiedSlots}
          isLoadingSlots={isLoadingSlots}
          onSelectDate={setSelectedDate}
          onSelectTime={setSelectedTime}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && selectedService && selectedBarber && (
        <StepConfirmation
          selectedService={selectedService}
          selectedBarber={selectedBarber}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          clientName={clientName}
          clientPhone={clientPhone}
          clientEmail={clientEmail}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onNameChange={setClientName}
          onPhoneChange={setClientPhone}
          onEmailChange={setClientEmail}
          onBack={() => setStep(3)}
          onSubmit={handleConfirmBooking}
        />
      )}
    </div>
  );
};