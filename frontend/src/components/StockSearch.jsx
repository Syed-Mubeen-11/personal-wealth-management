import React, { useState } from "react";
import stocks from "../data/stocks";

function StockSearch({ onSelect }) {

  const [query, setQuery] = useState("");


  const filtered = stocks.filter(s =>
  s.name.toLowerCase().includes(query.toLowerCase()) ||
  s.symbol.toLowerCase().includes(query.toLowerCase())
);

  return (
    <div>

      <input
        placeholder="Search Stock"
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
        className="border p-2 rounded"
      />

      {query && (
        <ul className="border bg-white">

          {filtered.map(stock => (

            <li
              key={stock.symbol}
              onClick={() => {
                setQuery(stock.name);
                onSelect(stock);
              }}
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