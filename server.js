import app from "./src/app.js";
import dotenv from 'dotenv/config'


const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Le server tourne sur http://localhost:${port}`);
    
})