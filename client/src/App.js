import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
});

function App() {
  const [message, setMessage] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [zipcodes, setZipcodes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch welcome message
    const fetchData = async () => {
      try {
        const { data } = await api.get('/');
        setMessage(data.message);
      } catch (err) {
        console.error('Error fetching message:', err);
      }
    };

    fetchData();
    fetchZipcodes();
  }, []);

  const fetchZipcodes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/zipcodes');
      setZipcodes(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch zipcodes');
      console.error('Error fetching zipcodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic zipcode validation
    if (!/^\d{5}(-\d{4})?$/.test(zipcode)) {
      setError('Please enter a valid zipcode (12345 or 12345-6789)');
      return;
    }

    try {
      setLoading(true);
      await api.post('/zipcodes', { zipcode });
      
      // Clear input and error
      setZipcode('');
      setError('');
      
      // Refresh zipcode list
      await fetchZipcodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save zipcode');
      console.error('Error saving zipcode:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>MERN Stack App</h1>
      <p>{message}</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="zipcode">Enter Zipcode: </label>
          <input
            type="text"
            id="zipcode"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            placeholder="Enter zipcode"
            disabled={loading}
            style={{ margin: '0 10px' }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <div>
        <h2>Saved Zipcodes:</h2>
        {loading && <p>Loading...</p>}
        {zipcodes.length === 0 && !loading ? (
          <p>No zipcodes saved yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {zipcodes.map((zip) => (
              <li key={zip._id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ddd' }}>
                {zip.zipcode} - {new Date(zip.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
