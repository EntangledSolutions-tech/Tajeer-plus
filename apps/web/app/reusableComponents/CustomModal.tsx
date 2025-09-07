'use client';
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@kit/ui/dialog';
import { X } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  showCloseButton = true
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${maxWidth} w-full bg-white p-0 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col [&>button]:hidden`}>
        {/* Header */}
        <div className="bg-primary/5 px-5 py-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-primary">
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-primary text-sm">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
