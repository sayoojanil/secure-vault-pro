export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'license' | 'insurance' | 'other';
  category: DocumentCategory;
  fileType: 'pdf' | 'jpg' | 'png';
  size: number;
  uploadedAt: Date;
  modifiedAt: Date;
  tags: string[];
  metadata: DocumentMetadata;
  thumbnailUrl?: string;
  fileUrl: string;
  isArchived: boolean;
  isFavorite: boolean;
}

export interface DocumentMetadata {
  issuer?: string;
  expiryDate?: Date;
  notes?: string;
  documentNumber?: string;
}

export type DocumentCategory = 
  | 'identity'
  | 'financial'
  | 'medical'
  | 'insurance'
  | 'legal'
  | 'personal'
  | 'travel'
  | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  storageUsed: number;
  storageLimit: number;
  isGuest: boolean;
}

export interface StorageStats {
  used: number;
  limit: number;
  documentCount: number;
  categoryBreakdown: Record<DocumentCategory, number>;
}

export interface ActivityLog {
  id: string;
  action: 'upload' | 'view' | 'download' | 'delete' | 'rename' | 'archive';
  documentId: string;
  documentName: string;
  timestamp: Date;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identity: 'Identity Documents',
  financial: 'Financial Records',
  medical: 'Medical Records',
  insurance: 'Insurance Policies',
  legal: 'Legal Documents',
  personal: 'Personal Files',
  travel: 'Travel Documents',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  identity: 'User',
  financial: 'CreditCard',
  medical: 'Heart',
  insurance: 'Shield',
  legal: 'Scale',
  personal: 'Folder',
  travel: 'Plane',
  other: 'File',
};
