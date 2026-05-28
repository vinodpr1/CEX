import { createClient } from "redis"

const client = createClient({
  url: "rediss://default:gQAAAAAAAX_hAAIgcDI5ZTA4Mzc3NGQ4MzA0OTczOTU3MTkyNzRjOWNmYjA3Mg@faithful-basilisk-98273.upstash.io:6379"
});

client.on("error", function(err) {
  throw err;
});
await client.connect()
await client.set('vinod','Vinod Prajapati');

// // Disconnect after usage
// await client.disconnect();