import React, { useState } from 'react';
import { useStockReport } from '../../features/report/hooks/useStockReport';
import { useTechnicalIndicators } from '../../features/report/hooks/useTechnicalIndicators';
import { useOptionsChain } from '../../features/report/hooks/useOptionsChain';
import { useHistoricalData } from '../../features/report/hooks/useHistoricalData';
import TechnicalSection from '../../features/report/components/TechnicalSection';
import PriceSection from '../../features/report/components/PriceSection';
import PriceChart from '../../features/report/components/PriceChart';
import WheelStrategySection from '../../features/report/components/WheelStrategySection';
import WheelStrategyCalculator from '../../features/report/components/WheelStrategyCalculator';
import OptionsGrid from '../../features/report/components/OptionsGrid';

const popularStocks = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'TSLA',
  'META',
  'NVDA',
  'AMD',
];

const Report: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [inputSymbol, setInputSymbol] = useState('');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'options' | 'calculator'
  >('overview');

  // Data fetching hooks
  const { quote, isLoading: isLoadingQuote } = useStockReport(symbol);
  const technicalData = useTechnicalIndicators(symbol);
  const {
    putOptions,
    callOptions,
    isLoading: isLoadingOptions,
  } = useOptionsChain(symbol);
  const { historicalData, isLoading: isLoadingHistory } = useHistoricalData(
    symbol,
    365
  );

  // Handle symbol search
  const handleSymbolSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.trim().toUpperCase());
      setInputSymbol('');
    }
  };

  const stockPrice = quote?.lastTrade?.price || 0;

  return (
    <div className='space-y-6 pb-8'>
      {/* Symbol Selector */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <h1 className='text-xl font-bold text-gray-800 dark:text-white'>
          🧠 MCP Strategy Report: {symbol}
        </h1>

        <div className='flex gap-2'>
          <form onSubmit={handleSymbolSearch} className='flex'>
            <input
              type='text'
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder='Enter symbol...'
              className='w-24 px-2 py-1 border border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary'
            />
            <button
              type='submit'
              className='bg-primary text-white px-3 py-1 rounded-r-md hover:bg-primary-dark'>
              Go
            </button>
          </form>

          <div className='flex-1 flex flex-wrap gap-1'>
            {popularStocks.map((stock) => (
              <button
                key={stock}
                onClick={() => setSymbol(stock)}
                className={`px-2 py-1 text-xs rounded-md ${
                  stock === symbol
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                {stock}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='flex border-b border-gray-200 mb-6'>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('overview')}>
          Overview & Chart
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === 'options'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('options')}>
          Options Chain
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === 'calculator'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('calculator')}>
          Wheel Calculator
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Price Chart */}
          <PriceChart
            data={historicalData}
            symbol={symbol}
            isLoading={isLoadingHistory}
          />

          {/* Main content */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {isLoadingQuote ? (
              <div className='h-40 flex items-center justify-center bg-white dark:bg-boxdark rounded-xl'>
                <div className='animate-pulse'>Loading stock data...</div>
              </div>
            ) : (
              <PriceSection data={quote ?? null} />
            )}

            <TechnicalSection data={technicalData} />
          </div>

          {/* Wheel Strategy Section */}
          {quote && (
            <WheelStrategySection
              putOptions={putOptions || []}
              callOptions={callOptions || []}
              stockPrice={stockPrice}
              isLoading={isLoadingOptions}
            />
          )}
        </>
      ) : activeTab === 'options' ? (
        <>
          {/* Options Chain AG Grid */}
          <div className='grid grid-cols-1 gap-6'>
            <OptionsGrid
              options={putOptions.filter(
                (p) => p.strike_price < stockPrice * 1.1
              )}
              stockPrice={stockPrice}
              title='💰 Cash-Secured Puts'
              isLoading={isLoadingOptions}
              type='put'
            />

            <OptionsGrid
              options={callOptions.filter(
                (c) => c.strike_price > stockPrice * 0.95
              )}
              stockPrice={stockPrice}
              title='🎯 Covered Calls'
              isLoading={isLoadingOptions}
              type='call'
            />
          </div>
        </>
      ) : (
        <>
          {/* Wheel Strategy Calculator */}
          <WheelStrategyCalculator stockPrice={stockPrice} symbol={symbol} />
        </>
      )}
    </div>
  );
};

export default Report;
