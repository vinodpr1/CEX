import express from "express";
import { router } from "./routes";
import { createClient } from "redis"

const app = express();

const client = createClient({
    url: "rediss://default:gQAAAAAAAX_hAAIgcDI5ZTA4Mzc3NGQ4MzA0OTczOTU3MTkyNzRjOWNmYjA3Mg@faithful-basilisk-98273.upstash.io:6379"
  });

client.on("error", function(err) {
   throw err;
});
await client.connect()

app.use("/api", router);
app.use(express.json());

const main = async () =>{
    console.log("Server is running on port 3000");
    const value = await client.get('vinod');
    console.log(value ?? "No value");
}

app.listen(3000, main);
