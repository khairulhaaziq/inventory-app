import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider, keepPreviousData } from "@tanstack/react-query";
import "~/styles/tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({defaultOptions: {
    queries: {
      gcTime: 3600000, // 1 hour
      retry: 2,
      placeholderData: keepPreviousData,
    },
  },})

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="bg-[rgba(0,0,0,0.07)] min-h-[100dvh]">
            {children}
          </div>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
