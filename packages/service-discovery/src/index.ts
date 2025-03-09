import { env } from "./env";

export const AWS_DOMAIN = "johnnyknl.com";
export const AWS_NAMESPACE = "esd";
export const SERVICES = [
  // Frontend
  "web", // dummy service
  "customer-frontend",
  "admin-frontend",
  "driver-frontend",
  // Backend
  "api", // dummy service
  "auth",
  "chatbot",
  "notification",
  "order",
  "driver",
  "invoice",
] as const;
export type Service = (typeof SERVICES)[number];

export const LOCAL_SERVICE_MAP: Record<Service, string> = {
  // Frontend
  web: "http://localhost:3000", // dummy service
  "admin-frontend": "http://localhost:4000",
  "customer-frontend": "http://localhost:5000",
  "driver-frontend": "http://localhost:6000",
  // Backend
  api: "http://localhost:3001", // dummy service
  auth: "http://localhost:3002",
  chatbot: "http://localhost:3003",
  notification: "http://localhost:3004",
  order: "http://localhost:3005",
  driver: "http://localhost:3006",
  invoice: "http://localhost:3007",
};

export const KUBERNETES_SERVICE_MAP: Record<Service, string> = {
  // Frontend
  web: "http://localhost:3000", // dummy service
  "admin-frontend": "http://localhost:4000",
  "customer-frontend": "http://localhost:5000",
  "driver-frontend": "http://localhost:6000",
  // Backend
  api: "http://localhost:8000/api", // dummy service
  auth: "http://localhost:8000/auth",
  chatbot: "http://localhost:8000/chatbot",
  notification: "http://localhost:8000/notification",
  order: "http://localhost:8000/order",
  driver: "http://localhost:8000/driver",
  invoice: "http://localhost:8000/invoice",
};

export const DOCKER_SERVICE_MAP: Record<Service, string> = {
  // Frontend
  web: "http://localhost:3000", // dummy service
  "admin-frontend": "http://localhost:4000",
  "customer-frontend": "http://localhost:5000",
  "driver-frontend": "http://localhost:6000",
  // Backend
  api: "http://localhost:8000/api", // dummy service
  auth: "http://localhost:8000/auth",
  chatbot: "http://localhost:8000/chatbot",
  notification: "http://localhost:8000/notification",
  order: "http://localhost:8000/order",
  driver: "http://localhost:8000/driver",
  invoice: "http://localhost:8000/invoice",
};

export const getServiceBaseUrl = (service: Service) => {
  console.log(env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT);
  if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "local") {
    return LOCAL_SERVICE_MAP[service];
  } else if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "docker") {
    return DOCKER_SERVICE_MAP[service];
  } else {
    // kubernetes
    return KUBERNETES_SERVICE_MAP[service];
  }
};
