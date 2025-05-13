import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineStyle,
} from 'lightweight-charts';
import { HistoricalBar } from '../../../services/polygon';

interface PriceChartProps {
  data: HistoricalBar[];
  symbol: string;
  isLoading: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, symbol, isLoading }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Create and configure the chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    // Create new chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: '#d6dcde',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Add moving averages
    const smaSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      title: 'SMA (20)',
    });

    chart.timeScale().fitContent();

    // Save refs for later updates
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update chart data when data changes
  useEffect(() => {
    if (
      !chartRef.current ||
      !candlestickSeriesRef.current ||
      !volumeSeriesRef.current ||
      !data.length
    )
      return;

    // Transform data for candlestick chart
    const candlestickData = data.map((bar) => ({
      time: bar.t / 1000, // Convert from milliseconds to seconds
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
    }));

    // Transform data for volume chart
    const volumeData = data.map((bar) => ({
      time: bar.t / 1000, // Convert from milliseconds to seconds
      value: bar.v,
      color: bar.c >= bar.o ? '#26a69a' : '#ef5350',
    }));

    // Calculate SMA
    const smaPeriod = 20;
    const smaData = [];

    for (let i = 0; i < candlestickData.length; i++) {
      if (i >= smaPeriod - 1) {
        let sum = 0;
        for (let j = 0; j < smaPeriod; j++) {
          sum += candlestickData[i - j].close;
        }
        smaData.push({
          time: candlestickData[i].time,
          value: sum / smaPeriod,
        });
      }
    }

    // Update chart data
    candlestickSeriesRef.current.setData(candlestickData);
    volumeSeriesRef.current.setData(volumeData);

    // Update SMA
    if (chartRef.current) {
      const existingSma = chartRef.current
        .getSeries()
        .find((s) => s.options().title === 'SMA (20)');
      if (existingSma) {
        (existingSma as ISeriesApi<'Line'>).setData(smaData);
      }
    }

    // Focus chart on most recent data
    chartRef.current.timeScale().fitContent();
  }, [data]);

  if (isLoading) {
    return (
      <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark h-[500px] flex items-center justify-center'>
        <div className='animate-pulse text-gray-400'>Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark h-[500px] flex items-center justify-center'>
        <div className='text-gray-500'>
          No historical data available for {symbol}
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border shadow-sm bg-white dark:bg-boxdark'>
      <div className='p-4 border-b'>
        <h2 className='text-lg font-semibold'>📈 Price Chart: {symbol}</h2>
        <div className='text-xs text-gray-500'>
          {data.length} days of historical data | Last updated:{' '}
          {new Date().toLocaleString()}
        </div>
      </div>
      <div ref={chartContainerRef} className='w-full' />
    </div>
  );
};

export default PriceChart;
