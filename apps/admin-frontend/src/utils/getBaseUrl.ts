import { getServiceBaseUrl } from "@repo/service-discovery";

export const getBaseUrl = () => {
  return getServiceBaseUrl("web");
};

export const getApiBaseUrl = () => {
  return getServiceBaseUrl("api");
};
