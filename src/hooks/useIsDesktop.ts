'use client';

import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1024px)';

/**
 * Masaüstü kırılımını JS tarafında bilmek gerekiyor: aynı satıra tıklamak
 * masaüstünde detay panelini seçerken mobilde doğrudan formu açıyor.
 * Sunucuda false başlar, mount sonrası gerçek değere geçer (hydration güvenli).
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
