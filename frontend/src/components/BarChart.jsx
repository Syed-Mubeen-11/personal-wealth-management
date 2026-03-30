import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const BarChart = ({ allocation }) => {
  const data = {
    labels: ["Stocks", "ETFs", "Mutual Funds", "Bonds", "Cash"],
    datasets: [
      {
        label: "Allocation %",
        data: allocation,
        backgroundColor: "#4f46e5",
      },
    ],
  };

  return <Bar data={data} />;
};

export default BarChart;