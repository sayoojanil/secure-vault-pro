import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FolderOpen, 
  Clock, 
  Star, 
  ArrowUpRight,
  FileText,
  CreditCard,
  Heart,
  Shield,
  Scale,
  Folder,
  Plane,
  File,
  User,
  CircleCheck,
  Archive
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useVault } from '@/contexts/VaultContext';
import { DocumentCategory, CATEGORY_LABELS } from '@/types/vault';
import { format, formatDistanceToNow, isAfter, addDays } from 'date-fns';
import { CardSkeleton } from '@/components/ui/skeleton-custom';

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

export function VerifyBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;

  return (
    <Badge
      variant="link"
      className="gap-1 text-xs text-green-600 border-none bg-green-500 text-white"
    >
      Verified
      <CircleCheck className="w-4 h-4" />
    </Badge>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { documents, activities, stats, isLoading } = useVault();

  // Calculate category counts from documents
  const getCategoryCounts = () => {
    const categoryCounts: Record<DocumentCategory, number> = {
      identity: 0,
      financial: 0,
      medical: 0,
      insurance: 0,
      legal: 0,
      personal: 0,
      travel: 0,
      other: 0
    };

    // Filter out archived documents
    const activeDocuments = documents.filter(d => !d.isArchived);
    
    // Count documents per category
    activeDocuments.forEach(doc => {
      if (categoryCounts[doc.category] !== undefined) {
        categoryCounts[doc.category] += 1;
      }
    });

    return categoryCounts;
  };

  const categoryCounts = getCategoryCounts();
  const storagePercent = (stats.used / stats.limit) * 100;
  
  // Get active (non-archived) documents for recent, favorite, and expiring
  const activeDocuments = documents.filter(d => !d.isArchived);
  const archivedDocuments = documents.filter(d => d.isArchived);
  
  const recentDocuments = activeDocuments
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 4);
  
  const favoriteDocuments = activeDocuments.filter(d => d.isFavorite);
  
  const expiringDocuments = activeDocuments.filter(d => {
    if (!d.metadata.expiryDate) return false;
    const expiry = new Date(d.metadata.expiryDate);
    return isAfter(addDays(new Date(), 90), expiry);
  });

  // Calculate total active document count
  const activeDocumentCount = activeDocuments.length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-surface">
        <Header />
        <main className="pt-24 pb-12 container-wide">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            {user?.isGuest 
              ? 'You are viewing as a guest. Sign up to save your documents.' 
              : "Here's an overview of your Cloud vault."}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <Link to="/documents?action=upload" className="vault-card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium">Upload Document</p>
              <p className="text-xs text-muted-foreground">Add new files</p>
            </div>
          </Link>
          
          <Link to="/documents" className="vault-card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">All Documents</p>
                <VerifyBadge verified={user?.verified || activeDocumentCount > 0} />
              </div>
              <p className="text-xs text-muted-foreground">{activeDocumentCount} document{activeDocumentCount !== 1 ? 's' : ''}</p>
            </div>
          </Link>
          
          <Link to="/documents?filter=favorites" className="vault-card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Star className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium">Favorites</p>
              <p className="text-xs text-muted-foreground">{favoriteDocuments.length} item{favoriteDocuments.length !== 1 ? 's' : ''}</p>
            </div>
          </Link>

          <Link to="/documents?filter=archived" className="vault-card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Archive className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium">Archived</p>
              <p className="text-xs text-muted-foreground">{archivedDocuments.length} document{archivedDocuments.length !== 1 ? 's' : ''}</p>
            </div>
          </Link>
        </motion.div>

        {/* Storage Info Card - Moved to separate row for better layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="vault-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage</span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(stats.used)} / {formatBytes(stats.limit)}
              </span>
            </div>
            <Progress value={storagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {storagePercent.toFixed(1)}% used
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Categories</h2>
              <Link to="/documents" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((category) => {
                const Icon = categoryIcons[category];
                const count = categoryCounts[category];
                
                return (
                  <Link
                    key={category}
                    to={`/documents?category=${category}`}
                    className="vault-card-hover p-4 text-center"
                  >
                    <div className="relative mx-auto mb-2 w-fit">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{CATEGORY_LABELS[category]}</p>
                    <p className="text-xs text-muted-foreground">{count} file{count !== 1 ? 's' : ''}</p>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Expiring Soon Section - Re-added with updated content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Expiring Soon</h2>
              <Link to="/documents?filter=expiring" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="vault-card">
              {expiringDocuments.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No expiring documents</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {expiringDocuments.slice(0, 3).map((doc) => {
                    const CategoryIcon = categoryIcons[doc.category];
                    const expiryDate = new Date(doc.metadata.expiryDate!);
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <Link
                        key={doc.id}
                        to={`/documents?id=${doc.id}`}
                        className="p-3 flex items-center justify-between hover:bg-vault-surface-hover transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[150px]">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Expires {format(expiryDate, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={daysUntilExpiry <= 30 ? "destructive" : "outline"}>
                          {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry}d`}
                        </Badge>
                      </Link>
                    );
                  })}
                  {expiringDocuments.length > 3 && (
                    <div className="p-3 text-center">
                      <Link to="/documents?filter=expiring" className="text-sm text-muted-foreground hover:text-foreground">
                        +{expiringDocuments.length - 3} more expiring
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Archived Documents Section */}
        {archivedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold">Archived Documents</h2>
                <Badge variant="outline" className="ml-2">
                  {archivedDocuments.length}
                </Badge>
              </div>
              <Link to="/documents?filter=archived" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                Manage all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="vault-card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {archivedDocuments.slice(0, 3).map((doc) => {
                  const CategoryIcon = categoryIcons[doc.category];
                  return (
                    <Link
                      key={doc.id}
                      to={`/documents?id=${doc.id}`}
                      className="p-3 flex items-center gap-3 hover:bg-vault-surface-hover transition-colors rounded-lg border border-border"
                    >
                      <div className="w-10 h-10 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORY_LABELS[doc.category]}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Archived {formatDistanceToNow(new Date(doc.metadata.archivedAt || doc.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {archivedDocuments.length > 3 && (
                  <div className="col-span-full text-center p-3">
                    <Link to="/documents?filter=archived" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                      View all {archivedDocuments.length} archived documents
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Documents & Activity */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Documents</h2>
              <Link to="/documents" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="vault-card divide-y divide-border">
              {recentDocuments.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No documents yet</p>
                  <Link to="/documents?action=upload">
                    <Button size="sm" className="mt-3">
                      Upload your first document
                    </Button>
                  </Link>
                </div>
              ) : (
                recentDocuments.map((doc) => {
                  const CategoryIcon = categoryIcons[doc.category];
                  return (
                    <Link
                      key={doc.id}
                      to={`/documents?id=${doc.id}`}
                      className="p-3 flex items-center gap-3 hover:bg-vault-surface-hover transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          {doc.verified && <VerifyBadge verified={true} />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(doc.size)} • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {doc.isFavorite && <Star className="w-4 h-4 text-foreground fill-current flex-shrink-0" />}
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold">Recent Activity</h2>
              {activities.length > 0 && (
                <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                  {activities.length}
                </span>
              )}
            </div>
            <div className="vault-card divide-y divide-border">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No recent activity
                </div>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      {activity.action === 'upload' && <Upload className="w-4 h-4" />}
                      {activity.action === 'view' && <FileText className="w-4 h-4" />}
                      {activity.action === 'download' && <ArrowUpRight className="w-4 h-4 rotate-180" />}
                      {activity.action === 'delete' && <File className="w-4 h-4" />}
                      {activity.action === 'rename' && <FileText className="w-4 h-4" />}
                      {activity.action === 'archive' && <Archive className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="capitalize">{activity.action}</span>{' '}
                        <span className="font-medium truncate">{activity.documentName}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}