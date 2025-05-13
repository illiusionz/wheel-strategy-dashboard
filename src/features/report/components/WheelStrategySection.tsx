import React, { useState } from 'react';

interface OptionContract {
  contract_type: string;
  strike_price: number;
  expiration_date: string;
  premium?: number;
  delta?: number;
  open_interest?: number;
  implied_volatility?: number;
}

interface WheelStrategySectionProps {
  putOptions: OptionContract[];
  callOptions: OptionContract[];
  stockPrice: number;
  isLoading: boolean;
}

const WheelStrategySection: React.FC<WheelStrategySectionProps> = ({
  putOptions,
  callOptions,
  stockPrice,
  isLoading,
}) => {
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');

  // Get unique expiration dates
  const expirationDates = [
    ...new Set([
      ...putOptions.map((o) => o.expiration_date),
      ...callOptions.map((o) => o.expiration_date),
    ]),
  ].sort();

  // Default to nearest expiry if none selected
  const activeExpiry = selectedExpiry || expirationDates[0] || '';

  // Filter options by selected expiry
  const filteredPuts = putOptions.filter(
    (o) => o.expiration_date === activeExpiry
  );
  const filteredCalls = callOptions.filter(
    (o) => o.expiration_date === activeExpiry
  );

  // Calculate days to expiry
  const daysToExpiry = activeExpiry
    ? Math.ceil(
        (new Date(activeExpiry).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  if (isLoading) {
    return (
      <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark'>
        <h2 className='text-lg font-semibold mb-4'>💼 Wheel Strategy Ladder</h2>
        <div className='flex justify-center items-center h-40'>
          <div className='animate-pulse text-gray-400'>
            Loading options data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark'>
      <h2 className='text-lg font-semibold mb-4'>💼 Wheel Strategy Ladder</h2>

      {/* Expiration date selector */}
      <div className='mb-4'>
        <label className='block text-sm mb-1'>Select Expiration:</label>
        <div className='flex flex-wrap gap-2'>
          {expirationDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedExpiry(date)}
              className={`px-3 py-1 text-xs rounded-full ${
                date === activeExpiry
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
              {new Date(date).toLocaleDateString()} (
              {Math.ceil(
                (new Date(date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
              d)
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Cash-Secured Puts */}
        <div>
          <h3 className='font-medium mb-2'>
            💰 Cash-Secured Puts (Sell) - {daysToExpiry} DTE
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='py-2 text-left'>Strike</th>
                  <th className='py-2 text-left'>Delta</th>
                  <th className='py-2 text-left'>Premium</th>
                  <th className='py-2 text-left'>ROI</th>
                </tr>
              </thead>
              <tbody>
                {filteredPuts.length > 0 ? (
                  filteredPuts
                    .filter((put) => put.strike_price < stockPrice * 1.05) // ITM + slightly OTM
                    .sort((a, b) => b.strike_price - a.strike_price) // Descending strike price
                    .slice(0, 5) // Top 5 strikes
                    .map((put, idx) => {
                      // For now using dummy values until we get real data
                      const premium =
                        put.premium ||
                        (
                          stockPrice *
                          0.03 *
                          (1 - (stockPrice - put.strike_price) / stockPrice)
                        ).toFixed(2);
                      const delta =
                        put.delta ||
                        (
                          0.5 -
                          ((stockPrice - put.strike_price) / stockPrice) * 0.5
                        ).toFixed(2);
                      const roi = ((premium / put.strike_price) * 100).toFixed(
                        2
                      );

                      return (
                        <tr
                          key={`put-${idx}`}
                          className='border-b hover:bg-gray-50 dark:hover:bg-gray-800'>
                          <td className='py-2'>${put.strike_price}</td>
                          <td className='py-2'>{delta}</td>
                          <td className='py-2'>${premium}</td>
                          <td className='py-2'>{roi}%</td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={4} className='py-4 text-center text-gray-500'>
                      No put options available for this expiration
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Covered Calls */}
        <div>
          <h3 className='font-medium mb-2'>
            🎯 Covered Calls (Sell) - {daysToExpiry} DTE
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='py-2 text-left'>Strike</th>
                  <th className='py-2 text-left'>Delta</th>
                  <th className='py-2 text-left'>Premium</th>
                  <th className='py-2 text-left'>ROI</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.length > 0 ? (
                  filteredCalls
                    .filter((call) => call.strike_price > stockPrice * 0.98) // OTM + slightly ITM
                    .sort((a, b) => a.strike_price - b.strike_price) // Ascending strike price
                    .slice(0, 5) // Top 5 strikes
                    .map((call, idx) => {
                      // For now using dummy values until we get real data
                      const premium =
                        call.premium ||
                        (
                          stockPrice *
                          0.02 *
                          (1 - (call.strike_price - stockPrice) / stockPrice)
                        ).toFixed(2);
                      const delta =
                        call.delta ||
                        (
                          0.5 -
                          ((call.strike_price - stockPrice) / stockPrice) * 0.5
                        ).toFixed(2);
                      const roi = ((premium / stockPrice) * 100).toFixed(2);

                      return (
                        <tr
                          key={`call-${idx}`}
                          className='border-b hover:bg-gray-50 dark:hover:bg-gray-800'>
                          <td className='py-2'>${call.strike_price}</td>
                          <td className='py-2'>{delta}</td>
                          <td className='py-2'>${premium}</td>
                          <td className='py-2'>{roi}%</td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={4} className='py-4 text-center text-gray-500'>
                      No call options available for this expiration
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='mt-4 text-xs text-gray-500'>
        <p>
          💡 Wheel Strategy: Sell CSPs to collect premium. If assigned, sell CCs
          above cost basis.
        </p>
      </div>
    </div>
  );
};

export default WheelStrategySection;
