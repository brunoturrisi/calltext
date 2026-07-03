import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <html lang="it">
      <head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>CallText</title></head>
      <body style={{ margin: 0, padding: 0 }}><Outlet /></body>
    </html>
  ),
});
