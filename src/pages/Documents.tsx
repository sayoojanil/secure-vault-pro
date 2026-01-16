import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Star,
  MoreVertical,
  Download,
  Trash2,
  Archive,
  Eye,
  Edit,
  ChevronDown,
  User,
  CreditCard,
  Heart,
  Shield,
  Scale,
  Folder,
  Plane,
  File,
  Tag,
  Calendar,
  Building,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVault } from '@/contexts/VaultContext';
import { Document, DocumentCategory, CATEGORY_LABELS } from '@/types/vault';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentCardSkeleton } from '@/components/ui/skeleton-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Slider,
} from '@/components/ui/slider';
import { VerifyBadge } from "@/components/ui/verify-badge";


const categoryIcons: Record<DocumentCategory, React.ComponentType<{ className?: string }>> = {
  identity: User,
  financial: CreditCard,
  medical: Heart,
  insurance: Shield,
  legal: Scale,
  personal: Folder,
  travel: Plane,
  other: File,
};

const fileTypeIcons = {
  pdf: FileText,
  jpg: ImageIcon,
  png: ImageIcon,
  webp: ImageIcon,
  gif: ImageIcon,
};

// Track last tap time for double tap detection
let lastTapTime = 0;

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, isLoading, deleteDocument, archiveDocument, toggleFavorite, updateDocument, addDocument } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(
    searchParams.get('category') as DocumentCategory | null
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(searchParams.get('action') === 'upload');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState<string>('');
  const [zoomImageName, setZoomImageName] = useState<string>('');

  const handleToggleFavorite = (docId: string, isFavorite: boolean) => {
    toggleFavorite(docId);

    toast.success( 
      isFavorite ? "Removed from favorites" : "Added to favorites",
      {
        description: isFavorite
          ? "This document is no longer starred."
          : "This document has been starred.",
      }
    );
  };

  const handleImageZoom = (imageSrc: string, imageName: string) => {
    setZoomImageSrc(imageSrc);
    setZoomImageName(imageName);
    setZoomLevel(100);
    setRotation(0);
    setShowZoomModal(true);
  };

  // Open PDF in same tab
  const openPdfInSameTab = (documentId: string) => {
    try {
      const token = localStorage.getItem('vault_token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        toast.error('Configuration error. Please try again.');
        return;
      }
      
      const viewUrl = `${apiUrl}/api/documents/${documentId}/view?token=${token}`;
      
      // Navigate in the same tab
      window.location.href = viewUrl;
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error('Failed to open document. Please try again.');
    }
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(d => !d.isArchived);

    if (searchParams.get('filter') === 'favorites') {
      filtered = filtered.filter(d => d.isFavorite);
    }

    if (selectedCategory) {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query)) ||
        d.metadata.issuer?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents, selectedCategory, searchQuery, searchParams]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (files.length === 0) {
      return;
    }

    // Show loading toast
    const toastId = toast.loading(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`);
    
    let successfulUploads = 0;
    let failedUploads = 0;

    try {
      for (const file of files) {
        // Validate file type
        if (!validTypes.includes(file.type)) {
          failedUploads++;
          toast.error(`${file.name || 'File'} is not a supported file type. Only PDF, JPG, PNG, WebP, and GIF are allowed.`, {
            id: `error-${Date.now()}`,
          });
          continue;
        }

        // Validate file size (20MB limit)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
          failedUploads++;
          toast.error(`${file.name || 'File'} is too large. Maximum file size is 20MB.`, {
            id: `error-${Date.now()}`,
          });
          continue;
        }

        // Determine file type
        let fileType: 'pdf' | 'image';
        if (file.type === 'application/pdf') {
          fileType = 'pdf';
        } else {
          fileType = 'image';
        }

        // Ensure file name is not empty
        const fileName = file.name || `Document-${Date.now()}`;

        try {
          await addDocument(file, {
            name: fileName,
            category: 'other',
            type: fileType,
            tags: [],
            metadata: {},
          });
          successfulUploads++;
        } catch (error: any) {
          failedUploads++;
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name || 'file'}: ${error.message || 'Unknown error'}`, {
            id: `error-${Date.now()}`,
          });
        }
      }

      // Update the loading toast with result
      if (successfulUploads > 0 && failedUploads === 0) {
        toast.success(`Successfully uploaded ${successfulUploads} file${successfulUploads > 1 ? 's' : ''}`, {
          id: toastId,
        });
      } else if (successfulUploads > 0 && failedUploads > 0) {
        toast.warning(`Uploaded ${successfulUploads} file${successfulUploads > 1 ? 's' : ''}, ${failedUploads} failed`, {
          id: toastId,
        });
      } else if (successfulUploads === 0) {
        toast.error('No files were uploaded successfully', {
          id: toastId,
        });
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + (error.message || 'Unknown error'), {
        id: toastId,
      });
    } finally {
      setShowUploadDialog(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      const toastId = toast.loading('Deleting document...', {
        description: selectedDocument.name,
      });

      await deleteDocument(selectedDocument.id);

      toast.success('Document deleted successfully', {
        id: toastId,
        description: `${selectedDocument.name} has been permanently deleted.`,
      });

      setShowDeleteDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error('Failed to delete document', {
        description: selectedDocument?.name,
      });
      console.error('Delete error:', error);
    }
  };

  const handleArchive = async (doc: Document) => {
    try {
      const toastId = toast.loading('Archiving document...');
      await archiveDocument(doc.id);
      toast.success('Document archived successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to archive document');
      console.error('Archive error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-surface">
        <Header />
        <main className="pt-24 pb-12 container-wide">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-surface">
      <Header />

      <main className="pt-24 pb-12 container-wide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground text-sm">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button className="gap-2 rounded-full" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4" />
            Upload Documents
          </Button>
        </div>
    
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'All Categories'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((cat) => {
                  const Icon = categoryIcons[cat];
                  return (
                    <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                      <Icon className="w-4 h-4 mr-2" />
                      {CATEGORY_LABELS[cat]}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-input rounded-md">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-secondary' : ''}`}
              >
                <List className="w-4 h-4" />
                
              </button>
              
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-secondary' : ''}`}
              >
                 <Grid className="w-4 h-4" />
               
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || searchParams.get('filter') === 'favorites') && (
          <div className="flex gap-2 mb-6">
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {CATEGORY_LABELS[selectedCategory]}
                <button onClick={() => setSelectedCategory(null)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchParams.get('filter') === 'favorites' && (
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3" />
                Favorites
                <button onClick={() => setSearchParams({})}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="vault-card p-12 text-center"
          >
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
            </p>
            <Button className='rounded-full' onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2 " />
              Upload Document
            </Button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {filteredDocuments.map((doc) => {
                const CategoryIcon = categoryIcons[doc.category];
                const FileIcon = fileTypeIcons[doc.fileType];

                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="vault-card-hover group"
                  >
                    <div
                      className="aspect-[4/3] bg-vault-surface rounded-none flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() => { setSelectedDocument(doc); setShowPreviewDialog(true); }}
                    >
                      {doc.fileType === 'pdf' ? (
                        <FileIcon className="w-12 h-12 text-muted-foreground" />
                      ) : (
                        <img
                          src={doc.thumbnailUrl || doc.fileUrl}
                          alt={doc.name}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (doc.fileType !== 'pdf') {
                              handleImageZoom(doc.thumbnailUrl || doc.fileUrl, doc.name);
                            }
                          }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                            <VerifyBadge verified={doc.isVerified ?? true} />
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CategoryIcon className="w-3 h-3" />
                            <span>{CATEGORY_LABELS[doc.category]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(doc.id, doc.isFavorite)}
                            className={`p-1 rounded hover:bg-secondary ${
                              doc.isFavorite ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${doc.isFavorite ? "fill-current" : ""}`} />
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openPdfInSameTab(doc.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowEditDialog(true); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const token = localStorage.getItem('vault_token');
                                const apiUrl = import.meta.env.VITE_API_URL;
                                window.open(`${apiUrl}/api/documents/${doc.id}/download?token=${token}`, '_blank');
                              }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchive(doc)}>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => { setSelectedDocument(doc); setShowDeleteDialog(true); }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">{formatBytes(doc.size)}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="vault-card divide-y divide-border"
          >
            {filteredDocuments.map((doc) => {
              const CategoryIcon = categoryIcons[doc.category];
              const FileIcon = fileTypeIcons[doc.fileType];

              return (
                <div 
                  key={doc.id} 
                  className="flex items-center gap-4 p-4 hover:bg-vault-surface-hover transition-colors cursor-pointer"
                  onClick={() => { setSelectedDocument(doc); setShowPreviewDialog(true); }}
                >
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <VerifyBadge verified={doc.isVerified ?? true} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3" />
                        {CATEGORY_LABELS[doc.category]}
                      </span>
                      <span>{formatBytes(doc.size)}</span>
                      <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="ghost" className="text-xs hidden sm:inline-flex bg-green-100 text-green-600 border-green-100">
                        {tag}
                      </Badge>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the row click
                        toggleFavorite(doc.id);
                        handleToggleFavorite(doc.id, doc.isFavorite);
                      }}
                      className={`p-2 rounded hover:bg-secondary ${doc.isFavorite ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-2 rounded hover:bg-secondary text-muted-foreground"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering the row click
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPdfInSameTab(doc.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                          setShowEditDialog(true);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          const token = localStorage.getItem('vault_token');
                          const apiUrl = import.meta.env.VITE_API_URL;
                          window.open(`${apiUrl}/api/documents/${doc.id}/download?token=${token}`, '_blank');
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(doc);
                        }}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Drag and drop files or click to browse. Supports PDF, JPG, PNG, WebP, and GIF.
            </DialogDescription>
          </DialogHeader>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-1">Drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
              multiple
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />
            <Button className='rounded-full bg-black text-white hover:bg-gray-600 hover:text-white' variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Select Files
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Maximum file size: 20MB • Supported formats: PDF, JPG, PNG, WebP, GIF
          </p>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-vault-surface rounded-none flex items-center justify-center overflow-hidden">
                {selectedDocument.fileType === 'pdf' ? (
                  <iframe
                    src={`${import.meta.env.VITE_API_URL }/api/documents/${selectedDocument.id}/view?token=${localStorage.getItem('vault_token')}`}
                    className="w-1/4 h-1/4 border-0"
                    title={selectedDocument.name}
                  />
                ) : (
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.name}
                    className="max-w-full max-h-full object-contain cursor-zoom-in"
                    onClick={(e) => {
                      if (selectedDocument.fileType !== 'pdf') {
                        handleImageZoom(selectedDocument.fileUrl, selectedDocument.name);
                        setShowPreviewDialog(false);
                      }
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{CATEGORY_LABELS[selectedDocument.category]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span className="font-medium">{format(new Date(selectedDocument.uploadedAt), 'PPP')}</span>
                  </div>
                  {selectedDocument.metadata.issuer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="font-medium">{selectedDocument.metadata.issuer}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{formatBytes(selectedDocument.size)}</span>
                  </div>
                  {selectedDocument.metadata.expiryDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">{format(new Date(selectedDocument.metadata.expiryDate), 'PPP')}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}

              {selectedDocument.metadata.notes && (
                <div className="bg-vault-surface p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedDocument.metadata.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button 
              className='bg-black text-white'
              variant="outline" 
              onClick={() => {
                if (selectedDocument) {
                  openPdfInSameTab(selectedDocument.id);
                }
              }}
              disabled={selectedDocument?.fileType !== 'pdf'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View document
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const toastId = toast.loading('Updating document...');
                try {
                  await updateDocument(selectedDocument.id, {
                    name: formData.get('name') as string,
                    category: formData.get('category') as DocumentCategory,
                    tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
                    metadata: {
                      ...selectedDocument.metadata,
                      issuer: formData.get('issuer') as string,
                      notes: formData.get('notes') as string,
                    },
                  });
                  setShowEditDialog(false);
                } catch (error) {
                  toast.error('Failed to update document', { id: toastId });
                  console.error('Update error:', error);
                }
              }}
            >
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={selectedDocument.name} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={selectedDocument.category}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" defaultValue={selectedDocument.tags.join(', ')} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="issuer">Issuer</Label>
                <Input id="issuer" name="issuer" defaultValue={selectedDocument.metadata.issuer || ''} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={selectedDocument.metadata.notes || ''} className="mt-1.5" rows={3} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <br/>
                <Button type="submit">Update document</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zoom Modal for Images - Mobile Optimized */}
      <Dialog open={showZoomModal} onOpenChange={setShowZoomModal}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 border-0 bg-black">
          <div className="relative w-full h-full flex flex-col">
            {/* Image Container */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-2 touch-none">
              <motion.img
                src={zoomImageSrc}
                alt={zoomImageName}
                className="origin-center select-none max-w-full max-h-full object-contain"
                style={{
                  scale: zoomLevel / 100,
                  rotate: `${rotation}deg`,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: zoomLevel / 100 }}
                transition={{ duration: 0.2 }}
                // Pinch to zoom gesture support
                onTouchStart={(e) => {
                  if (e.touches.length === 2) {
                    e.preventDefault();
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const distance = Math.hypot(
                      touch2.clientX - touch1.clientX,
                      touch2.clientY - touch1.clientY
                    );
                    
                    // Calculate zoom level based on pinch distance
                    const baseDistance = 100; // arbitrary base distance
                    const newZoom = Math.min(300, Math.max(50, (distance / baseDistance) * 100));
                    setZoomLevel(Math.round(newZoom / 5) * 5); // Round to nearest 5%
                  }
                }}
                // Double tap to zoom
                onTouchEnd={(e) => {
                  if (e.touches.length === 0 && e.changedTouches.length === 1) {
                    const touch = e.changedTouches[0];
                    const now = Date.now();
                    if (now - lastTapTime < 300) {
                      // Double tap detected
                      if (zoomLevel === 100) {
                        setZoomLevel(200);
                      } else {
                        setZoomLevel(100);
                        setRotation(0);
                      }
                    }
                    lastTapTime = now;
                  }
                }}
              />
            </div>

            {/* Compact Mobile Controls */}
            <div className="flex flex-col gap-2 p-3 bg-black/90 backdrop-blur-sm">
              {/* File Name - Compact */}
              <div className="flex items-center justify-center mb-1">
                <p className="text-white text-sm font-medium truncate max-w-[80vw] text-center">
                  {zoomImageName}
                </p>
              </div>

              {/* Zoom Controls Row */}
              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  {/* Reset Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => {
                            setZoomLevel(100);
                            setRotation(0);
                          }}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Reset</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Rotation */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setRotation(prev => (prev + 90) % 360)}
                        >
                          <span className="text-xs font-medium">↻</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Rotate 90°</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Zoom Percentage Display */}
                <div className="flex items-center gap-2">
                  {/* Zoom Out */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                          disabled={zoomLevel <= 50}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Zoom Out</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Zoom Level */}
                  <div className="min-w-[60px] text-center">
                    <span className="text-white text-sm font-medium">{zoomLevel}%</span>
                  </div>

                  {/* Zoom In */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setZoomLevel(prev => Math.min(300, prev + 25))}
                          disabled={zoomLevel >= 300}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Zoom In</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {/* Fullscreen */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Close Button */}
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>

              {/* Zoom Slider - Mobile Friendly */}
              <div className="px-1 mt-1">
                <Slider
                  value={[zoomLevel]}
                  onValueChange={([value]) => setZoomLevel(value)}
                  min={50}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-xs text-white/70">50%</span>
                  <span className="text-xs text-white/70">Zoom</span>
                  <span className="text-xs text-white/70">300%</span>
                </div>
              </div>

              {/* Quick Zoom Presets */}
              <div className="flex justify-center gap-2 mt-2">
                {[100, 150, 200].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    className={`h-7 text-xs ${zoomLevel === preset ? 'bg-white text-black' : 'text-white border-white/30'}`}
                    onClick={() => setZoomLevel(preset)}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}