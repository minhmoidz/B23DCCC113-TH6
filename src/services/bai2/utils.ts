import { Appointment, Employee, Service } from '../../interfaces/types';
import { format, parse, isWithinInterval, addMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';

// Format date for display
export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
};

// Format time for display
export const formatTime = (timeString: string): string => {
  return timeString;
};

// Get day of week from date
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'EEEE', { locale: vi });
};

// Check if employee is available on a specific date and time
export const isEmployeeAvailable = (
  employee: Employee,
  date: string,
  startTime: string,
  endTime: string
): boolean => {
  const dayOfWeek = getDayOfWeek(date);

  // Check if employee works on this day
  const workingHours = employee.workingHours.find(wh => wh.day === dayOfWeek);
  if (!workingHours || !workingHours.isWorking) {
    return false;
  }

  // Check if time is within working hours
  const startWorkTime = parse(workingHours.startTime, 'HH:mm', new Date());
  const endWorkTime = parse(workingHours.endTime, 'HH:mm', new Date());
  const appointmentStart = parse(startTime, 'HH:mm', new Date());
  const appointmentEnd = parse(endTime, 'HH:mm', new Date());

  if (
    !isWithinInterval(appointmentStart, { start: startWorkTime, end: endWorkTime }) ||
    !isWithinInterval(appointmentEnd, { start: startWorkTime, end: endWorkTime })
  ) {
    return false;
  }

  return true;
};

// Check for appointment conflicts
export const hasAppointmentConflict = (
  appointments: Appointment[],
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): boolean => {
  const appointmentStart = parse(startTime, 'HH:mm', new Date());
  const appointmentEnd = parse(endTime, 'HH:mm', new Date());

  // Filter appointments for the same employee and date
  const employeeAppointments = appointments.filter(
    a => a.employeeId === employeeId &&
    a.date === date &&
    a.status !== 'cancelled' &&
    (excludeAppointmentId ? a.id !== excludeAppointmentId : true)
  );

  // Check for time conflicts
  return employeeAppointments.some(a => {
    const existingStart = parse(a.startTime, 'HH:mm', new Date());
    const existingEnd = parse(a.endTime, 'HH:mm', new Date());

    return (
      (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
      (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
      (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
    );
  });
};

// Calculate end time based on start time and service duration
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const startDate = parse(startTime, 'HH:mm', new Date());
  const endDate = addMinutes(startDate, durationMinutes);
  return format(endDate, 'HH:mm');
};

// Count appointments per day for an employee
export const countAppointmentsPerDay = (
  appointments: Appointment[],
  employeeId: string,
  date: string
): number => {
  return appointments.filter(
    a => a.employeeId === employeeId &&
    a.date === date &&
    (a.status === 'confirmed' || a.status === 'pending')
  ).length;
};

// Get available time slots for a specific date and employee
export const getAvailableTimeSlots = (
  employee: Employee,
  service: Service,
  date: string,
  appointments: Appointment[]
): string[] => {
  const dayOfWeek = getDayOfWeek(date);
  const workingHours = employee.workingHours.find(wh => wh.day === dayOfWeek);

  if (!workingHours || !workingHours.isWorking) {
    return [];
  }

  const slots: string[] = [];
  const startTime = parse(workingHours.startTime, 'HH:mm', new Date());
  const endTime = parse(workingHours.endTime, 'HH:mm', new Date());
  const { durationMinutes } = service;

  // Generate slots in 30-minute increments
  let currentSlot = startTime;
  while (addMinutes(currentSlot, durationMinutes) <= endTime) {
    const slotTime = format(currentSlot, 'HH:mm');
    const slotEndTime = calculateEndTime(slotTime, durationMinutes);

    // Check if slot is available
    if (!hasAppointmentConflict(appointments, employee.id, date, slotTime, slotEndTime)) {
      slots.push(slotTime);
    }

    // Move to next slot (30 min increment)
    currentSlot = addMinutes(currentSlot, 30);
  }

  return slots;
};

// Calculate total revenue for a period
export const calculateRevenue = (
  appointments: Appointment[],
  services: Service[],
  startDate?: string,
  endDate?: string,
  employeeId?: string,
  serviceId?: string
): number => {
  return appointments
    .filter(a => {
      const appointmentDate = new Date(a.date);
      const filterByDate = !startDate || !endDate ||
        (appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate));
      const filterByEmployee = !employeeId || a.employeeId === employeeId;
      const filterByService = !serviceId || a.serviceId === serviceId;
      return a.status === 'completed' && filterByDate && filterByEmployee && filterByService;
    })
    .reduce((total, appointment) => {
      const service = services.find(s => s.id === appointment.serviceId);
      return total + (service?.price || 0);
    }, 0);
};
