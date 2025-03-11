import { getServiceBaseUrl } from "@repo/service-discovery";

export default async function HomePage() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Base URL: {getServiceBaseUrl("driver-frontend")}</p>
      <p>API Base URL: {getServiceBaseUrl("order")}</p>
    </div>
  );
}
