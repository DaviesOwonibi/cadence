import path from "node:path";
import { createSerwistRoute } from "@serwist/turbopack";

export const GET = createSerwistRoute({
  // Point this to your actual service worker source file
  swSrc: path.resolve(process.cwd(), "app/sw.ts"), 
  
  // Instructs esbuild how to treat your code environment
  esbuildOptions: {
    minify: process.env.NODE_ENV === "production",
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
  },
});
