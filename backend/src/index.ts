import express from "express";
import { router } from "./routes";
import { createClient } from "redis"

const app = express();

const client = createClient({
    url: process.env.REDIS_URL || "",
  });

client.on("error", function(err) {
   throw err;
});
await client.connect()

app.use(express.json());
app.use("/api", router);

const main = async () =>{
    console.log("Server is running on port 3000");
    const value = await client.get('vinod');
    console.log(value ?? "No value");
}

app.listen(3000, main);
