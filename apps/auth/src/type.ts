import type { routes } from "./app";
import type { auth } from "./auth";

export type AppType = typeof routes;

export interface HonoExtension {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}
