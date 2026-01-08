import { Shield, LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-lg' },
    md: { icon: 'w-6 h-6', text: 'text-xl' },
    lg: { icon: 'w-8 h-8', text: 'text-2xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        {/* <LockKeyhole className={cn(sizes[size].icon, 'text-foreground')} strokeWidth={2} /> */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
        </div>
      </div>  
      {showText && (
        <span className={cn(sizes[size].text, 'font-semibold tracking-tight text-foreground')}>
          Cloud Vault
        </span>
      )}
    </div>
  );
}
