import { useState, useEffect, useRef } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing timeout to restart the debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only update if value has changed from current debounced value
    if (JSON.stringify(value) !== JSON.stringify(debouncedValue)) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]); // Remove debouncedValue from dependencies

  return debouncedValue;
}

export default useDebounce;