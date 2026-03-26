import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRecommendations, markRecommendationAsRead } from '../services/recommendations';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export default function useRecommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cacheRef = useRef({ timestamp: null, data: null });

  const fetchData = useCallback(async (force = false, page = 1) => {
    const now = Date.now();
    const isStale = !cacheRef.current.timestamp || (now - cacheRef.current.timestamp > STALE_TIME);

    if (!force && !isStale && cacheRef.current.data) {
      setData(cacheRef.current.data);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [res] = await Promise.all([
        fetchRecommendations({ offset: (page - 1) * 10, limit: 10 }),
        new Promise(resolve => setTimeout(resolve, 200))
      ]);
      // Depending on API response shape: {"items": [...]} or just array
      const fetchedData = res; 
      
      cacheRef.current = { timestamp: now, data: fetchedData };
      setData(fetchedData);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleReadOptimistic = async (id, currentIsRead) => {
    if (currentIsRead) return;

    // Snapshot
    const currentData = cacheRef.current.data;
    const previousData = Array.isArray(currentData) 
      ? [...currentData] 
      : (currentData ? { ...currentData } : null);
    
    // Normalize data structure handling
    let newItems = [];
    let isArray = false;
    
    if (Array.isArray(data)) {
      isArray = true;
      newItems = data.map(item => item.id === id ? { ...item, is_read: true } : item);
    } else if (data?.items) {
      newItems = data.items.map(item => item.id === id ? { ...item, is_read: true } : item);
    } else {
      newItems = (data || []).map(item => item.id === id ? { ...item, is_read: true } : item);
      isArray = true;
    }

    const newData = isArray ? newItems : { ...data, items: newItems };
    
    setData(newData);
    cacheRef.current.data = newData;

    try {
      await markRecommendationAsRead(id);
    } catch (err) {
      // Rollback
      setData(previousData);
      cacheRef.current.data = previousData;
      throw err; // So UI can show a toast
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(true), 
    toggleReadOptimistic 
  };
}
