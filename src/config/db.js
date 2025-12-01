import dotenv from "dotenv";
dotenv.config()

import mongoose from "mongoose";

const connectionString = process.env.MONGO_URL;



const ConnectDb = async()=>{

    try{

        if(!connectionString) throw new Error('Please give connection string')

        const conn = await mongoose.connect(connectionString);

        console.log('MongoDb connected: ',conn.connection.host);
        
    }catch(err){

        console.error("Error: ", err.message);
        throw err;
    }
}

export default ConnectDb;