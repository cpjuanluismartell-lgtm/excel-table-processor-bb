
import React, { useState, useCallback, useEffect } from 'react';
import { ProcessedTransaction, RawTransaction } from './types';
import DataTable from './components/DataTable';
import InstructionBox from './components/InstructionBox';
import ScrollButtons from './components/ScrollButtons';

const App: React.FC = () => {
  const [data, setData] = useState<ProcessedTransaction[]>([]);
  const [finalBalance, setFinalBalance] = useState<number | null>(null);

  const parseCurrency = (value: string): number => {
    if (!value || typeof value !== 'string') return 0;
    const cleanedValue = value.replace(/[$,]/g, '').trim();
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? 0 : number;
  };

  const processPastedText = useCallback((pastedText: string | undefined) => {
    if (!pastedText) return;

    try {
      const rows = pastedText.trim().split('\n');
      if (rows.length < 2) {
        console.warn("Pasted data has less than 2 rows.");
        return;
      }
      
      // Extract final balance from the first data row
      const firstDataRowCols = rows[1].split('\t');
      if (firstDataRowCols.length >= 8) {
        const finalBalanceStr = firstDataRowCols[7];
        setFinalBalance(parseCurrency(finalBalanceStr));
      } else {
        setFinalBalance(null);
      }

      const rawTransactions: RawTransaction[] = rows
        .slice(1) // Skip header row
        .map(row => {
          const columns = row.split('\t');
          if (columns.length < 8) return null;
          return {
            id: columns[0]?.trim() || '',
            fechaMovimiento: columns[1]?.trim() || '',
            hora: columns[2]?.trim() || '',
            recibo: columns[3]?.trim() || '',
            descripcion: columns[4]?.trim() || '',
            cargos: columns[5]?.trim() || '',
            abonos: columns[6]?.trim() || '',
            saldo: columns[7]?.trim() || '',
          };
        })
        .filter((item): item is RawTransaction => item !== null && item.id !== '');

      const processedTransactions: ProcessedTransaction[] = rawTransactions
        .map(raw => {
          const cargosValue = parseCurrency(raw.cargos);
          const abonosValue = parseCurrency(raw.abonos);
          const importe = abonosValue - cargosValue;

          return {
            id: parseInt(raw.id, 10),
            fechaMovimiento: raw.fechaMovimiento,
            descripcion: raw.descripcion,
            importe: importe,
          };
        })
        .filter(item => !isNaN(item.id));
      
      processedTransactions.sort((a, b) => b.id - a.id);

      setData(processedTransactions);
    } catch (error) {
      console.error("Failed to process pasted data:", error);
      alert("There was an error processing the pasted data. Please ensure it's in the correct table format.");
    }
  }, []);


  const handlePaste = useCallback((event: ClipboardEvent) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain');
    processPastedText(pastedText);
  }, [processPastedText]);

  const handlePasteButtonClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      processPastedText(text);
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert('No se pudo leer del portapapeles. Por favor, asegúrese de haber otorgado los permisos necesarios al navegador.');
    }
  };
  

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);
  
  const handleClear = () => {
    setData([]);
    setFinalBalance(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Procesador de Tablas</h1>
          <p className="mt-2 text-lg text-gray-600">Pega los datos de tu tabla para transformarlos instantáneamente.</p>
        </header>
        <main>
          {data.length > 0 ? (
            <DataTable data={data} onClear={handleClear} finalBalance={finalBalance} />
          ) : (
            <InstructionBox onPasteClick={handlePasteButtonClick} />
          )}
        </main>
      </div>
      <ScrollButtons />
    </div>
  );
};

export default App;