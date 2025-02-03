import { createAuthClient } from "better-auth/react";

import { getServiceBaseUrl } from "@repo/service-discovery";

export const authClient = createAuthClient({
  baseURL: getServiceBaseUrl("auth") + "/auth",
});
