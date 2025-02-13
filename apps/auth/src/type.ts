import { routes } from "./app";
import { auth } from "./auth";

export type AppType = typeof routes;

export type HonoExtension = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};
