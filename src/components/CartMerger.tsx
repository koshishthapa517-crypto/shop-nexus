'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { guestCartService } from '@/core/lib/guestCart';

export default function CartMerger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const mergeGuestCart = async () => {
      // Only merge when user just logged in
      if (status !== 'authenticated' || !session) return;

      const guestCart = guestCartService.getCart();
      
      // No guest cart items to merge
      if (guestCart.length === 0) return;

      try {
        console.log('Merging guest cart with', guestCart.length, 'items...');
        const res = await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: guestCart }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Guest cart merged successfully:', data);
          
          // Clear guest cart after successful merge
          guestCartService.clearCart();
          
          // Trigger cart update event so navigation badge updates
          window.dispatchEvent(new Event('cartUpdated'));
        } else {
          console.error('Failed to merge cart:', await res.text());
        }
      } catch (error) {
        console.error('Failed to merge guest cart:', error);
      }
    };

    mergeGuestCart();
  }, [session, status]);

  return null; // This component doesn't render anything
}
