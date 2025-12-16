import dotenv from "dotenv"
dotenv.config();
import app from "./src/app.js"
import ConnectDb from "./src/config/db.js";

const PORT = process.env.PORT || 3001;



app.get('/',(req,res)=>{
    
    res.send("all is well!")
})



ConnectDb()
    .then(()=>{
        app.listen(PORT,()=>{
            console.log(`Server connected to PORT ${PORT}`)
        })
    })
    .catch((err)=>{
    console.log('Failed to connect to the server!!');
    })