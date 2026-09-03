import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL || "",
  pingInterval: 30000,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

const publisherClient = createClient({
  url: process.env.REDIS_URL || "",
  pingInterval: 30000,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

publisherClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

async function connectRedis(){
  let retries = 3;
    for(let i=0;i < retries; i++){
      try {
        await redisClient.connect();
        await publisherClient.connect();
        return;
      } catch (error) {
        if(i===retries - 1){
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
}

await connectRedis()

while(1){
  const order = await redisClient.brPop("incoming_order", 10);

  if(!order){
    console.log("order not found", order);
    continue;
  }

  const parsedOrder = JSON.parse(order?.element || "{}"); 

  if(parsedOrder?.type === "market"){

  }

  if(parsedOrder?.type === "limit"){

  }

  let quantity = parsedOrder?.qty;
  await publisherClient.lPush("filled_order"+ parsedOrder.queueName, JSON.stringify({ identifier: parsedOrder?.identifier, quantity}));
  console.log("Hellos", JSON.parse(order?.element || "{}"));
}

// https://uat-shionogi.expertevents.iqvia.com/session/undefined/speaker/engagementDetails/2158/true
// https://uat-shionogi.expertevents.iqvia.com/portal/speaker/engagementDetails/2158/true

// // Disconnect after usage
// await client.disconnect();