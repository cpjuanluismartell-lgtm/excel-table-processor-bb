import React, { useState, useMemo } from 'react';
import { ProcessedTransaction } from '../types';

interface DataTableProps {
  data: ProcessedTransaction[];
  onClear: () => void;
  finalBalance: number | null;
}

const monthMap: { [key: string]: string } = {
  'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
  'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
};

const toYYYYMMDD = (dateString: string): string | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const monthStr = parts[1].toLowerCase().substring(0, 3);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(year) || !(monthStr in monthMap)) {
    return null;
  }
  
  const month = monthMap[monthStr];
  const formattedDay = day.toString().padStart(2, '0');
  
  return `${year}-${month}-${formattedDay}`;
};

const DataTable: React.FC<DataTableProps> = ({ data, onClear, finalBalance }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [hideZeroImports, setHideZeroImports] = useState(true);
  const [invertImports, setInvertImports] = useState(false);
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [idFilter, setIdFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  const [minAmountFilter, setMinAmountFilter] = useState<string>('');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');

  const filteredData = useMemo(() => {
    const startNum = rangeStart === '' ? -Infinity : parseInt(rangeStart, 10);
    const endNum = rangeEnd === '' ? Infinity : parseInt(rangeEnd, 10);

    const validStart = isNaN(startNum) ? -Infinity : startNum;
    const validEnd = isNaN(endNum) ? Infinity : endNum;

    const minAmount = minAmountFilter === '' ? -Infinity : parseFloat(minAmountFilter);
    const maxAmount = maxAmountFilter === '' ? Infinity : parseFloat(maxAmountFilter);
    const validMinAmount = isNaN(minAmount) ? -Infinity : minAmount;
    const validMaxAmount = isNaN(maxAmount) ? Infinity : maxAmount;

    const idFilterNumbers = idFilter
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    return data
      .map(row => ({
        ...row,
        importe: invertImports ? row.importe * -1 : row.importe
      }))
      .filter(row => {
        const meetsZeroFilter = !hideZeroImports || row.importe !== 0;
        const meetsRangeFilter = row.id >= validStart && row.id <= validEnd;
        const meetsIdFilter = idFilterNumbers.length === 0 || idFilterNumbers.includes(row.id);
        const meetsDateFilter = dateFilter === '' || toYYYYMMDD(row.fechaMovimiento) === dateFilter;
        const meetsDescriptionFilter = descriptionFilter === '' || row.descripcion.toLowerCase().includes(descriptionFilter.toLowerCase());
        const meetsAmountFilter = row.importe >= validMinAmount && row.importe <= validMaxAmount;

        return meetsZeroFilter && meetsRangeFilter && meetsIdFilter && meetsDateFilter && meetsDescriptionFilter && meetsAmountFilter;
    });
  }, [data, hideZeroImports, rangeStart, rangeEnd, invertImports, idFilter, dateFilter, descriptionFilter, minAmountFilter, maxAmountFilter]);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const handleCopy = (includeHeaders: boolean) => {
    let textToCopy = '';

    if (includeHeaders) {
      const headers = ['#', 'Fecha Movimiento', 'Descripción', 'Importe'];
      textToCopy += headers.join('\t') + '\n';
    }

    const rowsAsText = filteredData.map(row => {
      const importeAsString = row.importe.toFixed(2);
      const cells = includeHeaders
        ? [row.id, row.fechaMovimiento, row.descripcion, importeAsString]
        : [row.fechaMovimiento, row.descripcion, importeAsString];
      
      // Reverted to previous behavior without sanitizing cell content
      return cells.join('\t');
    });

    textToCopy += rowsAsText.join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      const buttonType = includeHeaders ? 'all' : 'data';
      setCopied(buttonType);
      setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('No se pudo copiar el texto al portapapeles.');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6 flex flex-wrap justify-between items-center border-b border-gray-200 gap-4">
        <div className="flex items-center gap-x-6 gap-y-4 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-800">Datos Procesados</h2>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="hide-zero"
                    checked={hideZeroImports}
                    onChange={() => setHideZeroImports(!hideZeroImports)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="hide-zero" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                    Ocultar importes en $0.00
                </label>
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="invert-imports"
                    checked={invertImports}
                    onChange={() => setInvertImports(!invertImports)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="invert-imports" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                    Invertir importes
                </label>
            </div>
            <div className="flex items-center">
              <label htmlFor="range-start" className="mr-2 block text-sm font-medium text-gray-700 whitespace-nowrap">
                Rango #:
              </label>
              <input
                type="number"
                id="range-start"
                min="0"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-24 rounded-md border-gray-300 bg-violet-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Desde"
                aria-label="Rango de inicio"
              />
              <span className="mx-2 text-gray-500">-</span>
              <input
                type="number"
                id="range-end"
                min="0"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-24 rounded-md border-gray-300 bg-violet-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Hasta"
                aria-label="Rango de fin"
              />
            </div>
            {finalBalance !== null && (
              <div className="flex items-center border-l-2 border-gray-200 pl-4 ml-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Saldo Final:
                </span>
                <span className="ml-2 font-semibold text-gray-900 font-mono text-base">
                  {formatCurrency(finalBalance)}
                </span>
              </div>
            )}
        </div>
        <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
            <button
              onClick={() => handleCopy(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-32"
            >
              {copied === 'all' ? '¡Copiado!' : 'Copiar Todo'}
            </button>
            <button
              onClick={() => handleCopy(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-32"
            >
               {copied === 'data' ? '¡Copiado!' : 'Copiar Datos'}
            </button>
            <button
              onClick={onClear}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Limpiar Datos
            </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {filteredData.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-violet-50 sticky top-0">
                <tr>
                    <th scope="col" className="px-6 py-3 w-16 text-center">#</th>
                    <th scope="col" className="px-6 py-3">Fecha Movimiento</th>
                    <th scope="col" className="px-6 py-3">Descripción</th>
                    <th scope="col" className="px-6 py-3 text-right">Importe</th>
                </tr>
                <tr className="border-t border-gray-200">
                    <td className="px-2 py-2">
                        <input
                            type="text"
                            placeholder="Filtrar..."
                            value={idFilter}
                            onChange={(e) => setIdFilter(e.target.value)}
                            className="w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                            aria-label="Filtrar por #"
                        />
                    </td>
                    <td className="px-2 py-2">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                            aria-label="Filtrar por fecha"
                        />
                    </td>
                    <td className="px-2 py-2">
                        <input
                            type="text"
                            placeholder="Filtrar..."
                            value={descriptionFilter}
                            onChange={(e) => setDescriptionFilter(e.target.value)}
                            className="w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                            aria-label="Filtrar por descripción"
                        />
                    </td>
                    <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Mín"
                                value={minAmountFilter}
                                onChange={(e) => setMinAmountFilter(e.target.value)}
                                className="w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                                aria-label="Filtrar por importe mínimo"
                            />
                            <input
                                type="number"
                                placeholder="Máx"
                                value={maxAmountFilter}
                                onChange={(e) => setMaxAmountFilter(e.target.value)}
                                className="w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                                aria-label="Filtrar por importe máximo"
                            />
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
                {filteredData.map((row, index) => (
                <tr key={row.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <td className="px-6 py-4 font-medium text-gray-900 text-center">{row.id}</td>
                    <td className="px-6 py-4">{row.fechaMovimiento}</td>
                    <td className="px-6 py-4 max-w-lg break-words" title={row.descripcion}>{row.descripcion}</td>
                    <td className={`px-6 py-4 text-right font-mono ${row.importe >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(row.importe)}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        ) : (
            <div className="p-12 text-center text-gray-500">
                <p className="font-semibold">No hay registros para mostrar</p>
                {data.length > 0 && <p className="mt-1 text-sm">Todos los registros están ocultos por los filtros activos. Ajústalos para ver los datos.</p>}
            </div>
        )}
      </div>
      {data.length > 0 && (
         <div className="p-4 bg-gray-50 text-right text-sm text-gray-500">
          Mostrando {filteredData.length} de {data.length} registros.
        </div>
      )}
    </div>
  );
};

export default DataTable;