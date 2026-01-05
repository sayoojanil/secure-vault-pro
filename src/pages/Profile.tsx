import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Camera, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useVault } from '@/contexts/VaultContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const { stats } = useVault();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const storagePercent = (stats.used / stats.limit) * 100;

  return (
    <div className="min-h-screen bg-vault-surface">
      <Header />
      
      <main className="pt-24 pb-12 container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-8">Profile</h1>

          {/* Avatar & Basic Info */}
          <div className="vault-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                {user?.isGuest && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                    Guest Account
                  </span>
                )}
              </div>
              
              <Button 
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : 'Edit Profile'}
              </Button>
            </div>
          </div>

          {/* Account Details */}
          <div className="vault-card p-6 mb-6">
            <h3 className="font-semibold mb-4">Account Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <span>{user?.name}</span>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Email Address</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
              </div>
              
              <div>
                <Label>Member Since</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="vault-card p-6 mb-6">
            <h3 className="font-semibold mb-4">Storage Usage</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Used Storage</span>
                  <span className="text-sm font-medium">
                    {formatBytes(stats.used)} of {formatBytes(stats.limit)}
                  </span>
                </div>
                <Progress value={storagePercent} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-2xl font-bold">{stats.documentCount}</p>
                  <p className="text-sm text-muted-foreground">Documents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{storagePercent.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="vault-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
