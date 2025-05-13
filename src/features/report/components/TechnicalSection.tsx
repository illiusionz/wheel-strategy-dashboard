import React from 'react';
import { useTechnicalIndicators } from '../hooks/useTechnicalIndicators';

// Define the return type directly
type TechnicalData = ReturnType<typeof useTechnicalIndicators>;

interface TechnicalSectionProps {
  data: TechnicalData;
}

const TechnicalSection: React.FC<TechnicalSectionProps> = ({ data }) => {
  return (
    <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark'>
      <h2 className='text-lg font-semibold mb-4'>📊 Technical Snapshot</h2>
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          📈 <strong>RSI:</strong> {data.rsi}
        </div>
        <div>
          📉 <strong>MACD:</strong> {data.macd.value} (Signal:{' '}
          {data.macd.signal})
        </div>
        <div>
          📏 <strong>Bollinger Bands:</strong> {data.bollinger.lower} –{' '}
          {data.bollinger.upper}
        </div>
      </div>
      <div className='mt-4'>
        <h3 className='font-medium mb-2'>🧱 Support & Resistance 🔻🔺</h3>
        <table className='table-auto text-sm w-full'>
          <thead>
            <tr className='border-b text-left'>
              <th className='py-1'>Type</th>
              <th className='py-1'>Price</th>
              <th className='py-1'>Note</th>
            </tr>
          </thead>
          <tbody>
            {data.supportLevels.map((s, i) => (
              <tr key={`s-${i}`}>
                <td className='py-1'>Support</td>
                <td className='py-1'>${s.level}</td>
                <td className='py-1'>{s.note}</td>
              </tr>
            ))}
            {data.resistanceLevels.map((r, i) => (
              <tr key={`r-${i}`}>
                <td className='py-1'>Resistance</td>
                <td className='py-1'>${r.level}</td>
                <td className='py-1'>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicalSection;
