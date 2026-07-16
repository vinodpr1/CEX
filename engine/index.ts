import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL || ""
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

await connectRedis()

while(1){
  const x = await redisClient.brPop("create_order", 10);
  console.log("Hellos", x);
}


// // Disconnect after usage
// await client.disconnect();