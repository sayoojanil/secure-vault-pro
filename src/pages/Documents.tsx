import { useState, useCallback, useMemo } from 'react';
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
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

// Zoomable Image Component
const ZoomableImage = ({ src, alt, className = '' }: { 
  src: string; 
  alt: string; 
  className?: string;
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const minScale = 0.5;
  const maxScale = 4;
  const scaleStep = 0.2;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
    const newScale = Math.min(maxScale, Math.max(minScale, scale + delta));
    
    // Zoom to cursor position
    if (newScale !== scale) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleFactor = newScale / scale;
      const newX = mouseX - (mouseX - position.x) * scaleFactor;
      const newY = mouseY - (mouseY - position.y) * scaleFactor;
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }
  }, [scale, position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(maxScale, scale + scaleStep);
    setScale(newScale);
    // Center the image when zooming in
    if (newScale > 1) {
      const container = document.querySelector('.image-container') as HTMLElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setPosition({
          x: rect.width / 2 - (rect.width / 2) * (newScale / scale),
          y: rect.height / 2 - (rect.height / 2) * (newScale / scale)
        });
      }
    }
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(minScale, scale - scaleStep);
    setScale(newScale);
    // Reset position when zoomed out completely
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      const elem = document.querySelector('.image-container') as HTMLElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Listen for fullscreen change
  useState(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newScale = scale === 1 ? 2 : 1;
    const scaleFactor = newScale / scale;
    
    const newX = mouseX - (mouseX - position.x) * scaleFactor;
    const newY = mouseY - (mouseY - position.y) * scaleFactor;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [scale, position]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Image Container */}
      <div 
        className={`image-container w-full h-full bg-vault-surface ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain ${className}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            transformOrigin: '0 0'
          }}
        />
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= minScale}
          className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1 px-2">
          <span className="text-white text-sm font-medium min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
          className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <div className="h-6 w-px bg-white/30 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Zoom Instructions */}
      {scale === 1 && (
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          Double click or scroll to zoom • Drag to pan when zoomed
        </div>
      )}
    </div>
  );
};

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, isLoading, deleteDocument, archiveDocument, toggleFavorite, updateDocument, addDocument } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(
    searchParams.get('category') as DocumentCategory | null
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(searchParams.get('action') === 'upload');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    // ... (keep the existing handleFiles function code)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (files.length === 0) {
      return;
    }

    const toastId = toast.loading(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`);
    
    let successfulUploads = 0;
    let failedUploads = 0;

    try {
      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          failedUploads++;
          toast.error(`${file.name || 'File'} is not a supported file type. Only PDF, JPG, PNG, WebP, and GIF are allowed.`, {
            id: `error-${Date.now()}`,
          });
          continue;
        }

        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
          failedUploads++;
          toast.error(`${file.name || 'File'} is too large. Maximum file size is 20MB.`, {
            id: `error-${Date.now()}`,
          });
          continue;
        }

        let fileType: 'pdf' | 'image';
        if (file.type === 'application/pdf') {
          fileType = 'pdf';
        } else {
          fileType = 'image';
        }

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
    if (selectedDocument) {
      try {
        const toastId = toast.loading('Deleting document...');
        await deleteDocument(selectedDocument.id);
        toast.success('Document deleted successfully', { id: toastId });
        setShowDeleteDialog(false);
        setSelectedDocument(null);
      } catch (error) {
        toast.error('Failed to delete document');
        console.error('Delete error:', error);
      }
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

  const openPdfInNewTab = (documentId: string) => {
    const token = localStorage.getItem('vault_token');
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const viewUrl = `${apiUrl}/api/documents/${documentId}/view?token=${token}`;
    
    const newWindow = window.open(
      viewUrl,
      '_blank',
      'noopener,noreferrer,width=1200,height=800'
    );
    
    if (!newWindow) {
      toast.error('Please allow popups to view PDFs in new tab');
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
          <Button className="gap-2" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4" />
            Upload
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
              className="pl-10"
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
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-secondary' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-secondary' : ''}`}
              >
                <List className="w-4 h-4" />
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
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
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
                      className="aspect-[4/3] bg-vault-surface rounded-t-lg flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() => { setSelectedDocument(doc); setShowPreviewDialog(true); }}
                    >
                      {doc.fileType === 'pdf' ? (
                        <FileIcon className="w-12 h-12 text-muted-foreground" />
                      ) : (
                        <img
                          src={doc.thumbnailUrl || doc.fileUrl}
                          alt={doc.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CategoryIcon className="w-3 h-3" />
                            <span>{CATEGORY_LABELS[doc.category]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(doc.id)}
                            className={`p-1 rounded hover:bg-secondary ${doc.isFavorite ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowPreviewDialog(true); }}>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowEditDialog(true); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const token = localStorage.getItem('vault_token');
                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
                <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-vault-surface-hover transition-colors">
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
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
                      <Badge key={tag} variant="outline" className="text-xs hidden sm:inline-flex">
                        {tag}
                      </Badge>
                    ))}
                    <button
                      onClick={() => toggleFavorite(doc.id)}
                      className={`p-2 rounded hover:bg-secondary ${doc.isFavorite ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded hover:bg-secondary text-muted-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowPreviewDialog(true); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowEditDialog(true); }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const token = localStorage.getItem('vault_token');
                          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
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
        <DialogContent className="sm:max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDocument?.name}</span>
              {selectedDocument?.fileType !== 'pdf' && (
                <div className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Scroll to zoom • Double click to toggle
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Image/PDF Viewer */}
              <div className="flex-1 min-h-0 bg-vault-surface rounded-lg overflow-hidden">
                {selectedDocument.fileType === 'pdf' ? (
                  <iframe
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${selectedDocument.id}/view?token=${localStorage.getItem('vault_token')}`}
                    className="w-full h-full border-0"
                    title={selectedDocument.name}
                  />
                ) : (
                  <ZoomableImage
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.name}
                  />
                )}
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Document Information</h4>
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
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">File Details</h4>
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
                </div>
              </div>

              {/* Tags and Notes */}
              <div className="space-y-4">
                {selectedDocument.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDocument.metadata.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <div className="bg-vault-surface p-3 rounded-lg">
                      <p className="text-sm">{selectedDocument.metadata.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            {selectedDocument?.fileType === 'pdf' ? (
              <Button 
                className='bg-black text-white'
                variant="outline" 
                onClick={() => {
                  if (selectedDocument) {
                    openPdfInNewTab(selectedDocument.id);
                  }
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in new tab
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground">
                Use scroll wheel to zoom • Drag to pan when zoomed • Double click to toggle zoom
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (selectedDocument) {
                    const token = localStorage.getItem('vault_token');
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    window.open(`${apiUrl}/api/documents/${selectedDocument.id}/download?token=${token}`, '_blank');
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
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
                  toast.success('Document updated successfully', { id: toastId });
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
                <Button type="submit">Save Changes</Button>
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
    </div>
  );
}