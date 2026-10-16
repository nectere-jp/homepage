'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal } from '@/components/admin/Modal';
import { AdminButton } from '@/components/admin/AdminButton';

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <Modal
          isOpen
          onClose={() => handleClose(false)}
          title={options.title}
          description={options.description}
          size="md"
          closeOnOverlay={false}
          footer={
            <div className="flex items-center justify-end gap-3">
              <AdminButton variant="ghost" onClick={() => handleClose(false)}>
                {options.cancelLabel ?? 'キャンセル'}
              </AdminButton>
              <AdminButton
                variant={options.variant === 'danger' ? 'danger' : 'primary'}
                onClick={() => handleClose(true)}
              >
                {options.confirmLabel ?? 'OK'}
              </AdminButton>
            </div>
          }
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within <ConfirmProvider>');
  }
  return ctx.confirm;
}
