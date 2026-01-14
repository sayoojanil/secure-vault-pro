import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Clock, 
  LogIn, 
  Monitor,
  Save, 
  Loader2 
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useVault } from '@/contexts/VaultContext';
import { apiUpdateProfile } from '@/lib/api';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { stats } = useVault();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loginDetails, setLoginDetails] = useState({
    lastLogin: null as string | null,
    loginCount: 0,
    currentSessionStart: null as string | null,
    deviceInfo: {} as Record<string, string>,
  });

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    
    // Load login details from localStorage
    loadLoginDetails();
  }, [user?.name]);

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  const loadLoginDetails = () => {
    const storedLastLogin = localStorage.getItem('lastLogin');
    const storedLoginCount = parseInt(localStorage.getItem('loginCount') || '0');
    const currentSessionStart = localStorage.getItem('currentSessionStart');
    
    // Get device/browser info
    const deviceInfo = {
      browser: getBrowserName(),
      platform: navigator.platform,
      userAgent: navigator.userAgent.split(' ')[0], // First part of UA
    };
    
    // Check if this is a new session (no current session start time)
    const now = new Date().toISOString();
    let loginCount = storedLoginCount;
    let lastLogin = storedLastLogin;
    
    if (!currentSessionStart) {
      // New session - increment login count
      loginCount += 1;
      lastLogin = now;
      
      // Store updated values
      localStorage.setItem('lastLogin', now);
      localStorage.setItem('loginCount', loginCount.toString());
      localStorage.setItem('currentSessionStart', now);
    } else {
      // Existing session - use stored values
      lastLogin = currentSessionStart; // For display, use when session started
    }
    
    setLoginDetails({
      lastLogin,
      loginCount,
      currentSessionStart: currentSessionStart || now,
      deviceInfo,
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatLoginTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = parseISO(dateString);
    let formattedDate = '';
    
    if (isToday(date)) {
      formattedDate = `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      formattedDate = `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      formattedDate = format(date, 'MMM d, yyyy h:mm a');
    }
    
    return `${formattedDate} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };

  const getSessionDuration = () => {
    const start = loginDetails.currentSessionStart;
    if (!start) return 'N/A';
    
    const startTime = new Date(start).getTime();
    const now = Date.now();
    const durationMs = now - startTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await apiUpdateProfile({ name: name.trim() });
      updateUser({ name: updatedUser.name });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const storagePercent = (stats.used / stats.limit) * 100;

  return (
    <div className="min-h-screen bg-vault-surface">
      <Header />
      
      <main className="pt-24 pb-12 container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-2xl font-bold">Profile</h1>

          {/* Avatar & Basic Info */}
          <div className="vault-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  {user?.isGuest && (
                    <Badge variant="secondary">Guest Account</Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                
                {/* Current Session Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Current session: {getSessionDuration()}</span>
                  </div>
                  {loginDetails.lastLogin && (
                    <div className="flex items-center gap-1">
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Total logins: {loginDetails.loginCount}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                    
                  </>
                  
                ) : 'Edit Profile'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Account Details */}
              <div className="vault-card p-6">
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
                          disabled={isSaving}
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
              <div className="vault-card p-6">
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Session Details */}
              <div className="vault-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Session Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Current Session Started</Label>
                    <p className="text-foreground mt-1">
                      {loginDetails.currentSessionStart 
                        ? formatLoginTime(loginDetails.currentSessionStart)
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Session Duration</Label>
                    <p className="text-foreground mt-1">{getSessionDuration()}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Last Login</Label>
                    <p className="text-foreground mt-1">
                      {loginDetails.lastLogin 
                        ? formatLoginTime(loginDetails.lastLogin)
                        : 'Never'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Total Logins</Label>
                    <p className="text-foreground mt-1">{loginDetails.loginCount}</p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="vault-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Device Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Browser</Label>
                    <p className="text-foreground mt-1">{loginDetails.deviceInfo.browser}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Platform</Label>
                    <p className="text-foreground mt-1">{loginDetails.deviceInfo.platform}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Current Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-green-400  text-white border-green-400">
                        Active
                      </Badge>
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
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Change your password</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div>
                      <p className="font-medium">Session Management</p>
                      <p className="text-sm text-muted-foreground">View all active sessions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div>
                      <p className="font-medium">Login History</p>
                      <p className="text-sm text-muted-foreground">{loginDetails.loginCount} total logins</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}