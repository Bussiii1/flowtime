import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the MobileFrame component
 */
interface MobileFrameProps {
  /** The content to be rendered inside the mobile frame */
  children: React.ReactNode;
  /** Optional additional CSS classes for the frame container */
  className?: string;
}

/**
 * MobileFrame component that wraps its children in a stylized mobile device frame.
 * Useful for demoing mobile-first interfaces in a desktop environment.
 */
export const MobileFrame = React.memo(({ children, className }: MobileFrameProps) => {
  return (
    <div className={cn(
      "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl",
      className
    )}>
      {/* Speaker/Notch area */}
      <div className="w-[148px] h-[18px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 rounded-b-[1rem] absolute" />
      
      {/* Side buttons placeholders */}
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg" />
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg" />

      {/* Screen Content */}
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-slate-950">
        <div className="h-full overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
});

MobileFrame.displayName = 'MobileFrame';
