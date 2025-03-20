import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getServiceBaseUrl } from "@repo/service-discovery";

export const authClient = createAuthClient({
  baseURL: getServiceBaseUrl("auth") + "/auth",
  plugins: [adminClient()],
});
