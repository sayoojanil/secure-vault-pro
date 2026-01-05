import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Document, DocumentCategory, ActivityLog, StorageStats } from '@/types/vault';
import { useAuth } from './AuthContext';

interface VaultContextType {
  documents: Document[];
  activities: ActivityLog[];
  stats: StorageStats;
  isLoading: boolean;
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt' | 'modifiedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  archiveDocument: (id: string) => void;
  toggleFavorite: (id: string) => void;
  searchDocuments: (query: string) => Document[];
  filterByCategory: (category: DocumentCategory | null) => Document[];
  filterByTags: (tags: string[]) => Document[];
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const generateDemoDocuments = (): Document[] => {
  const categories: DocumentCategory[] = ['identity', 'financial', 'medical', 'insurance', 'legal', 'personal', 'travel'];
  
  return [
    {
      id: '1',
      name: 'Passport.pdf',
      type: 'pdf',
      category: 'identity',
      fileType: 'pdf',
      size: 2.5 * 1024 * 1024,
      uploadedAt: new Date('2024-12-01'),
      modifiedAt: new Date('2024-12-01'),
      tags: ['passport', 'travel', 'id'],
      metadata: { issuer: 'US Department of State', expiryDate: new Date('2034-06-15'), documentNumber: 'US12345678' },
      fileUrl: '/demo/passport.pdf',
      isArchived: false,
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Driver_License.jpg',
      type: 'license',
      category: 'identity',
      fileType: 'jpg',
      size: 1.2 * 1024 * 1024,
      uploadedAt: new Date('2024-11-20'),
      modifiedAt: new Date('2024-11-20'),
      tags: ['license', 'driving', 'id'],
      metadata: { issuer: 'California DMV', expiryDate: new Date('2028-03-22') },
      fileUrl: '/demo/license.jpg',
      isArchived: false,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Health_Insurance_Card.png',
      type: 'insurance',
      category: 'insurance',
      fileType: 'png',
      size: 850 * 1024,
      uploadedAt: new Date('2024-11-15'),
      modifiedAt: new Date('2024-11-15'),
      tags: ['health', 'insurance', 'medical'],
      metadata: { issuer: 'Blue Cross Blue Shield', expiryDate: new Date('2025-12-31') },
      fileUrl: '/demo/insurance.png',
      isArchived: false,
      isFavorite: false,
    },
    {
      id: '4',
      name: 'Tax_Return_2024.pdf',
      type: 'pdf',
      category: 'financial',
      fileType: 'pdf',
      size: 4.1 * 1024 * 1024,
      uploadedAt: new Date('2024-10-28'),
      modifiedAt: new Date('2024-10-28'),
      tags: ['taxes', '2024', 'financial'],
      metadata: { issuer: 'IRS', notes: 'Federal tax return for fiscal year 2024' },
      fileUrl: '/demo/taxes.pdf',
      isArchived: false,
      isFavorite: false,
    },
    {
      id: '5',
      name: 'Birth_Certificate.pdf',
      type: 'pdf',
      category: 'identity',
      fileType: 'pdf',
      size: 1.8 * 1024 * 1024,
      uploadedAt: new Date('2024-10-15'),
      modifiedAt: new Date('2024-10-15'),
      tags: ['birth', 'certificate', 'official'],
      metadata: { issuer: 'County Clerk Office', documentNumber: 'BC-1990-45678' },
      fileUrl: '/demo/birth.pdf',
      isArchived: false,
      isFavorite: false,
    },
    {
      id: '6',
      name: 'Vaccination_Record.pdf',
      type: 'pdf',
      category: 'medical',
      fileType: 'pdf',
      size: 920 * 1024,
      uploadedAt: new Date('2024-09-30'),
      modifiedAt: new Date('2024-09-30'),
      tags: ['medical', 'vaccination', 'health'],
      metadata: { issuer: 'City Health Department', notes: 'Complete vaccination history' },
      fileUrl: '/demo/vaccine.pdf',
      isArchived: false,
      isFavorite: false,
    },
    {
      id: '7',
      name: 'Car_Insurance_Policy.pdf',
      type: 'insurance',
      category: 'insurance',
      fileType: 'pdf',
      size: 3.2 * 1024 * 1024,
      uploadedAt: new Date('2024-09-15'),
      modifiedAt: new Date('2024-09-15'),
      tags: ['auto', 'insurance', 'policy'],
      metadata: { issuer: 'State Farm', expiryDate: new Date('2025-09-15') },
      fileUrl: '/demo/car-insurance.pdf',
      isArchived: false,
      isFavorite: false,
    },
    {
      id: '8',
      name: 'Property_Deed.pdf',
      type: 'pdf',
      category: 'legal',
      fileType: 'pdf',
      size: 5.5 * 1024 * 1024,
      uploadedAt: new Date('2024-08-20'),
      modifiedAt: new Date('2024-08-20'),
      tags: ['property', 'deed', 'legal', 'real-estate'],
      metadata: { issuer: 'County Recorder', documentNumber: 'DEED-2024-12345' },
      fileUrl: '/demo/deed.pdf',
      isArchived: false,
      isFavorite: true,
    },
    {
      id: '9',
      name: 'Wedding_Photos.jpg',
      type: 'image',
      category: 'personal',
      fileType: 'jpg',
      size: 8.2 * 1024 * 1024,
      uploadedAt: new Date('2024-07-10'),
      modifiedAt: new Date('2024-07-10'),
      tags: ['wedding', 'photos', 'personal', 'memories'],
      metadata: { notes: 'Favorite wedding ceremony photos' },
      fileUrl: '/demo/wedding.jpg',
      isArchived: false,
      isFavorite: true,
    },
    {
      id: '10',
      name: 'Flight_Itinerary_NYC.pdf',
      type: 'pdf',
      category: 'travel',
      fileType: 'pdf',
      size: 450 * 1024,
      uploadedAt: new Date('2024-12-20'),
      modifiedAt: new Date('2024-12-20'),
      tags: ['travel', 'flight', 'nyc', 'booking'],
      metadata: { issuer: 'United Airlines', notes: 'Round trip to NYC, Jan 2025' },
      fileUrl: '/demo/flight.pdf',
      isArchived: false,
      isFavorite: false,
    },
  ];
};

const generateDemoActivities = (): ActivityLog[] => {
  return [
    { id: '1', action: 'upload', documentId: '10', documentName: 'Flight_Itinerary_NYC.pdf', timestamp: new Date('2024-12-20T14:30:00') },
    { id: '2', action: 'view', documentId: '1', documentName: 'Passport.pdf', timestamp: new Date('2024-12-19T10:15:00') },
    { id: '3', action: 'download', documentId: '4', documentName: 'Tax_Return_2024.pdf', timestamp: new Date('2024-12-18T16:45:00') },
    { id: '4', action: 'upload', documentId: '1', documentName: 'Passport.pdf', timestamp: new Date('2024-12-01T09:00:00') },
    { id: '5', action: 'rename', documentId: '2', documentName: 'Driver_License.jpg', timestamp: new Date('2024-11-25T11:30:00') },
  ];
};

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !user.isGuest) {
      const savedDocs = localStorage.getItem('vault_documents');
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      } else {
        const demoDocs = generateDemoDocuments();
        setDocuments(demoDocs);
        localStorage.setItem('vault_documents', JSON.stringify(demoDocs));
      }
      setActivities(generateDemoActivities());
    } else if (user?.isGuest) {
      setDocuments([]);
      setActivities([]);
    }
    setIsLoading(false);
  }, [user]);

  const stats: StorageStats = {
    used: documents.reduce((acc, doc) => acc + doc.size, 0),
    limit: user?.storageLimit || 1024 * 1024 * 1024,
    documentCount: documents.filter(d => !d.isArchived).length,
    categoryBreakdown: documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<DocumentCategory, number>),
  };

  const addDocument = useCallback((doc: Omit<Document, 'id' | 'uploadedAt' | 'modifiedAt'>) => {
    const newDoc: Document = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date(),
      modifiedAt: new Date(),
    };
    setDocuments(prev => {
      const updated = [newDoc, ...prev];
      localStorage.setItem('vault_documents', JSON.stringify(updated));
      return updated;
    });
    setActivities(prev => [{
      id: `activity-${Date.now()}`,
      action: 'upload',
      documentId: newDoc.id,
      documentName: newDoc.name,
      timestamp: new Date(),
    }, ...prev]);
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => {
      const updated = prev.map(doc => 
        doc.id === id ? { ...doc, ...updates, modifiedAt: new Date() } : doc
      );
      localStorage.setItem('vault_documents', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc) {
        setActivities(acts => [{
          id: `activity-${Date.now()}`,
          action: 'delete',
          documentId: id,
          documentName: doc.name,
          timestamp: new Date(),
        }, ...acts]);
      }
      const updated = prev.filter(doc => doc.id !== id);
      localStorage.setItem('vault_documents', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const archiveDocument = useCallback((id: string) => {
    updateDocument(id, { isArchived: true });
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        action: 'archive',
        documentId: id,
        documentName: doc.name,
        timestamp: new Date(),
      }, ...prev]);
    }
  }, [documents, updateDocument]);

  const toggleFavorite = useCallback((id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      updateDocument(id, { isFavorite: !doc.isFavorite });
    }
  }, [documents, updateDocument]);

  const searchDocuments = useCallback((query: string): Document[] => {
    const lowerQuery = query.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.metadata.issuer?.toLowerCase().includes(lowerQuery) ||
      doc.metadata.notes?.toLowerCase().includes(lowerQuery)
    );
  }, [documents]);

  const filterByCategory = useCallback((category: DocumentCategory | null): Document[] => {
    if (!category) return documents.filter(d => !d.isArchived);
    return documents.filter(doc => doc.category === category && !doc.isArchived);
  }, [documents]);

  const filterByTags = useCallback((tags: string[]): Document[] => {
    if (tags.length === 0) return documents.filter(d => !d.isArchived);
    return documents.filter(doc => 
      tags.some(tag => doc.tags.includes(tag)) && !doc.isArchived
    );
  }, [documents]);

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
