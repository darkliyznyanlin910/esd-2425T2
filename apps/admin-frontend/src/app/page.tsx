import { getServiceBaseUrl } from "@repo/service-discovery";

import { env } from "../env";

export default async function HomePage() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Deployment Environment: {env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}</p>
      <p>Base URL: {getServiceBaseUrl("admin-frontend")}</p>
      <p>API Base URL: {getServiceBaseUrl("order")}</p>
    </div>
  );
}
