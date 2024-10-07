import handler from "serve-handler";
import http from "node:http";

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return handler(request, response);
});

server.listen(5555, () => {
  console.log("Running at http://localhost:5555");
});
