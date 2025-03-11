import { getServiceBaseUrl } from "@repo/service-discovery";

export const getBaseUrl = () => {
  return getServiceBaseUrl("customer-frontend");
};

export const getApiBaseUrl = () => {
  return getServiceBaseUrl("api");
};
