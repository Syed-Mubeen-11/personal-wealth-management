import React, { useState, useEffect } from "react";
import axios from "axios";

function StockSearch({ onSelect }) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 debounce + safe search
  useEffect(() => {

    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:8000/stocks/search?keyword=${query}`
        );

        setResults(res.data || []);

      } catch (err) {
        console.error("Search error", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 👈 debounce (important)

    return () => clearTimeout(delay);

  }, [query]);

  // 💰 select + fetch price
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
    <div className="relative">

      <input
        placeholder="Search Stock"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* 🔥 Loading */}
      {loading && (
        <div className="absolute w-full bg-white border p-2 text-sm">
          Loading...
        </div>
      )}

      {/* 🔥 Results */}
      {results.length > 0 && (
        <ul className="absolute w-full border bg-white z-10 max-h-60 overflow-y-auto">

          {results.map((stock, index) => (
            <li
              key={index}
              onClick={() => handleSelect(stock)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {stock.name} ({stock.symbol})
            </li>
          ))}

        </ul>
      )}

    </div>
  );
}

export default StockSearch;