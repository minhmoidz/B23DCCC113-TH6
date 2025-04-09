// utils/helpers.ts

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get current date and time as a formatted string
export const getCurrentDateTimeString = (): string => {
  const now = new Date();
  return now.toLocaleString('vi-VN');
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Export members to Excel file
import * as XLSX from 'xlsx';

export const exportToExcel = (members: any[], fileName: string): void => {
  const ws = XLSX.utils.json_to_sheet(members);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Members');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
