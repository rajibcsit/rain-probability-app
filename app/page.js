'use client';
import LastUpdated from '@/components/LastUpdated';
import { useEffect, useState } from 'react';
import DateRangePicker from '../components/DateRangePicker';
import RainProbabilityChart from '../components/RainProbabilityChart';
import { getRainProbability } from '../lib/weatherAPI';

const DEFAULT_LOCATION = { lat: 23.8103, lon: 90.4125, name: "Dhaka" };

export default function Home() {
  const [location, setLocation] = useState(null);
  const [rainData, setRainData] = useState([]);
  const [loading, setLoading] = useState({
    location: true,
    weather: false
  });
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    setLoading(prev => ({ ...prev, location: true }));
    setError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const name = await getLocationName(position.coords.latitude, position.coords.longitude);
      
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: name || "Your Location"
      });
    } catch (err) {
      console.warn("Location detection failed:", err.message);
      setLocation(DEFAULT_LOCATION);
      setError(`Using default location (${DEFAULT_LOCATION.name}). ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, location: false }));
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  async function getLocationName(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.county;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  const handleDateRangeChange = async (startDate, endDate) => {
    if (!location) return;
    
    setLoading(prev => ({ ...prev, weather: true }));
    setError(null);
    
    try {
      const data = await getRainProbability(location.lat, location.lon, startDate, endDate);
      setRainData(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, weather: false }));
    }
  };

  const handleRefreshLocation = () => {
    fetchLocation();
    setRainData([]); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Glassmorphism Effect */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                🌧️ Rain Probability Forecast
              </h1>
              {location?.name && (
                <p className="text-indigo-600 font-medium mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {location.name}
                </p>
              )}
            </div>
            
            <button
              onClick={handleRefreshLocation}
              disabled={loading.location}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
                loading.location 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading.location ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>Refresh Location</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Picker Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Select Date Range
            </h2>
            <DateRangePicker onDateRangeChange={handleDateRangeChange} />
          </div>

          {/* Chart Card - Takes 2/3 width on desktop */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 lg:col-span-2">
            {loading.location ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Detecting your location...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rain Probability
                  </h2>
                  {rainData.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {rainData.length} data points
                    </span>
                  )}
                </div>

                {loading.weather ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600">Loading weather data...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <RainProbabilityChart data={rainData} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <LastUpdated/>
      </div>
    </div>
  );
}