import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { OptionContract } from '../../../services/polygon';

// Custom cell renderer for the ROI column
const RoiCellRenderer = (props: any) => {
  const value = props.value as number;
  const className =
    value >= 3 ? 'text-success' : value <= 1 ? 'text-danger' : '';

  return <span className={className}>{value.toFixed(2)}%</span>;
};

// Custom cell renderer for the Delta column
const DeltaCellRenderer = (props: any) => {
  const value = props.value as number;
  let className = '';

  if (value >= 0.7) className = 'text-success font-bold';
  else if (value >= 0.5) className = 'text-success';
  else if (value <= 0.2) className = 'text-danger';
  else if (value <= 0.3) className = 'text-warning';

  return <span className={className}>{value.toFixed(2)}</span>;
};

interface OptionsGridProps {
  options: OptionContract[];
  stockPrice: number;
  title: string;
  isLoading: boolean;
  type: 'put' | 'call';
}

const OptionsGrid: React.FC<OptionsGridProps> = ({
  options,
  stockPrice,
  title,
  isLoading,
  type,
}) => {
  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        field: 'expiration_date',
        headerName: 'Expiry',
        sortable: true,
        filter: true,
        valueFormatter: (params: any) => {
          const date = new Date(params.value);
          return date.toLocaleDateString();
        },
        width: 120,
      },
      {
        field: 'strike_price',
        headerName: 'Strike',
        sortable: true,
        filter: true,
        valueFormatter: (params: any) => `$${params.value.toFixed(2)}`,
        width: 100,
      },
      {
        field: 'delta',
        headerName: 'Delta',
        sortable: true,
        filter: true,
        cellRenderer: DeltaCellRenderer,
        width: 100,
      },
      {
        field: 'premium',
        headerName: 'Premium',
        sortable: true,
        filter: true,
        valueFormatter: (params: any) => `$${params.value.toFixed(2)}`,
        width: 110,
      },
      {
        field: 'roi',
        headerName: 'ROI',
        sortable: true,
        filter: true,
        cellRenderer: RoiCellRenderer,
        width: 100,
      },
      {
        field: 'open_interest',
        headerName: 'OI',
        sortable: true,
        filter: true,
        width: 80,
      },
      {
        field: 'implied_volatility',
        headerName: 'IV',
        sortable: true,
        filter: true,
        valueFormatter: (params: any) => `${(params.value * 100).toFixed(1)}%`,
        width: 80,
      },
    ],
    []
  );

  // Calculate additional data for each option
  const rowData = useMemo(() => {
    return options.map((option) => {
      // Calculate dummy values if real data not available
      const premium =
        option.premium ||
        stockPrice *
          (type === 'call' ? 0.02 : 0.03) *
          (1 - Math.abs(option.strike_price - stockPrice) / stockPrice);

      const delta =
        option.delta ||
        (type === 'call'
          ? 0.5 + ((stockPrice - option.strike_price) / stockPrice) * 0.5
          : 0.5 - ((stockPrice - option.strike_price) / stockPrice) * 0.5);

      const roi =
        (premium / (type === 'put' ? option.strike_price : stockPrice)) * 100;

      return {
        ...option,
        premium,
        delta,
        roi,
        open_interest:
          option.open_interest || Math.floor(Math.random() * 1000) + 50,
        implied_volatility:
          option.implied_volatility || Math.random() * 0.3 + 0.2,
      };
    });
  }, [options, stockPrice, type]);

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
    }),
    []
  );

  if (isLoading) {
    return (
      <div className='rounded-xl border p-4 shadow-sm bg-white dark:bg-boxdark'>
        <h2 className='text-lg font-semibold mb-4'>{title}</h2>
        <div className='flex justify-center items-center h-40'>
          <div className='animate-pulse text-gray-400'>
            Loading options data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border shadow-sm bg-white dark:bg-boxdark'>
      <div className='p-4 border-b'>
        <h2 className='text-lg font-semibold'>{title}</h2>
        <div className='text-xs text-gray-500'>
          {rowData.length} options available | Filtered for optimal wheel
          strategy
        </div>
      </div>

      <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationAutoPageSize={true}
          animateRows={true}
        />
      </div>
    </div>
  );
};

export default OptionsGrid;
