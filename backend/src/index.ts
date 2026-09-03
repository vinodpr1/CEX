import express from "express";
import { router } from "./routes";
import { createClient } from "redis"

const app = express();

export const redisClient = createClient({
    url: process.env.REDIS_URL || "",
    pingInterval: 30000,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
    }
});

export const subscriberClient = createClient({
  url: process.env.REDIS_URL || "",
  pingInterval: 30000,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

subscriberClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redisClient.on('connect', () => console.log('client is connected'));
subscriberClient.on('connect', () => console.log('client is connected'));

async function connectRedis(){
  let retries = 3;
    for(let i=0;i < retries; i++){
      try {
        await redisClient.connect();
        await subscriberClient.connect();
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

app.get("/health", (req, res) => {
  res.json({ message: "Server is running", timestamp: new Date().toISOString() });
})

const main = async (port: number) =>{
    console.log("Server is running on port", port);
}

app.listen(3000, () => main(3000));
