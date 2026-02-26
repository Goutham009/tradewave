import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary: 'border-transparent bg-slate-700 text-slate-200 hover:bg-slate-600',
        destructive: 'border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        outline: 'border-2 border-slate-600 text-slate-300 hover:bg-slate-800',
        success: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        info: 'border-transparent bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        pending: 'border-transparent bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
        confirmed: 'border-transparent bg-teal-500/15 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
        failed: 'border-transparent bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
