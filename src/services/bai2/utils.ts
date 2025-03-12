// utils.ts
import moment from 'moment';
import { Employee, Service, Appointment } from '../../interfaces/types';

// Tạo khung giờ hẹn dựa vào giờ làm việc của nhân viên
export function getAvailableTimeSlots(
  employee: Employee,
  service: Service,
  date: string,
  appointments: Appointment[]
): string[] {
  // Lấy thứ trong tuần từ ngày đã chọn
  const dayOfWeek = getEnglishDayOfWeek(date);

  // Tìm giờ làm việc của nhân viên vào ngày này
  const workingHours = employee.workingHours.find(hours => hours.day === dayOfWeek);

  // Nếu nhân viên không làm việc vào ngày này hoặc dữ liệu không hợp lệ, trả về mảng rỗng
  if (!workingHours || !workingHours.isWorking ||
      !workingHours.startTime || !workingHours.endTime ||
      workingHours.startTime === 'Invalid Date' ||
      workingHours.endTime === 'Invalid Date') {
    return [];
  }

  // Tạo các khoảng thời gian theo giờ làm việc của nhân viên
  const slots: string[] = [];
  const startTime = moment(workingHours.startTime, 'HH:mm');
  const endTime = moment(workingHours.endTime, 'HH:mm');

  // Tạo khoảng thời gian 30 phút (có thể thay đổi nếu cần)
  const interval = 30; // phút
  let current = startTime.clone();

  // Tạo các slot thời gian trong khoảng làm việc của nhân viên
  while (current.isBefore(endTime)) {
    const timeSlot = current.format('HH:mm');

    // Tính thời điểm kết thúc lịch hẹn nếu bắt đầu ở slot này
    const appointmentEndTime = calculateEndTime(timeSlot, service.durationMinutes);

    // Kiểm tra xem lịch hẹn có kết thúc trước khi nhân viên ngừng làm việc không
    const appointmentEndMoment = moment(appointmentEndTime, 'HH:mm');
    if (appointmentEndMoment.isAfter(endTime)) {
      break; // Bỏ qua các slot sẽ kéo dài quá giờ làm việc
    }

    // Kiểm tra xem slot này có trùng với các lịch hẹn đã có không
    const hasConflict = hasAppointmentConflict(
      appointments,
      employee.id,
      date,
      timeSlot,
      appointmentEndTime
    );

    // Nếu không có xung đột, thêm slot vào danh sách
    if (!hasConflict) {
      slots.push(timeSlot);
    }

    // Chuyển đến slot tiếp theo
    current.add(interval, 'minutes');
  }

  return slots;
}

// Chuyển đổi ngày thành thứ trong tuần bằng tiếng Anh
export function getEnglishDayOfWeek(dateString: string) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Kiểm tra xem nhân viên có làm việc vào thời gian đã chọn không
export function isEmployeeAvailable(
  employee: Employee,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  const dayOfWeek = getEnglishDayOfWeek(date);
  const workingHours = employee.workingHours.find(hours => hours.day === dayOfWeek);

  if (!workingHours || !workingHours.isWorking) {
    return false;
  }

  const workStart = moment(workingHours.startTime, 'HH:mm');
  const workEnd = moment(workingHours.endTime, 'HH:mm');
  const appointmentStart = moment(startTime, 'HH:mm');
  const appointmentEnd = moment(endTime, 'HH:mm');

  // Kiểm tra xem lịch hẹn có nằm trong giờ làm việc không
  return appointmentStart.isSameOrAfter(workStart) &&
         appointmentEnd.isSameOrBefore(workEnd);
}

// Tính thời gian kết thúc dựa vào thời gian bắt đầu và thời lượng dịch vụ
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const start = moment(startTime, 'HH:mm');
  const end = start.clone().add(durationMinutes, 'minutes');
  return end.format('HH:mm');
}

// Kiểm tra xem có xung đột với các lịch hẹn khác không
export function hasAppointmentConflict(
  appointments: Appointment[],
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): boolean {
  // Lọc các lịch hẹn của nhân viên vào ngày cụ thể (trừ lịch hẹn đang chỉnh sửa)
  const employeeAppointments = appointments.filter(app =>
    app.employeeId === employeeId &&
    app.date === date &&
    (!excludeAppointmentId || app.id !== excludeAppointmentId)
  );

  // Chuyển đổi thời gian bắt đầu và kết thúc sang moment để dễ so sánh
  const newStart = moment(startTime, 'HH:mm');
  const newEnd = moment(endTime, 'HH:mm');

  // Kiểm tra xung đột với từng lịch hẹn hiện có
  return employeeAppointments.some(app => {
    const existingStart = moment(app.startTime, 'HH:mm');
    const existingEnd = moment(app.endTime, 'HH:mm');

    // Xung đột xảy ra khi có bất kỳ sự chồng chéo nào về thời gian
    return (
      (newStart.isSameOrAfter(existingStart) && newStart.isBefore(existingEnd)) ||
      (newEnd.isAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) ||
      (newStart.isSameOrBefore(existingStart) && newEnd.isSameOrAfter(existingEnd))
    );
  });
}

// Đếm số lượng lịch hẹn trong ngày của nhân viên
export function countAppointmentsPerDay(
  appointments: Appointment[],
  employeeId: string,
  date: string
): number {
  return appointments.filter(app =>
    app.employeeId === employeeId &&
    app.date === date
  ).length;
}
