import express from "express";
import { router } from "./routes";
import { createClient } from "redis"

const app = express();

export const redisClient = createClient({
    url: process.env.REDIS_URL || "",
  });

  redisClient.on("error", function(err) {
   throw err;
});

async function connectRedis(){
  let retries = 3;
    for(let i=0;i < retries; i++){
      try {
        await redisClient.connect();
        return;
      } catch (error) {
        if(i===retries - 1){
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
}
await connectRedis();
app.use(express.json());
app.use("/api", router);

const main = async () =>{
    console.log("Server is running on port 3000");
}

app.listen(3000, main);
