import { useContext } from 'react';
import { AuthContext } from '@components/AuthContext';

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('Cannot use auth context');
  }
  return ctx;
};
