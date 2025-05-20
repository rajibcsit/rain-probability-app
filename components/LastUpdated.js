'use client';
import { useEffect, useState } from 'react';

export default function LastUpdated() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This will only run on the client side
    setLastUpdated(new Date().toLocaleString());
  }, []);

  return (
    <footer className="mt-8 text-center text-gray-500 text-sm">
      <p>Data provided by OpenWeatherMap • Last updated: {lastUpdated || 'Loading...'}</p>
    </footer>
  );
}