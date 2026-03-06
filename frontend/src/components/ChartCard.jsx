import React, { useContext } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
ArcElement,
Tooltip,
Legend,
Filler
} from "chart.js";
import { ThemeContext } from "../context/Themecontext";

ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
ArcElement,
Tooltip,
Legend,
Filler
);

const ChartCard = ({ title, type, investments=[] }) => {

const { darkMode } = useContext(ThemeContext);

const totalInvested = investments.reduce(
(sum,inv)=>sum + Number(inv.cost_basis || 0),
0
);

const lineData = {
labels: ["Investments"],
datasets:[
{
label:"Portfolio Value",
data:[totalInvested],
fill:true,
backgroundColor:"rgba(99,102,241,0.2)",
borderColor:"#6366F1",
tension:0.4
}
]
};

const assetTypes = {};
investments.forEach(inv=>{
assetTypes[inv.asset_type]=(assetTypes[inv.asset_type]||0)+Number(inv.cost_basis||0);
});

const pieData = {
labels:Object.keys(assetTypes),
datasets:[
{
data:Object.values(assetTypes),
backgroundColor:["#6366F1","#10B981","#F59E0B","#EF4444"]
}
]
};

const options = {
responsive:true,
plugins:{
legend:{
display:type==="pie",
position:"bottom",
labels:{
color:darkMode?"#fff":"#111"
}
}
}
};

return (

<div className={`rounded-2xl shadow-sm border p-6 ${
darkMode?"bg-gray-800 border-gray-700":"bg-white border-gray-100"
}`}>

<h3 className="text-lg font-semibold mb-6">{title}</h3>

<div className="h-64">
{type==="line" ? <Line data={lineData} options={options}/> :
<Pie data={pieData} options={options}/>}
</div>

</div>

);

};

export default ChartCard;