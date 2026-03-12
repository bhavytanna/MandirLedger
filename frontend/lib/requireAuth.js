import { useEffect, useState } from 'react';
import { getToken, getUser } from './auth';

export function useRequireAuth() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    const u = getUser();
    setUser(u);
    setReady(true);
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  return { ready, user };
}
