// TestBE1.jsx - Copy to App.jsx or test
import { useEffect, useState } from 'react';

export default function TestBE1() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/recommendations/generate')
      .then(r => r.json())
      .then(setData);
  }, []);
  
  return (
    <div style={{padding: '20px'}}>
      <h1>BE-1 Integration Test</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : 'Loading BE-1 data...'}
    </div>
  );
}
