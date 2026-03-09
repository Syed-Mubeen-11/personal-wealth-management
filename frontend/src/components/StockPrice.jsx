import { useEffect, useState } from "react";

function StockPrice({ symbol }) {

  const [price, setPrice] = useState(null);

  useEffect(() => {

    const fetchPrice = () => {

      fetch(`http://localhost:8000/stock/${symbol}`)
        .then(res => res.json())
        .then(data => setPrice(data.price));

    };

    fetchPrice();

    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);

  }, [symbol]);

  return (
    <div className="bg-white p-4 rounded shadow">

      <h3>{symbol}</h3>
      <p>Live Price: ₹{price}</p>

    </div>
  );

}

export default StockPrice;