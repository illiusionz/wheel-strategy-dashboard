import React from 'react';
import { StockQuote } from '../../../services/polygon';

interface PriceSectionProps {
  data: StockQuote | null;
}

const PriceSection: React.FC<PriceSectionProps> = ({ data }) => {
  if (!data) return null;

  const { lastTrade, day, prevDay, todaysChangePerc } = data;
  const yearLow = prevDay.l - prevDay.l * 0.2; // For demo - normally would fetch 52w data
  const yearHigh = prevDay.h + prevDay.h * 0.1; // For demo - normally would fetch 52w data

  return (
    <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark'>
      <h2 className='text-lg font-semibold mb-4'>🟢 Stock Overview</h2>
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          💲 <strong>Price:</strong> ${lastTrade.price.toFixed(2)}
        </div>
        <div>
          📉 <strong>52W Range:</strong> ${yearLow.toFixed(2)} – $
          {yearHigh.toFixed(2)}
        </div>
        <div>
          🔁 <strong>Today's %:</strong>{' '}
          <span
            className={todaysChangePerc >= 0 ? 'text-success' : 'text-danger'}>
            {todaysChangePerc >= 0 ? '+' : ''}
            {todaysChangePerc.toFixed(2)}%
          </span>
        </div>
        <div>
          🧮 <strong>Volume:</strong> {(day.volume / 1000000).toFixed(1)}M / Avg{' '}
          {(prevDay.v / 1000000).toFixed(1)}M
        </div>
      </div>
    </div>
  );
};

export default PriceSection;
