import { env } from "./env";

export const AWS_DOMAIN = "johnnyknl.com";
export const AWS_NAMESPACE = "esd";
export const SERVICES = [
  // Frontend
  "customer-frontend",
  "admin-frontend",
  "driver-frontend",
  // Backend
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
  "admin-frontend": "http://localhost:4400",
  "customer-frontend": "http://localhost:5500",
  "driver-frontend": "http://localhost:6600",
  // Backend
  auth: "http://localhost:3002",
  chatbot: "http://localhost:3003",
  notification: "http://localhost:3004",
  order: "http://localhost:3005",
  driver: "http://localhost:3006",
  invoice: "http://localhost:3007",
};

export const KUBERNETES_SERVICE_MAP: Record<Service, string> = {
  // Frontend
  "admin-frontend": "http://admin.esd.local",
  "customer-frontend": "http://customer.esd.local",
  "driver-frontend": "http://driver.esd.local",
  // Backend
  auth: "http://api.esd.local/auth",
  chatbot: "http://api.esd.local/chatbot",
  notification: "http://api.esd.local/notification",
  order: "http://api.esd.local/order",
  driver: "http://api.esd.local/driver",
  invoice: "http://api.esd.local/invoice",
};

export const KUBERNETES_INTERNAL_SERVICE_MAP: Record<Service, string> = {
  // Frontend
  "admin-frontend": "http://esd-admin-frontend.default.svc.cluster.local",
  "customer-frontend": "http://esd-customer-frontend.default.svc.cluster.local",
  "driver-frontend": "http://esd-driver-frontend.default.svc.cluster.local",
  // Backend
  auth: "http://esd-nginx.default.svc.cluster.local/auth",
  chatbot: "http://esd-nginx.default.svc.cluster.local/chatbot",
  notification: "http://esd-nginx.default.svc.cluster.local/notification",
  order: "http://esd-nginx.default.svc.cluster.local/order",
  driver: "http://esd-nginx.default.svc.cluster.local/driver",
  invoice: "http://esd-nginx.default.svc.cluster.local/invoice",
};

export const DOCKER_SERVICE_MAP: Record<Service, string> = {
  // Frontend
  "admin-frontend": "http://localhost:4400",
  "customer-frontend": "http://localhost:5500",
  "driver-frontend": "http://localhost:6600",
  // Backend
  auth: "http://localhost:8000/auth",
  chatbot: "http://localhost:8000/chatbot",
  notification: "http://localhost:8000/notification",
  order: "http://localhost:8000/order",
  driver: "http://localhost:8000/driver",
  invoice: "http://localhost:8000/invoice",
};

export const getServiceBaseUrl = (service: Service) => {
  if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "local") {
    return LOCAL_SERVICE_MAP[service];
  } else if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "docker") {
    return DOCKER_SERVICE_MAP[service];
  } else if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === "kubernetes") {
    // kubernetes
    return KUBERNETES_SERVICE_MAP[service];
  } else {
    return KUBERNETES_INTERNAL_SERVICE_MAP[service];
  }
};
