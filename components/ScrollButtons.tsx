
import React, { useState, useEffect } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

const ScrollButtons: React.FC = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);

  const checkScrollPosition = () => {
    const scrollThreshold = 300;
    const bottomThreshold = 100;

    // Show "Scroll to Top" button if scrolled down past the threshold
    if (window.scrollY > scrollThreshold) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }

    // Show "Scroll to Bottom" button if not near the bottom
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - bottomThreshold) {
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  };
  
  useEffect(() => {
    window.addEventListener('scroll', checkScrollPosition);
    // Initial check in case the page loads scrolled
    checkScrollPosition();
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);
  
  // Re-check when the content changes size (e.g., data table appears)
  useEffect(() => {
      const observer = new MutationObserver(checkScrollPosition);
      observer.observe(document.body, { childList: true, subtree: true });
      // Initial check after mount
      checkScrollPosition();
      return () => observer.disconnect();
  }, []);


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {showScrollToBottom && (
            <button
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-110"
            >
                <ArrowDownIcon className="h-6 w-6" />
            </button>
        )}
        {showScrollToTop && (
            <button
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className="bg-violet-600 text-white rounded-full p-3 shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ease-in-out transform hover:scale-110"
            >
                <ArrowUpIcon className="h-6 w-6" />
            </button>
      )}
    </div>
  );
};

export default ScrollButtons;
