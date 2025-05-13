import React, { useState, useEffect } from 'react';

interface CalculatorProps {
  stockPrice: number;
  symbol: string;
}

const WheelStrategyCalculator: React.FC<CalculatorProps> = ({
  stockPrice,
  symbol,
}) => {
  // State for calculator inputs
  const [shares, setShares] = useState(100);
  const [putStrike, setPutStrike] = useState(Math.floor(stockPrice * 0.95));
  const [putPremium, setPutPremium] = useState(Math.floor(stockPrice * 0.03));
  const [callStrike, setCallStrike] = useState(Math.floor(stockPrice * 1.05));
  const [callPremium, setCallPremium] = useState(Math.floor(stockPrice * 0.02));
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [assignmentProb, setAssignmentProb] = useState(30);
  const [callAssignmentProb, setCallAssignmentProb] = useState(30);

  // Results
  const [annualReturn, setAnnualReturn] = useState(0);
  const [downside, setDownside] = useState(0);
  const [maxProfit, setMaxProfit] = useState(0);

  // Update calculations when inputs change
  useEffect(() => {
    // Calculate capital required (cash secured put)
    const capital = (putStrike * 100 * shares) / 100;

    // Calculate premium income
    const putIncome = putPremium * shares;
    const callIncome = callPremium * shares;

    // Calculate probability-weighted returns
    const probPutAssigned = assignmentProb / 100;
    const probCallAssigned = callAssignmentProb / 100;

    // Calculate average premium per cycle
    const avgPremiumPerCycle = putIncome + probPutAssigned * callIncome;

    // Annual return estimation
    const annualPremium = avgPremiumPerCycle * (weeksPerYear / 6); // Assuming 6 weeks per cycle
    const annualReturnPct = (annualPremium / capital) * 100;

    // Max profit calculation
    const maxProfitAmount =
      (callStrike - putStrike) * shares + putIncome + callIncome;
    const maxProfitPct = (maxProfitAmount / capital) * 100;

    // Downside protection
    const downsideProtection = (putPremium / putStrike) * 100;

    setAnnualReturn(annualReturnPct);
    setMaxProfit(maxProfitPct);
    setDownside(downsideProtection);
  }, [
    shares,
    putStrike,
    putPremium,
    callStrike,
    callPremium,
    weeksPerYear,
    assignmentProb,
    callAssignmentProb,
    stockPrice,
  ]);

  return (
    <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark'>
      <h2 className='text-lg font-semibold mb-4'>
        🧮 Wheel Strategy Calculator
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Input Section */}
        <div className='space-y-4'>
          <h3 className='font-medium text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Inputs
          </h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Stock Price (${symbol})
              </label>
              <input
                type='number'
                value={stockPrice.toFixed(2)}
                disabled
                className='w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                Number of Shares
              </label>
              <input
                type='number'
                value={shares}
                onChange={(e) => setShares(parseInt(e.target.value) || 100)}
                className='w-full px-3 py-2 border rounded-lg'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  CSP Strike
                </label>
                <input
                  type='number'
                  value={putStrike}
                  onChange={(e) => setPutStrike(parseInt(e.target.value) || 0)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  CSP Premium
                </label>
                <input
                  type='number'
                  value={putPremium}
                  onChange={(e) => setPutPremium(parseInt(e.target.value) || 0)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  CC Strike
                </label>
                <input
                  type='number'
                  value={callStrike}
                  onChange={(e) => setCallStrike(parseInt(e.target.value) || 0)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  CC Premium
                </label>
                <input
                  type='number'
                  value={callPremium}
                  onChange={(e) =>
                    setCallPremium(parseInt(e.target.value) || 0)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Trades/Year
                </label>
                <input
                  type='number'
                  value={weeksPerYear}
                  onChange={(e) =>
                    setWeeksPerYear(parseInt(e.target.value) || 0)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Put Assign %
                </label>
                <input
                  type='number'
                  value={assignmentProb}
                  onChange={(e) =>
                    setAssignmentProb(parseInt(e.target.value) || 0)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Call Assign %
                </label>
                <input
                  type='number'
                  value={callAssignmentProb}
                  onChange={(e) =>
                    setCallAssignmentProb(parseInt(e.target.value) || 0)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className='space-y-6'>
          <h3 className='font-medium text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Results
          </h3>

          <div className='grid grid-cols-1 gap-4'>
            <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Est. Annual Return
              </span>
              <div className='text-3xl font-bold text-success'>
                {annualReturn.toFixed(2)}%
              </div>
              <div className='text-xs text-gray-500 mt-1'>
                Based on {weeksPerYear} trades per year
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Max Profit
                </span>
                <div className='text-2xl font-bold text-success'>
                  {maxProfit.toFixed(2)}%
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  If called away at ${callStrike}
                </div>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Downside Protection
                </span>
                <div className='text-2xl font-bold text-primary'>
                  {downside.toFixed(2)}%
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  Break-even at ${(putStrike - putPremium).toFixed(2)}
                </div>
              </div>
            </div>

            <div className='p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
              <h4 className='font-medium mb-2'>Capital Requirements</h4>
              <div className='flex justify-between text-sm'>
                <span>Cash Secured Put:</span>
                <span className='font-semibold'>
                  ${(putStrike * shares).toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between text-sm mt-1'>
                <span>Stock Purchase (if assigned):</span>
                <span className='font-semibold'>
                  ${(putStrike * shares).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 text-xs text-gray-500 border-t pt-4'>
        <p className='mb-1'>
          💡 <strong>Wheel Strategy:</strong> Sell cash-secured puts to collect
          premium. If assigned, sell covered calls above cost basis.
        </p>
        <p>
          ⚠️ <strong>Disclaimer:</strong> This calculator provides estimates
          only. Actual results may vary based on market conditions and other
          factors.
        </p>
      </div>
    </div>
  );
};

export default WheelStrategyCalculator;
