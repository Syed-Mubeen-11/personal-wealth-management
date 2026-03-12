import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CreateTransaction() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "buy",
    symbol: "",
    quantity: "",
    price: "",
    fees: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await api.post("/transactions", formData);

      navigate("/portfolio");

    } catch (err) {

      alert("Error creating transaction");
      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="space-y-8 text-white">

      <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Add Transaction
      </h1>

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 max-w-2xl">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Type */}

          <div>

            <label className="block text-slate-400 mb-2">
              Transaction Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 outline-none"
            >

              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="dividend">Dividend</option>
              <option value="contribution">Contribution</option>
              <option value="withdrawal">Withdrawal</option>

            </select>

          </div>

          {/* Symbol */}

          <div>

            <label className="block text-slate-400 mb-2">
              Asset Symbol
            </label>

            <input
              type="text"
              name="symbol"
              required
              placeholder="AAPL"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 outline-none"
              onChange={handleChange}
            />

          </div>

          {/* Quantity */}

          <div>

            <label className="block text-slate-400 mb-2">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              placeholder="10"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 outline-none"
              onChange={handleChange}
            />

          </div>

          {/* Price */}

          <div>

            <label className="block text-slate-400 mb-2">
              Price
            </label>

            <input
              type="number"
              name="price"
              placeholder="150"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 outline-none"
              onChange={handleChange}
            />

          </div>

          {/* Fees */}

          <div>

            <label className="block text-slate-400 mb-2">
              Fees
            </label>

            <input
              type="number"
              name="fees"
              placeholder="2"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 outline-none"
              onChange={handleChange}
            />

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition"
          >

            {loading ? "Adding..." : "Add Transaction"}

          </button>

        </form>

      </div>

    </div>

  );
}

export default CreateTransaction;