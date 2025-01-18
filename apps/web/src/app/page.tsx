import { getBaseUrl } from "~/utils/getBaseUrl";

export default function HomePage() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>{getBaseUrl()}</p>
    </div>
  );
}
