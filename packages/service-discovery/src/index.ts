import { env } from "./env";

export const AWS_DOMAIN = "johnnyknl.com";
export const AWS_NAMESPACE = "esd";
export const SERVICES = [
  "api",
  "web",
  "auth",
  "chatbot",
  "notification",
  "order",
  "driver",
] as const;
export type Service = (typeof SERVICES)[number];

export const LOCAL_SERVICE_MAP: Record<Service, string> = {
  web: "http://localhost:3000",
  api: "http://localhost:3001",
  auth: "http://localhost:3002",
  chatbot: "http://localhost:3003",
  notification: "http://localhost:3004",
  order: "http://localhost:3005",
  driver: "http://localhost:3006",
};

export const KUBERNETES_SERVICE_MAP: Record<Service, string> = {
  web: "http://localhost:8000",
  api: "http://localhost:8000/api",
  auth: "http://localhost:8000/microservice/auth",
  chatbot: "http://localhost:8000/microservice/chatbot",
  notification: "http://localhost:8000/microservice/notification",
  order: "http://localhost:8000/microservice/order",
  driver: "http://localhost:8000/microservice/driver",
};

export const getServiceBaseUrl = (service: Service) => {
  console.log(env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT);
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
    return KUBERNETES_SERVICE_MAP[service];
  }
};
