import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ allocation }) => {
  const data = {
    labels: ["Stocks", "ETFs", "Mutual Funds", "Bonds", "Cash"],
    datasets: [
      {
        data: allocation,
        backgroundColor: [
          "#4f46e5",
          "#0ea5e9",
          "#22c55e",
          "#f59e0b",
          "#64748b"
        ],
      },
    ],
  };

  return <Doughnut data={data} />;
};

export default DoughnutChart;