import { seedPortfolio } from '../data/seedContent';
import { isLocalApiConfigured, localApiRequest } from './localApi';
import type {
  AboutContent,
  ContactMessage,
  HeroContent,
  PortfolioData,
  ProjectItem,
  ServiceItem,
  SiteSettings,
  SkillItem,
  Statistic,
  TestimonialItem,
  ProcessStep,
  PageSection,
  MediaItem,
  NavigationItem,
  PublishingHistoryItem,
} from '../types/database';

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

export async function getPreviewPortfolioContent(): Promise<PortfolioData> {
  if (isLocalApiConfigured) {
    try {
      return await localApiRequest<PortfolioData>('/api/portfolio?preview=true');
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
        publishedSections: number;
        totalSkills: number;
        totalProcessSteps: number;
        totalMedia: number;
        draftChanges: number;
        lastPublishedAt: string | null;
        recentActivities: PublishingHistoryItem[];
      }>('/api/dashboard');
    } catch {
      return {
        totalProjects: 0,
        totalServices: 0,
        totalTestimonials: 0,
        totalMessages: 0,
        unreadMessages: 0,
        publishedProjects: 0,
        hiddenSections: 0,
        publishedSections: 0,
        totalSkills: 0,
        totalProcessSteps: 0,
        totalMedia: 0,
        draftChanges: 0,
        lastPublishedAt: null,
        recentActivities: [],
      };
    }
  }

  return {
    totalProjects: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalMessages: 0,
    unreadMessages: 0,
    publishedProjects: 0,
    hiddenSections: 0,
    publishedSections: 0,
    totalSkills: 0,
    totalProcessSteps: 0,
    totalMedia: 0,
    draftChanges: 0,
    lastPublishedAt: null,
    recentActivities: [],
  };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return localApiRequest<ContactMessage[]>('/api/contact-messages');
}

export async function submitContactMessage(message: {
  sender_name: string;
  sender_email: string;
  subject?: string;
  message: string;
}) {
  return localApiRequest<ContactMessage>('/api/contact-messages', {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

export async function updateContactMessageStatus(id: string, status: 'new' | 'read' | 'replied') {
  return localApiRequest(`/api/contact-messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteContactMessage(id: string) {
  return localApiRequest(`/api/contact-messages/${id}`, { method: 'DELETE' });
}

export function adminList<T>(resource: string): Promise<T[]> {
  return localApiRequest<T[]>(`/api/admin/${resource}`);
}

export function adminCreate<T>(resource: string, payload: Record<string, unknown>): Promise<T> {
  return localApiRequest<T>(`/api/admin/${resource}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminUpdate<T>(resource: string, id: string, payload: Record<string, unknown>): Promise<T> {
  return localApiRequest<T>(`/api/admin/${resource}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function adminDelete(resource: string, id: string) {
  return localApiRequest(`/api/admin/${resource}/${id}`, { method: 'DELETE' });
}

export function adminPublish(resource: string, id?: string) {
  const path = id ? `/api/admin/${resource}/${id}/publish` : `/api/admin/${resource}/publish-all`;
  return localApiRequest(path, { method: 'POST' });
}

export function adminUnpublish(resource: string, id: string) {
  return localApiRequest(`/api/admin/${resource}/${id}/unpublish`, { method: 'POST' });
}

export function adminReorder(resource: string, ids: string[]) {
  return localApiRequest(`/api/admin/${resource}/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });
}

export async function getAdminSingleton(resource: string) {
  return localApiRequest<{ published: any; draft: any; items: any[] }>(`/api/admin/${resource}`);
}

export async function saveAdminSingleton(resource: string, payload: Record<string, unknown>, isPublished: boolean) {
  return localApiRequest(`/api/admin/${resource}`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, is_published: isPublished }),
  });
}

export async function publishAdminSingleton(resource: string, payload?: Record<string, unknown>) {
  return localApiRequest(`/api/admin/${resource}/publish`, {
    method: 'POST',
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

export async function getMedia() {
  return localApiRequest<MediaItem[]>('/api/media');
}

export async function uploadMedia(payload: {
  fileName: string;
  contentType: string;
  dataUrl: string;
  altText?: string;
  folder?: string;
}) {
  return localApiRequest<MediaItem>('/api/media/upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMediaAlt(id: string, altText: string) {
  return localApiRequest(`/api/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ alt_text: altText }),
  });
}

export async function deleteMedia(id: string) {
  return localApiRequest(`/api/media/${id}`, { method: 'DELETE' });
}

export async function checkMediaReferences(id: string): Promise<{ inUse: boolean; references: string[] }> {
  return localApiRequest<{ inUse: boolean; references: string[] }>(`/api/media/${id}/references`);
}

export async function publishAllDrafts() {
  return localApiRequest<{ published: boolean; message: string }>('/api/admin/publish-all-drafts', {
    method: 'POST',
  });
}

export async function getPublishingHistory(): Promise<PublishingHistoryItem[]> {
  return localApiRequest<PublishingHistoryItem[]>('/api/admin/history');
}

export async function recordPublishHistory(data: {
  action: 'publish' | 'draft_save' | 'restore';
  section_name: string;
  summary?: string;
}) {
  return localApiRequest<PublishingHistoryItem>('/api/admin/history', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
