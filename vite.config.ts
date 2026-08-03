// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Dev server only - it has no bearing on the production build.
  //
  // Vite refuses requests whose Host header it does not recognise, which is
  // right: it stops a dev server being reached through a hostname pointed at
  // this machine. A Cloudflare quick tunnel is exactly that, done on purpose,
  // so the one domain those tunnels live on is allowed by suffix. Sharing a
  // running dev server with a tester needs no further configuration, and the
  // hostname changes on every tunnel so naming one would be useless.
  vite: { server: { allowedHosts: [".trycloudflare.com"] } },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
