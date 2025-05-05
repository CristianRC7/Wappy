import { Toaster, toast } from 'sonner';
import React from 'react';

export const alert = {
  error: (msg: string) => toast.error(msg),
  success: (msg: string) => toast.success(msg),
  warning: (msg: string) => toast.warning(msg),
  info: (msg: string) => toast(msg),
};

const Alert = () => (
  <Toaster position="bottom-right" richColors />
);

export default Alert; 