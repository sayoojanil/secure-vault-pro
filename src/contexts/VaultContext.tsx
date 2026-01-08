import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Document, DocumentCategory, ActivityLog, StorageStats } from '@/types/vault';
import { useAuth } from './AuthContext';
import {
  apiGetDocuments,
  apiUploadDocument,
  apiUpdateDocument,
  apiDeleteDocument,
  apiArchiveDocument,
  apiToggleFavorite,
  apiGetActivities,
  apiGetStats,
} from '@/lib/api';
import { toast } from 'sonner';

interface VaultContextType {
  documents: Document[];
  activities: ActivityLog[];
  stats: StorageStats;
  isLoading: boolean;
  addDocument: (file: File, metadata?: {
    name?: string;
    category?: DocumentCategory;
    type?: string;
    tags?: string[];
    metadata?: any;
  }) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  archiveDocument: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  searchDocuments: (query: string) => Document[];
  filterByCategory: (category: DocumentCategory | null) => Document[];
  filterByTags: (tags: string[]) => Document[];
  refreshDocuments: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<StorageStats>({
    used: 0,
    limit: 1024 * 1024 * 1024,
    documentCount: 0,
    categoryBreakdown: {} as Record<DocumentCategory, number>,
  });
  const [isLoading, setIsLoading] = useState(true);

  

  // Transform backend document to frontend format
  const transformDocument = (doc: any): Document => {
    return {
      id: doc._id || doc.id,
      name: doc.name,
      type: doc.type,
      category: doc.category,
      fileType: doc.fileType,
      size: doc.size,
      uploadedAt: new Date(doc.createdAt || doc.uploadedAt),
      modifiedAt: new Date(doc.updatedAt || doc.modifiedAt),
      tags: doc.tags || [],
      metadata: doc.metadata || {},
      thumbnailUrl: doc.thumbnailUrl,
      fileUrl: doc.fileUrl,
      isArchived: doc.isArchived || false,
      isFavorite: doc.isFavorite || false,
    };
  };

  // Transform backend activity to frontend format
  const transformActivity = (activity: any): ActivityLog => {
    return {
      id: activity._id || activity.id,
      action: activity.action,
      documentId: activity.documentId?._id || activity.documentId || activity.documentId,
      documentName: activity.documentName,
      timestamp: new Date(activity.createdAt || activity.timestamp),
    };
  };

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    if (!isAuthenticated || user?.isGuest) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docs = await apiGetDocuments();
      const transformedDocs = docs.map(transformDocument);
      setDocuments(transformedDocs);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.isGuest]);

  // Fetch activities from backend
  const fetchActivities = useCallback(async () => {
    if (!isAuthenticated || user?.isGuest) {
      setActivities([]);
      return;
    }

    try {
      const acts = await apiGetActivities(50);
      const transformedActs = acts.map(transformActivity);
      setActivities(transformedActs);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  }, [isAuthenticated, user?.isGuest]);

  // Fetch stats from backend
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || user?.isGuest) {
      setStats({
        used: 0,
        limit: user?.storageLimit || 1024 * 1024 * 1024,
        documentCount: 0,
        categoryBreakdown: {} as Record<DocumentCategory, number>,
      });
      return;
    }

    try {
      const statsData = await apiGetStats();
      setStats({
        used: statsData.used || 0,
        limit: statsData.limit || user?.storageLimit || 1024 * 1024 * 1024,
        documentCount: statsData.documentCount || 0,
        categoryBreakdown: statsData.categoryBreakdown || {},
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  }, [isAuthenticated, user?.isGuest, user?.storageLimit]);

  // Load data when user changes
  useEffect(() => {
    if (user && !user.isGuest && isAuthenticated) {
      fetchDocuments();
      fetchActivities();
      fetchStats();
    } else if (user?.isGuest) {
      setDocuments([]);
      setActivities([]);
      setStats({
        used: 0,
        limit: 100 * 1024 * 1024,
        documentCount: 0,
        categoryBreakdown: {} as Record<DocumentCategory, number>,
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, fetchDocuments, fetchActivities, fetchStats]);

  // Upload document to backend (which uploads to Cloudinary)
  const addDocument = useCallback(async (
    file: File,
    metadata?: {
      name?: string;
      category?: DocumentCategory;
      type?: string;
      tags?: string[];
      metadata?: any;
    }
  ) => {
    if (!isAuthenticated || user?.isGuest) {
      toast.error('Please sign in to upload documents');
      throw new Error('Authentication required');
    }

    // Validate file
    if (!file) {
      toast.error('No file provided');
      throw new Error('No file provided');
    }

    // Ensure all required fields are provided
    const fileName = metadata?.name || file.name || `Document-${Date.now()}`;
    const category = metadata?.category || 'other';
    const type = metadata?.type || (file.type === 'application/pdf' ? 'pdf' : 'image');
    const tags = metadata?.tags || [];
    const docMetadata = metadata?.metadata || {};

    try {
      const uploadedDoc = await apiUploadDocument(file, {
        name: fileName,
        category: category,
        type: type,
        tags: tags,
        metadata: docMetadata,
      });

      const transformedDoc = transformDocument(uploadedDoc);
      setDocuments(prev => [transformedDoc, ...prev]);
      
      // Refresh stats and activities
      await Promise.all([
        fetchStats().catch(err => console.error('Failed to refresh stats:', err)),
        fetchActivities().catch(err => console.error('Failed to refresh activities:', err))
      ]);
      
      toast.success(`${fileName} uploaded successfully`);
      return transformedDoc;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error?.message || 'Failed to upload document';
      toast.error(errorMessage);
      throw error;
    }
  }, [isAuthenticated, user?.isGuest, fetchStats, fetchActivities]);

  // Update document
 const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
  if (!isAuthenticated || user?.isGuest) {
    toast.error('Please sign in to update documents');
    return;
  }

  // 🔹 Get existing document name BEFORE update
  const existingDoc = documents.find(doc => doc.id === id);
  const documentName = updates.name || existingDoc?.name || 'Document';

  try {
    const updatedDoc = await apiUpdateDocument(id, updates);
    const transformedDoc = transformDocument(updatedDoc);

    setDocuments(prev =>
      prev.map(doc => doc.id === id ? transformedDoc : doc)
    );

    await fetchActivities();

    toast.success('Document updated', {
      description: `"${documentName}" has been updated successfully.`,
    });

  } catch (error: any) {
    console.error('Error updating document:', error);
    toast.error('Failed to update document');
    throw error;
  }
}, [isAuthenticated, user?.isGuest, documents, fetchActivities]);


  // Delete document
  const deleteDocument = useCallback(async (id: string) => {
    if (!isAuthenticated || user?.isGuest) {
      toast.error('Please sign in to delete documents');
      return;
    }

    try {
      await apiDeleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Refresh stats and activities
      await fetchStats();
      await fetchActivities();
      
      // toast.success('Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      throw error;
    }
  }, [isAuthenticated, user?.isGuest, fetchStats, fetchActivities]);

  // Archive document
  const archiveDocument = useCallback(async (id: string) => {
    if (!isAuthenticated || user?.isGuest) {
      toast.error('Please sign in to archive documents');
      return;
    }

    try {
      const archivedDoc = await apiArchiveDocument(id);
      const transformedDoc = transformDocument(archivedDoc);
      
      setDocuments(prev =>
        prev.map(doc => doc.id === id ? transformedDoc : doc)
      );
      
      await fetchActivities();
      toast.success('Document archived successfully');
    } catch (error: any) {
      console.error('Error archiving document:', error);
      toast.error('Failed to archive document');
      throw error;
    }
  }, [isAuthenticated, user?.isGuest, fetchActivities]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string) => {
    if (!isAuthenticated || user?.isGuest) {
      return;
    }

    try {
      const updatedDoc = await apiToggleFavorite(id);
      const transformedDoc = transformDocument(updatedDoc);
      
      setDocuments(prev =>
        prev.map(doc => doc.id === id ? transformedDoc : doc)
      );
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  }, [isAuthenticated, user?.isGuest]);

  // Search documents (client-side filtering)
  const searchDocuments = useCallback((query: string): Document[] => {
    const lowerQuery = query.toLowerCase();
    return documents.filter(doc =>
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.metadata.issuer?.toLowerCase().includes(lowerQuery) ||
      doc.metadata.notes?.toLowerCase().includes(lowerQuery)
    );
  }, [documents]);

  // Filter by category
  const filterByCategory = useCallback((category: DocumentCategory | null): Document[] => {
    if (!category) return documents.filter(d => !d.isArchived);
    return documents.filter(doc => doc.category === category && !doc.isArchived);
  }, [documents]);

  // Filter by tags
  const filterByTags = useCallback((tags: string[]): Document[] => {
    if (tags.length === 0) return documents.filter(d => !d.isArchived);
    return documents.filter(doc =>
      tags.some(tag => doc.tags.includes(tag)) && !doc.isArchived
    );
  }, [documents]);

  // Refresh documents
  const refreshDocuments = useCallback(async () => {
    await fetchDocuments();
    await fetchActivities();
    await fetchStats();
  }, [fetchDocuments, fetchActivities, fetchStats]);

  return (
    <VaultContext.Provider value={{
      documents,
      activities,
      stats,
      isLoading,
      addDocument,
      updateDocument,
      deleteDocument,
      archiveDocument,
      toggleFavorite,
      searchDocuments,
      filterByCategory,
      filterByTags,
      refreshDocuments,
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
