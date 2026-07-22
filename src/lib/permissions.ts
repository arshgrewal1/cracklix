import { UserProfile, UserPermissions } from "@/types";

/**
 * @fileOverview Institutional Authorization Engine v2.1.
 * UPDATED: Added hardcoded Founder Override to ensure the owner never loses access.
 */

export const SUPER_ADMIN_EMAILS = ['arshdeepgrewal1122@gmail.com'];

export const INITIAL_PERMISSIONS: UserPermissions = {
  createSubject: false,
  editSubject: false,
  deleteSubject: false,
  createMock: false,
  editMock: false,
  deleteMock: false,
  uploadQuestions: false,
  editQuestions: false,
  deleteQuestions: false,
  uploadPYQs: false,
  editPYQs: false,
  deletePYQs: false,
  uploadImages: false,
  publishContent: false,
  unpublishContent: false,
  reviewContent: false,
  manageCategories: false,
  manageSeries: false,
  managePasses: false,
  manageCoupons: false,
  manageUsers: false,
  manageRoles: false,
  manageNotifications: false,
  manageAnnouncements: false,
  viewAnalytics: false,
  viewRevenue: false,
  managePayments: false,
  exportData: false,
  importData: false,
  websiteSettings: false,
  firebaseSettings: false
};

export const ADMIN_BASE_PERMISSIONS: UserPermissions = {
  ...INITIAL_PERMISSIONS,
  createSubject: true,
  editSubject: true,
  createMock: true,
  editMock: true,
  uploadQuestions: true,
  editQuestions: true,
  publishContent: true,
  reviewContent: true,
  manageCategories: true,
  manageSeries: true,
  viewAnalytics: true,
  manageNotifications: true,
  manageAnnouncements: true
};

export function isSuperAdmin(profile: UserProfile | null, userEmail?: string | null): boolean {
  if (userEmail && SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())) return true;
  return profile?.role === 'SUPER_ADMIN';
}

export function checkPermission(profile: UserProfile | null, permission: keyof UserPermissions, userEmail?: string | null): boolean {
  // 1. Founder Override
  if (userEmail && SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())) return true;
  
  if (!profile) return false;
  if (profile.role === 'SUPER_ADMIN') return true;
  if (profile.status === 'SUSPENDED' || profile.status === 'DEACTIVATED') return false;
  
  return profile.permissions?.[permission] === true;
}

export function canAccessAdmin(profile: UserProfile | null, userEmail?: string | null): boolean {
  // 1. Founder Override
  if (userEmail && SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())) return true;

  if (!profile) return false;
  if (profile.role === 'SUPER_ADMIN') return true;
  if (profile.status === 'SUSPENDED') return false;
  
  const privilegedRoles = ['ADMIN', 'CONTENT_PARTNER', 'EDITOR', 'REVIEWER', 'MODERATOR'];
  return privilegedRoles.includes(profile.role);
}
