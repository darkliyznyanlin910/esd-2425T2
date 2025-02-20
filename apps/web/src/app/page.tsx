// import { hc } from "hono/client";

// import type { AppType } from "@repo/api/type";

import { getApiBaseUrl, getBaseUrl } from "~/utils/getBaseUrl";

export default async function HomePage() {
  // const client = hc<AppType>(getApiBaseUrl());
  // const res = await client.index.$get();
  // const data = await res.json();

  return (
    <div>
      <h1>Hello World</h1>
      <p>Base URL: {getBaseUrl()}</p>
      <p>API Base URL: {getApiBaseUrl()}</p>
      {/* <p>Message: {data.ok}</p> */}
    </div>
  );
}
