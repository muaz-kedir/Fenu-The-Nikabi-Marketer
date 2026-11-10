import { seedPortfolio } from '../data/seedContent';
import { isLocalApiConfigured, localApiRequest } from './localApi';
import type { PortfolioData, ContactMessage } from '../types/database';

const fallbackPortfolio: PortfolioData = seedPortfolio;

export async function getPortfolioContent(): Promise<PortfolioData> {
  if (isLocalApiConfigured) {
    try {
      return await localApiRequest<PortfolioData>('/api/portfolio');
    } catch {
      return fallbackPortfolio;
    }
  }

  return fallbackPortfolio;
}

export async function getDashboardOverview() {
  if (isLocalApiConfigured) {
    try {
      return await localApiRequest<{
        totalProjects: number;
        totalServices: number;
        totalTestimonials: number;
        totalMessages: number;
        unreadMessages: number;
        publishedProjects: number;
        hiddenSections: number;
      }>('/api/dashboard');
    } catch {
      return {
        totalProjects: 3,
        totalServices: 3,
        totalTestimonials: 1,
        totalMessages: 0,
        unreadMessages: 0,
        publishedProjects: 3,
        hiddenSections: 0,
      };
    }
  }

  return {
    totalProjects: 3,
    totalServices: 3,
    totalTestimonials: 1,
    totalMessages: 0,
    unreadMessages: 0,
    publishedProjects: 3,
    hiddenSections: 0,
  };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (isLocalApiConfigured) {
    try {
      return await localApiRequest<ContactMessage[]>('/api/contact-messages');
    } catch {
      return [];
    }
  }

  return [];
}
