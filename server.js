const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

/* MYSQL CONNECTION */

const db = mysql.createConnection({
host:"localhost",
user:"root",
password:"root",
database:"multicloud"
})

db.connect(err=>{
if(err) throw err
console.log("MySQL Connected")
})

/* GET VMS */

app.get("/vms",(req,res)=>{
db.query("SELECT * FROM vms",(err,result)=>{
res.json(result)
})
})

/* CREATE VM */

app.post("/create-vm",(req,res)=>{

const {provider,name,cpu,ram}=req.body

db.query(
"INSERT INTO vms(provider,name,cpu,ram,status) VALUES (?,?,?,?,?)",
[provider,name,cpu,ram,"stopped"],
()=>{

db.query(
"INSERT INTO logs(provider,action,resource) VALUES (?,?,?)",
[provider,"CREATE_VM",name]
)

res.send("VM Created")

})

})

/* START VM */

app.post("/start-vm/:id",(req,res)=>{

const id=req.params.id

db.query(
"UPDATE vms SET status='running' WHERE id=?",
[id],
()=>{
res.send("VM Started")
})

})

/* STOP VM */

app.post("/stop-vm/:id",(req,res)=>{

const id=req.params.id

db.query(
"UPDATE vms SET status='stopped' WHERE id=?",
[id],
()=>{
res.send("VM Stopped")
})

})

/* DELETE VM */

app.delete("/delete-vm/:id",(req,res)=>{

const id=req.params.id

db.query("DELETE FROM vms WHERE id=?",[id],()=>{
res.send("VM Deleted")
})

})

/* STORAGE */

app.get("/storage",(req,res)=>{
db.query("SELECT * FROM storage",(err,result)=>{
res.json(result)
})
})

app.post("/add-storage",(req,res)=>{

const {provider,size}=req.body

db.query(
"INSERT INTO storage(provider,size) VALUES (?,?)",
[provider,size],
()=>{
res.send("Storage Added")
})

})

app.delete("/delete-storage/:id",(req,res)=>{

db.query(
"DELETE FROM storage WHERE id=?",
[req.params.id],
()=>{
res.send("Storage Deleted")
})

})

/* DATABASE */

app.get("/databases",(req,res)=>{
db.query("SELECT * FROM cloud_databases",(err,result)=>{
res.json(result)
})
})

app.post("/create-db",(req,res)=>{

const {provider,name,engine}=req.body

db.query(
"INSERT INTO cloud_databases(provider,name,engine) VALUES (?,?,?)",
[provider,name,engine],
()=>{
res.send("Database Created")
})

})

app.delete("/delete-db/:id",(req,res)=>{

db.query(
"DELETE FROM cloud_databases WHERE id=?",
[req.params.id],
()=>{
res.send("Database Deleted")
})

})

/* ANALYTICS */

app.get("/analytics",(req,res)=>{

const data={
AWS:{vm:0,storage:0,db:0},
Azure:{vm:0,storage:0,db:0}
}

db.query("SELECT provider FROM vms",(err,vms)=>{

vms.forEach(v=>{
if(v.provider==="AWS") data.AWS.vm++
if(v.provider==="Azure") data.Azure.vm++
})

db.query("SELECT provider,size FROM storage",(err,st)=>{

st.forEach(s=>{
if(s.provider==="AWS") data.AWS.storage+=s.size
if(s.provider==="Azure") data.Azure.storage+=s.size
})

db.query("SELECT provider FROM cloud_databases",(err,dbs)=>{

dbs.forEach(d=>{
if(d.provider==="AWS") data.AWS.db++
if(d.provider==="Azure") data.Azure.db++
})

res.json(data)

})

})

})

})

/* LOGS */

app.get("/logs",(req,res)=>{
db.query(
"SELECT * FROM logs ORDER BY timestamp DESC",
(err,result)=>{
res.json(result)
})
})

/* COST ESTIMATION */

app.get("/costs",(req,res)=>{

const cost={AWS:0,Azure:0}

db.query("SELECT provider,cpu,ram FROM vms",(err,vms)=>{

vms.forEach(v=>{
const vmCost=(v.cpu*10)+(v.ram*5)

if(v.provider==="AWS") cost.AWS+=vmCost
if(v.provider==="Azure") cost.Azure+=vmCost
})

db.query("SELECT provider,size FROM storage",(err,st)=>{

st.forEach(s=>{
const c=s.size*0.2

if(s.provider==="AWS") cost.AWS+=c
if(s.provider==="Azure") cost.Azure+=c
})

db.query("SELECT provider FROM cloud_databases",(err,dbs)=>{

dbs.forEach(d=>{
const dbCost=15

if(d.provider==="AWS") cost.AWS+=dbCost
if(d.provider==="Azure") cost.Azure+=dbCost
})

res.json(cost)

})

})

})

})

/* SERVER */

app.listen(5000,()=>{
console.log("Server running on port 5000")
})