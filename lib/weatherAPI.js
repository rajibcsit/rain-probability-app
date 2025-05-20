import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

export async function getRainProbability(lat, lon, startDate, endDate) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
      },
    });

    console.log('Full API Response:', response.data);
    
    // Convert input dates to Date objects if they aren't already
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Remove time components for date comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filteredData = response.data.list
      .map(item => {
        const date = new Date(item.dt * 1000);
        return {
          date,
          rainProb: item.pop * 100,
          original: item 
        };
      })
      .filter(item => {
        return item.date >= start && item.date <= end;
      });

    console.log('Filtered Data:', filteredData);
    
    return filteredData;
  } catch (error) {
    console.error('Error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data
    });
    throw error;
  }
}