
import React from 'react';
import ClipboardIcon from './icons/ClipboardIcon';

interface InstructionBoxProps {
  onPasteClick: () => void;
}

const InstructionBox: React.FC<InstructionBoxProps> = ({ onPasteClick }) => {
  return (
    <div className="mt-12 flex justify-center">
      <div className="relative block w-full max-w-4xl rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <ClipboardIcon className="mx-auto h-12 w-12 text-gray-400" />
        <span className="mt-4 block text-lg font-semibold text-gray-900">
          Listo para procesar tus datos
        </span>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={onPasteClick}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            <ClipboardIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Pegar desde el Portapapeles
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          O simplemente usa <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd> + <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">V</kbd> en cualquier lugar de la página.
        </p>
      </div>
    </div>
  );
};

export default InstructionBox;
