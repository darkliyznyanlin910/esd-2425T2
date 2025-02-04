import { env } from "./env";

export const AWS_DOMAIN = "johnnyknl.com";
export const AWS_NAMESPACE = "esd";
export const SERVICES = ["api", "web", "auth"] as const;
export type Service = (typeof SERVICES)[number];

export const LOCAL_SERVICE_MAP: Record<Service, string> = {
  web: "http://localhost:3000",
  api: "http://localhost:3001",
  auth: "http://localhost:3002",
};

export const getServiceBaseUrl = (service: Service) => {
  if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "local") {
    return LOCAL_SERVICE_MAP[service];
  } else if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "docker") {
    if (service == "web") {
      return `http://localhost:8000`;
    } else {
      return `http://localhost:8000/microservice/${service}`;
    }
  } else {
    // kubernetes
    return `http://my-app-${service}:80`;
  }
};
