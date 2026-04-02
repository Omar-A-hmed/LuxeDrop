import React from 'react';

const Ticker = () => {
  const messages = [
    "New Arrivals: The Spring Collection is here",
    "Exclusive Deals: Up to 30% off select items",
    "Luxury Redefined: Experience premium quality",
    "Join our loyalty program for special perks"
  ];

  const tickerContent = (
    <div className="flex items-center gap-12 whitespace-nowrap">
      {messages.map((msg, idx) => (
        <React.Fragment key={idx}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-dark">
            {msg}
          </span>
          <span className="w-1 h-1 bg-brand-dark/20 rounded-full" />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-brand-gold border-y border-brand-gold/10 py-3 overflow-hidden relative z-10">
      <div className="flex animate-marquee w-fit">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
};

export default Ticker;
