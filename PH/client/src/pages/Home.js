import React, { useRef } from 'react';
import { UserPlus, ShoppingCart } from 'lucide-react';
import SellerRegistration from './SellerRegistration';
import BuyerRegistration from './BuyerRegistration';

// Home: Seller Registration and Buyer Registration on one page, with shortcuts to jump between them
export default function Home() {
  const sellerRef = useRef(null);
  const buyerRef  = useRef(null);

  const jump = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div>
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => jump(sellerRef)}>
          <UserPlus size={16} /> Seller Registration
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => jump(buyerRef)}>
          <ShoppingCart size={16} /> Buyer Registration
        </button>
      </div>

      <section ref={sellerRef} style={{ scrollMarginTop:16 }}>
        <SellerRegistration />
      </section>

      <div style={{ borderTop:'1px solid var(--border)', margin:'36px 0' }} />

      <section ref={buyerRef} style={{ scrollMarginTop:16 }}>
        <BuyerRegistration />
      </section>
    </div>
  );
}
