import { rootRoute } from "./routes/__root";
import { Route as IndexRoute } from "./routes/index";
import { Route as AdminRoute } from "./routes/admin";
import { Route as ChatSlugRoute } from "./routes/chat/$slug";
import { Route as DashboardSlugRoute } from "./routes/dashboard/$slug";

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  AdminRoute,
  ChatSlugRoute,
  DashboardSlugRoute,
]);
