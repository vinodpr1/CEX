import { createClient } from "redis";

export const QUEUE_NAME = Math.random();

export const subscriberClient = createClient({
  url: process.env.REDIS_URL || "",
  pingInterval: 30000,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

subscriberClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

subscriberClient.on('connect', () => console.log('subscriberClient is connected'));

async function connectRedis(){
  let retries = 3;
    for(let i=0;i < retries; i++){
      try {
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

let pendingResolves:any = {};

/*
{
     .434343: resolve,
     .434344: resolve,
     .434345: resolve,
     .434346: resolve,
     .434347: resolve,
     .434348: resolve,
     .434349: resolve,
     .434350: resolve,
     .434351: resolve,
     .434352: resolve 
}
*/
export const yeildOrderEngine = (identifier: number) =>{
    return new Promise((resolve, reject) =>{
        pendingResolves[identifier] = resolve;
    })
}

async function poller(){
    const response = await subscriberClient.brPop("filled_order"+ QUEUE_NAME, 10);
    if(!response){
      console.log("response not found", response);
      poller();
    }else{
      const parsedResponse = JSON.parse(response?.element || "{}");
      console.log("parsedResponse hoo gayyaaa", parsedResponse);
      if(parsedResponse.identifier && pendingResolves[parsedResponse.identifier]){
         console.log("parsedResponse found");
         pendingResolves [parsedResponse.identifier]({filledQuantity: parsedResponse.quantity, identifier: parsedResponse.identifier});
      }
      poller();
    } 
}

poller();