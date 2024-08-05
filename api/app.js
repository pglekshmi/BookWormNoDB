import express,{json} from "express";
import dotenv from "dotenv";
import adminRoute from "./Routes/adminRoute.js";
import bcrypt from 'bcrypt';
import morgan from 'morgan';



dotenv.config();
const listen_port=process.env.listen_port;

const app=express();
app.use(json());
app.use(morgan())
// app.use(express.urlencoded({ extended: true }));
app.use('/',adminRoute);



app.listen((listen_port),()=>{
    console.log(`Listening to port ${listen_port}`);
})

