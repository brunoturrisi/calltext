import { createServer } from "http";
import { createBuildHandler } from "@tanstack/react-start";

const handler = createBuildHandler();
const server = createServer(handler);
server.listen(3000, "0.0.0.0", () => {
  console.log("CallText running on http://0.0.0.0:3000");
});
