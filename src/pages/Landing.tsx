import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Upload, 
  Search, 
  FolderLock, 
  ArrowRight, 
  Check,
  Fingerprint,
  Cloud,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: FolderLock,
    title: 'Secure Storage',
    description: 'Store passports, licenses, insurance cards, and sensitive documents in one secure location.',
  },
  {
    icon: Upload,
    title: 'Easy Uploads',
    description: 'Drag and drop files or click to upload. Supports PDF, JPG, and PNG formats.',
  },
  {
    icon: Eye,
    title: 'Quick Preview',
    description: 'Preview documents instantly without downloading. View metadata and notes at a glance.',
  },
];

const securityFeatures = [
  'AES-256 encryption at rest',
  'TLS 1.3 encryption in transit',
  'Zero-knowledge architecture',
  'SOC 2 Type II certified',
  'GDPR compliant',
  'Automatic backups',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-blue-500 text-white text-xs font-medium mb-6 md:mb-8">
              <Lock className="w-3.5 h-3.5" />
              <span>Best security for your personal documents</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              Your personal data,
              <br />
              <span className="text-muted-foreground">protected forever.</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto">
              Securely store and manage your most important documents. Passports, licenses, insurance cards, and more — all encrypted and always accessible.
            </p>
            
            {/* Conditionally render auth buttons */}
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 w-full sm:w-auto px-6 md:px-8">
                    Create your account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 w-full sm:w-auto px-6 md:px-8">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/documents" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Documents
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
          
          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 md:mt-16 max-w-4xl mx-auto px-4"
          >
            <div className="vault-card p-2 shadow-vault-xl overflow-hidden">
              <div className="aspect-[16/9] bg-vault-surface rounded-md flex items-center justify-center">
                <div className="w-full h-full p-4 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
                    {/* Sidebar preview */}
                    <div className="bg-background rounded-lg border border-border p-3 md:p-4">
                      <div className="space-y-2">
                        <div className="h-3 w-16 md:w-20 bg-muted rounded" />
                        <div className="h-2 w-12 md:w-16 bg-muted/60 rounded" />
                        <div className="h-2 w-16 md:w-24 bg-muted/60 rounded" />
                        <div className="h-2 w-10 md:w-14 bg-muted/60 rounded" />
                      </div>
                    </div>
                    {/* Main content preview */}
                    <div className="col-span-2 bg-background rounded-lg border border-border p-3 md:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 h-full">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-muted/40 rounded-lg p-2 md:p-3 flex flex-col">
                            <div className="h-12 md:h-16 bg-muted rounded mb-2" />
                            <div className="h-2 w-3/4 bg-muted rounded mb-1" />
                            <div className="h-2 w-1/2 bg-muted/60 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-vault-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Everything you need to stay organized
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              A complete solution for managing your personal documents with security and simplicity.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="vault-card-hover p-4 md:p-6"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary flex items-center justify-center mb-3 md:mb-4">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Security Section */}
      <section id="security" className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-blue-500 text-xs text-white font-medium mb-4 md:mb-6">
                <Shield className="w-3.5 h-3.5" />
                <span>Bank-level security</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                Your security is our priority
              </h2>
              <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                We use the same security standards as leading financial institutions to protect your sensitive documents. Your data is encrypted, backed up, and always under your control.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 py-1">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary-foreground" />
                    </div>
                    <span className="text-xs md:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative order-1 lg:order-2 mb-8 lg:mb-0"
            >
              <div className="vault-card p-6 md:p-8 bg-primary text-primary-foreground">
                <Lock className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 opacity-80" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">Zero-Knowledge</h3>
                <p className="opacity-80 text-sm md:text-base">
                  Only you can access your encrypted documents. Not even our team can view your files — that's how secure we are.
                </p>
              </div>
              <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-16 h-16 md:w-24 md:h-24 bg-vault-surface border border-border rounded-lg flex items-center justify-center">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              {isAuthenticated ? 'Continue managing your documents' : 'Start protecting your documents today'}
            </h2>
            <p className="opacity-80 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base">
              {isAuthenticated 
                ? 'Your documents are safely encrypted and ready for you.'
                : 'Join thousands of users who trust Vault to keep their personal data safe. Get started in seconds.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              {!isAuthenticated ? (
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto px-6 md:px-8">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto px-6 md:px-8">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/documents" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="border-primary-foreground/20 text-black hover:bg-white w-full sm:w-auto"> 
                      View Documents
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}