import express from "express";
import { router } from "./routes";

const app = express();

app.use("/api", router);
app.use(express.json());

const main = () =>{
    console.log("Server is running on port 3000");
}

app.listen(3000, main);