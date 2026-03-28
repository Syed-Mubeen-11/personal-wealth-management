import React, { useState, useEffect } from "react";
import axios from "axios";

function StockSearch({ onSelect, onChange, assetType }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (onChange) onChange(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }


    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8000/stocks/search?keyword=${query}&asset_type=${assetType || ""}`
        );
        setResults(res.data || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query, assetType]);

  const handleSelect = async (stock) => {
    try {
      const priceRes = await axios.get(
        `http://localhost:8000/stocks/price/${stock.symbol}`
      );
      onSelect({
        symbol: stock.symbol,
        price: priceRes.data.price
      });
      setQuery(`${stock.name} (${stock.symbol})`);
      setResults([]);
    } catch (err) {
      console.error("Price fetch error", err);
    }
  };

  return (
    <div className="relative w-full">
      <input
        placeholder="Search stock..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {loading && <div className="absolute top-10 left-0 w-full p-2 bg-white border z-10">Loading...</div>}

      {results.length > 0 && (
        <ul className="absolute top-10 left-0 w-full bg-white border shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.map((res, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(res)}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
            >
              <div className="flex justify-between">
                <span className="font-bold">{res.symbol}</span>
                <span className="text-sm text-gray-500">{res.name}</span>
              </div>
              <div className="text-xs text-blue-500">{res.type}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StockSearch;
