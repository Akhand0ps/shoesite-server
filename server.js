import dotenv from "dotenv"
dotenv.config();
import app from "./src/app.js"


const PORT = process.env.PORT || 3001;



app.get('/health',()=>{
    
    res.send("all is well!")
})

app.listen(PORT,(req,res)=>{

    console.log(`Server is runing on PORT ${PORT}`);
})

