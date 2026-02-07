'use client';

import { usePathname } from 'next/navigation';
import { BusinessProvider } from '@/contexts/BusinessContext';
import { ReactNode, useEffect, useState, useRef } from 'react';

type Business = 'nobilva' | 'teachit' | 'translation' | 'web-design' | 'print' | null;

interface DynamicBusinessProviderProps {
  children: ReactNode;
  initialBusiness?: Business;
}

/**
 * pathnameから動的にbusinessを決定するProvider
 * Blog記事ページなど、ページからbusinessを設定する場合はinitialBusinessを使用
 * Blog記事ページの場合は、ページのメタデータからbusinessを読み取る
 */
export function DynamicBusinessProvider({ 
  children, 
  initialBusiness 
}: DynamicBusinessProviderProps) {
  const pathname = usePathname();
  const [business, setBusiness] = useState<Business>(initialBusiness || null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    // initialBusinessが設定されている場合はそれを優先
    if (initialBusiness !== undefined) {
      setBusiness(initialBusiness);
      return;
    }

    // pathnameから判定
    if (pathname?.includes('/services/nobilva')) {
      setBusiness('nobilva');
    } else if (pathname?.includes('/services/teachit')) {
      setBusiness('teachit');
    } else if (pathname?.match(/\/blog\/[^/]+$/)) {
      // Blog記事ページの場合、ページのデータからbusinessを読み取る
      // DOM要素が存在するまで少し待機（最大5回まで試行）
      if (typeof document !== 'undefined') {
        attemptsRef.current = 0;
        const maxAttempts = 5;
        const checkBusinessData = () => {
          const businessDataElement = document.getElementById('page-business-data');
          if (businessDataElement) {
            try {
              const businessData = JSON.parse(businessDataElement.textContent || '{}');
              if (businessData.business) {
                setBusiness(businessData.business as Business);
              } else {
                setBusiness(null);
              }
            } catch {
              setBusiness(null);
            }
          } else if (attemptsRef.current < maxAttempts) {
            // 要素がまだ存在しない場合、少し待ってから再試行
            attemptsRef.current++;
            setTimeout(checkBusinessData, 100);
          } else {
            // 最大試行回数に達した場合、nullを設定
            setBusiness(null);
          }
        };
        checkBusinessData();
      } else {
        setBusiness(null);
      }
    } else {
      setBusiness(null);
    }
  }, [pathname, initialBusiness]);

  return (
    <BusinessProvider business={business}>
      {children}
    </BusinessProvider>
  );
}
