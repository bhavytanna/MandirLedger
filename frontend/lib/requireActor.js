import { useEffect, useState } from 'react';
import { getActor } from './actor';

export function useRequireActor() {
  const [ready, setReady] = useState(false);
  const [actor, setActor] = useState(null);

  useEffect(() => {
    const a = getActor();
    setActor(a);
    setReady(true);
    if (!a) {
      window.location.href = '/contributor';
    }
  }, []);

  return { ready, actor };
}
