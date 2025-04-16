// src/utils/helpers.ts
import type { DestinationType, BudgetCategory } from '../../types/bai2/index';

/**
 * Format price to Vietnamese currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

/**
 * Get color for destination type
 */
export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    beach: '#1890ff',
    mountain: '#52c41a',
    city: '#722ed1',
    countryside: '#faad14',
    cultural: '#eb2f96'
  };

  return colorMap[type] || '#1890ff';
};

/**
 * Get display name for destination type
 */
export const getTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    beach: 'Biển',
    mountain: 'Núi',
    city: 'Thành phố',
    countryside: 'Nông thôn',
    cultural: 'Văn hóa'
  };

  return nameMap[type] || type;
};

/**
 * Calculate distance between two destinations (mock)
 */
export const calculateDistance = (from: DestinationType, to: DestinationType): number => {
  // This is a mock function - in a real app you would use coordinates and a proper distance algorithm
  // For now, we'll just return a random number between 5 and 100
  return Math.floor(Math.random() * 95) + 5;
};

/**
 * Calculate travel time between two destinations (mock)
 */
export const calculateTravelTime = (from: DestinationType, to: DestinationType): string => {
  // This is a mock function - in a real app you would calculate this based on distance and mode of transport
  const distance = calculateDistance(from, to);
  const hours = Math.floor(distance / 60);
  const minutes = Math.round((distance / 60 - hours) * 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} phút`;
};

/**
 * Get name for budget category
 */
export const getCategoryName = (category: BudgetCategory): string => {
  const categoryMap: Record<BudgetCategory, string> = {
    accommodation: 'Lưu trú',
    food: 'Ăn uống',
    transportation: 'Di chuyển',
    activities: 'Hoạt động',
    shopping: 'Mua sắm',
    other: 'Khác'
  };

  return categoryMap[category] || category;
};

/**
 * Get color for budget category
 */
export const getCategoryColor = (category: BudgetCategory): string => {
  const colorMap: Record<BudgetCategory, string> = {
    accommodation: '#1890ff',
    food: '#52c41a',
    transportation: '#722ed1',
    activities: '#faad14',
    shopping: '#eb2f96',
    other: '#8c8c8c'
  };

  return colorMap[category] || '#1890ff';
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

/**
 * Calculate total days between two dates
 */
export const calculateDays = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end days
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Truncate text to a specific length
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate average rating from an array of ratings
 */
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
};

/**
 * Group expenses by date
 */
export const groupExpensesByDate = (expenses: any[]): Record<string, any[]> => {
  return expenses.reduce((acc, expense) => {
    const dateStr = formatDate(new Date(expense.date));
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(expense);
    return acc;
  }, {} as Record<string, any[]>);
};
