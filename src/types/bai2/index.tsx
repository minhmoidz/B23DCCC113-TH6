// src/types/index.ts
import { Moment } from 'moment';

/**
 * Destination type
 */
export interface DestinationType {
  id: string;
  name: string;
  location: string;
  type: string; // beach, mountain, city, countryside, cultural
  price: number;
  rating: number;
  description: string;
  imageUrl: string;
}

/**
 * Itinerary day
 */
export interface ItineraryDay {
  date: Moment;
  destinations: DestinationType[];
}

/**
 * Budget category
 */
export type BudgetCategory = 'accommodation' | 'food' | 'transportation' | 'activities' | 'shopping' | 'other';

/**
 * Budget item
 */
export interface BudgetItem {
  id: string;
  name: string;
  category: BudgetCategory;
  amount: number;
  date: Date;
}

/**
 * Statistics data
 */
export interface StatisticsData {
  monthlyItineraries: { month: string; count: number }[];
  popularDestinations: { name: string; count: number }[];
}

/**
 * User type
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

/**
 * Itinerary type
 */
export interface Itinerary {
  id: string;
  name: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  days: ItineraryDay[];
  budget: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}


export interface DestinationType {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  description: string;
  imageUrl: string;
}

export type PriceRange = [number, number]; // Định nghĩa kiểu PriceRange là một mảng 2 phần tử số

