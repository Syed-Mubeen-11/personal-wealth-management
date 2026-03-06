import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/Themecontext";

const GoalsProgress = () => {

const { darkMode } = useContext(ThemeContext);
const [goals,setGoals]=useState([]);

const token=localStorage.getItem("token");

useEffect(()=>{

const fetchGoals = async ()=>{

try{

const res = await axios.get(
"http://localhost:8000/goals/",
{
headers:{Authorization:`Bearer ${token}`}
}
);

setGoals(res.data);

}catch(err){
console.error(err);
}

};

fetchGoals();

},[]);

return(

<div className={`rounded-2xl shadow-sm border p-6 ${
darkMode?"bg-gray-800 border-gray-700":"bg-white border-gray-100"
}`}>

<h3 className="text-lg font-semibold mb-6">
Goals Progress
</h3>

<div className="space-y-6">

{goals.map(goal=>{

const progress = Math.min(
(goal.monthly_contribution/goal.target_amount)*100,
100
);

return(

<div key={goal.id}>

<div className="flex justify-between mb-2">
<span>{goal.goal_type}</span>
<span>{progress.toFixed(0)}%</span>
</div>

<div className="w-full h-3 rounded-full bg-gray-200">

<div
className="h-3 rounded-full bg-indigo-500"
style={{width:`${progress}%`}}
/>

</div>

</div>

);

})}

</div>

</div>

);

};

export default GoalsProgress;