import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SimulationChart({ data }) {

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Current Plan",
        data: data.current,
        borderColor: "blue",
        backgroundColor: "blue"
      },
      {
        label: "New Scenario",
        data: data.new,
        borderColor: "green",
        backgroundColor: "green"
      }
    ]
  };

  return (
    <div style={{ width: "700px" }}>
      <Line data={chartData} />
    </div>
  );
}

export default SimulationChart;