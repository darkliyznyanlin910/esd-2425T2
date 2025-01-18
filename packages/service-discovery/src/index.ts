import { env } from "./env";

export const AWS_DOMAIN = "johnnyknl.com";
export const SERVICES = ["api", "web"] as const;
export type Service = (typeof SERVICES)[number];

export const LOCAL_SERVICE_MAP: Record<Service, string> = {
  api: "http://localhost:3001",
  web: "http://localhost:3000",
};

export const getServiceBaseUrl = (service: Service) => {
  if (env.DEPLOYMENT_ENVIRONMENT === "local") {
    return LOCAL_SERVICE_MAP[service];
  } else if (env.DEPLOYMENT_ENVIRONMENT === "docker") {
    if (service == "web") {
      return `http://localhost:8000`;
    } else {
      return `http://localhost:8000/microservice/${service}`;
    }
  } else if (env.DEPLOYMENT_ENVIRONMENT === "aws-prod") {
    return `https://${service}.production.esd-itsa.${AWS_DOMAIN}`;
  } else if (env.DEPLOYMENT_ENVIRONMENT === "aws-dev") {
    return `https://${service}.development.esd-itsa.${AWS_DOMAIN}`;
  }
};
