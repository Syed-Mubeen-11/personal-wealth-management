import React, { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import ChartCard from "../components/ChartCard";
import TransactionsTable from "../components/TransactionsTable";
import GoalsProgress from "../components/GoalsProgress";
import WealthScoreWidget from "../components/WealthScoreWidget";
import API from "../services/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const userRes = await API.get("/me");
        setUser(userRes.data);

        const investRes = await API.get("/investments");
        const transRes = await API.get("/transactions");

        setInvestments(investRes.data || []);
        setTransactions(transRes.data || []);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }

    };

    fetchData();

  }, []);

  const formatCurrency = (num) => {

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);

  };

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.cost_basis || 0),
    0
  );

  const totalIncome = transactions
    .filter(tx => tx.type === "sell" || tx.type === "dividend")
    .reduce((sum, tx) => sum + Number(tx.price * tx.quantity), 0);

  const totalExpense = transactions
    .filter(tx => tx.type === "buy")
    .reduce((sum, tx) => sum + Number(tx.price * tx.quantity), 0);

  const netWorth = totalInvested + totalIncome - totalExpense;

  return (

    <div className="space-y-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">

            Welcome{user ? `, ${user.name}` : ""}

          </h2>

          <p className="text-gray-500 dark:text-gray-300 mt-1">

            Here’s your financial overview for today.

          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <SummaryCard
          title="Total Net Worth"
          value={formatCurrency(netWorth)}
        />

        <SummaryCard
          title="Investments"
          value={formatCurrency(totalInvested)}
        />

        <SummaryCard
          title="Income"
          value={formatCurrency(totalIncome)}
        />

        <SummaryCard
          title="Expenses"
          value={formatCurrency(totalExpense)}
        />

      </div>
      

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ChartCard
          title="Net Worth Growth"
          type="line"
          investments={investments}
        />

        <ChartCard
          title="Asset Allocation"
          type="pie"
          investments={investments}
        />

        

      </div>
       <div className="grid grid-cols-1 xl:grid-cols-1 ">
        <TransactionsTable transactions={transactions} showActions={false} />
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        

        <GoalsProgress />

        <WealthScoreWidget />

      </div>

    </div>

  );

};

export default Dashboard;