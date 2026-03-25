import React,{useEffect,useState} from "react"
import axios from "axios"
import {Bar,Pie} from "react-chartjs-2"
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,ArcElement,Title,Tooltip,Legend} from "chart.js"

ChartJS.register(CategoryScale,LinearScale,BarElement,ArcElement,Title,Tooltip,Legend)

function App(){

const[vms,setVms]=useState([])
const[storage,setStorage]=useState([])
const[databases,setDatabases]=useState([])
const[analytics,setAnalytics]=useState({})
const[logs,setLogs]=useState([])
const[costs,setCosts]=useState({})

const[vmName,setVmName]=useState("")
const[provider,setProvider]=useState("AWS")
const[cpu,setCpu]=useState(2)
const[ram,setRam]=useState(4)

const[storageSize,setStorageSize]=useState(50)

const[dbName,setDbName]=useState("")
const[engine,setEngine]=useState("MySQL")

useEffect(()=>{loadData()},[])

const loadData=()=>{
axios.get("http://localhost:5000/vms").then(res=>setVms(res.data))
axios.get("http://localhost:5000/storage").then(res=>setStorage(res.data))
axios.get("http://localhost:5000/databases").then(res=>setDatabases(res.data))
axios.get("http://localhost:5000/analytics").then(res=>setAnalytics(res.data))
axios.get("http://localhost:5000/logs").then(res=>setLogs(res.data))
axios.get("http://localhost:5000/costs").then(res=>setCosts(res.data))
}

const button={
background:"#8e6be8",
color:"white",
border:"none",
padding:"8px 16px",
borderRadius:"6px",
marginLeft:"8px",
cursor:"pointer"
}

const section={
background:"white",
padding:"20px",
marginTop:"20px",
borderRadius:"10px"
}

const card={
flex:1,
background:"#d8c7ff",
padding:"20px",
borderRadius:"10px",
textAlign:"center"
}

/* ACTIONS */

const createVM=()=>{
axios.post("http://localhost:5000/create-vm",{provider,name:vmName,cpu,ram}).then(loadData)
}

const startVM=id=>{
axios.post("http://localhost:5000/start-vm/"+id).then(loadData)
}

const stopVM=id=>{
axios.post("http://localhost:5000/stop-vm/"+id).then(loadData)
}

const deleteVM=id=>{
axios.delete("http://localhost:5000/delete-vm/"+id).then(loadData)
}

const addStorage=()=>{
axios.post("http://localhost:5000/add-storage",{provider,size:storageSize}).then(loadData)
}

const deleteStorage=id=>{
axios.delete("http://localhost:5000/delete-storage/"+id).then(loadData)
}

const createDB=()=>{
axios.post("http://localhost:5000/create-db",{provider,name:dbName,engine}).then(loadData)
}

const deleteDB=id=>{
axios.delete("http://localhost:5000/delete-db/"+id).then(loadData)
}

/* ANALYTICS CHART */

const chartData={
labels:["AWS","Azure"],
datasets:[
{
label:"VMs",
backgroundColor:"#c8b6ff",
data:[analytics.AWS?.vm||0,analytics.Azure?.vm||0]
},
{
label:"Storage",
backgroundColor:"#b8c0ff",
data:[analytics.AWS?.storage||0,analytics.Azure?.storage||0]
},
{
label:"Databases",
backgroundColor:"#d0a6ff",
data:[analytics.AWS?.db||0,analytics.Azure?.db||0]
}
]
}

/* COST CHART */

const costChart={
labels:["AWS","Azure"],
datasets:[
{
label:"Estimated Monthly Cost ($)",
backgroundColor:["#c8b6ff","#b8c0ff"],
data:[costs.AWS||0,costs.Azure||0]
}
]
}

/* PIE CHART */

const usagePie={
labels:["AWS","Azure"],
datasets:[
{
backgroundColor:["#c8b6ff","#b8c0ff"],
data:[
(analytics.AWS?.vm||0)+(analytics.AWS?.db||0),
(analytics.Azure?.vm||0)+(analytics.Azure?.db||0)
]
}
]
}

return(

<div style={{
padding:"40px",
background:"#f3e8ff",
minHeight:"100vh",
fontFamily:"Arial"
}}>

<h1 style={{textAlign:"center"}}>
Multi-Cloud Management Dashboard
</h1>

{/* SUMMARY CARDS */}

<div style={{display:"flex",gap:"20px",marginTop:"30px"}}>

<div style={card}>
<h3>Total VMs</h3>
<h2>{vms.length}</h2>
</div>

<div style={card}>
<h3>Total Storage</h3>
<h2>{storage.reduce((a,b)=>a+b.size,0)} GB</h2>
</div>

<div style={card}>
<h3>Total Databases</h3>
<h2>{databases.length}</h2>
</div>

</div>

{/* VM MANAGEMENT */}

<div style={section}>

<h2>Virtual Machine Management</h2>

<input placeholder="VM Name" onChange={e=>setVmName(e.target.value)}/>

<select onChange={e=>setProvider(e.target.value)}>

<option>AWS</option>
<option>Azure</option>
</select>

<input type="number" placeholder="CPU" onChange={e=>setCpu(e.target.value)}/>
<input type="number" placeholder="RAM" onChange={e=>setRam(e.target.value)}/>

<button style={button} onClick={createVM}>
Create VM
</button>

<hr/>

{vms.map(vm=>(

<div key={vm.id} style={{marginBottom:"8px"}}>

{vm.name} | {vm.provider} | {vm.status}

<button style={button} onClick={()=>startVM(vm.id)}>Start</button>
<button style={button} onClick={()=>stopVM(vm.id)}>Stop</button>
<button style={button} onClick={()=>deleteVM(vm.id)}>Delete</button>

</div>

))}

</div>

{/* STORAGE */}

<div style={section}>

<h2>Storage Management</h2>

<select onChange={e=>setProvider(e.target.value)}>

<option>AWS</option>
<option>Azure</option>
</select>

<input type="number" placeholder="Storage Size GB" onChange={e=>setStorageSize(e.target.value)}/>

<button style={button} onClick={addStorage}>
Add Storage
</button>

<hr/>

{storage.map(s=>(

<div key={s.id}>

{s.provider} | {s.size} GB

<button style={button} onClick={()=>deleteStorage(s.id)}>
Delete </button>

</div>

))}

</div>

{/* DATABASE */}

<div style={section}>

<h2>Database Management</h2>

<select onChange={e=>setProvider(e.target.value)}>

<option>AWS</option>
<option>Azure</option>
</select>

<input placeholder="Database Name" onChange={e=>setDbName(e.target.value)}/>

<select onChange={e=>setEngine(e.target.value)}>

<option>MySQL</option>
<option>PostgreSQL</option>
</select>

<button style={button} onClick={createDB}>
Create DB
</button>

<hr/>

{databases.map(db=>(

<div key={db.id}>

{db.name} | {db.provider} | {db.engine}

<button style={button} onClick={()=>deleteDB(db.id)}>
Delete </button>

</div>

))}

</div>

{/* ANALYTICS */}

<div style={section}>

<h2>Cloud Usage Analytics</h2>

<div style={{width:"700px"}}>
<Bar data={chartData}/>
</div>

</div>

{/* COST ESTIMATION */}

<div style={section}>

<h2>Cloud Cost Estimation</h2>

<div style={{width:"600px"}}>
<Bar data={costChart}/>
</div>

</div>

{/* PROVIDER USAGE PIE */}

<div style={section}>

<h2>Provider Usage Distribution</h2>

<div style={{width:"400px"}}>
<Pie data={usagePie}/>
</div>

</div>

{/* ACTIVITY LOGS */}

<div style={section}>

<h2>Activity Logs</h2>

<div style={{
maxHeight:"200px",
overflowY:"scroll",
background:"#f9f6ff",
padding:"10px"
}}>

{logs.map(log=>(

<div key={log.id} style={{marginBottom:"6px"}}>

{log.timestamp} | {log.provider} | {log.action} | {log.resource}

</div>

))}

</div>

</div>

</div>

)

}

export default App
