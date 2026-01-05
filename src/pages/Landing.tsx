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
    icon: Search,
    title: 'Smart Search',
    description: 'Find any document instantly with powerful search, filters, and custom tags.',
  },
  {
    icon: Fingerprint,
    title: 'Access Control',
    description: 'Your documents are protected with enterprise-grade encryption and access controls.',
  },
  {
    icon: Cloud,
    title: 'Always Available',
    description: 'Access your documents from any device, anywhere, anytime with cloud sync.',
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-vault-surface text-xs font-medium mb-8">
              <Lock className="w-3.5 h-3.5" />
              <span>Enterprise-grade security for your personal documents</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your personal data,
              <br />
              <span className="text-muted-foreground">protected forever.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Securely store and manage your most important documents. Passports, licenses, insurance cards, and more — all encrypted and always accessible.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 px-8">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
            
            <p className="mt-4 text-xs text-muted-foreground">
              Demo credentials: demo@vault.app / demo123
            </p>
          </motion.div>
          
          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="vault-card p-2 shadow-vault-xl">
              <div className="aspect-[16/9] bg-vault-surface rounded-md flex items-center justify-center overflow-hidden">
                <div className="w-full h-full p-8">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    {/* Sidebar preview */}
                    <div className="bg-background rounded-lg border border-border p-4">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-muted rounded" />
                        <div className="h-2 w-16 bg-muted/60 rounded" />
                        <div className="h-2 w-24 bg-muted/60 rounded" />
                        <div className="h-2 w-14 bg-muted/60 rounded" />
                      </div>
                    </div>
                    {/* Main content preview */}
                    <div className="col-span-2 bg-background rounded-lg border border-border p-4">
                      <div className="grid grid-cols-2 gap-3 h-full">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-muted/40 rounded-lg p-3 flex flex-col">
                            <div className="h-16 bg-muted rounded mb-2" />
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
      <section id="features" className="py-20 bg-vault-surface">
        <div className="container-wide">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              Everything you need to stay organized
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground max-w-xl mx-auto">
              A complete solution for managing your personal documents with security and simplicity.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="vault-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-vault-surface text-xs font-medium mb-6">
                <Shield className="w-3.5 h-3.5" />
                <span>Bank-level security</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Your security is our priority
              </h2>
              <p className="text-muted-foreground mb-8">
                We use the same security standards as leading financial institutions to protect your sensitive documents. Your data is encrypted, backed up, and always under your control.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="vault-card p-8 bg-primary text-primary-foreground">
                <Lock className="w-16 h-16 mb-6 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">Zero-Knowledge</h3>
                <p className="opacity-80">
                  Only you can access your encrypted documents. Not even our team can view your files — that's how secure we are.
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-vault-surface border border-border rounded-lg flex items-center justify-center">
                <Shield className="w-10 h-10 text-muted-foreground" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Start protecting your documents today
            </h2>
            <p className="opacity-80 mb-8 max-w-xl mx-auto">
              Join thousands of users who trust Vault to keep their personal data safe. Get started in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Try Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
