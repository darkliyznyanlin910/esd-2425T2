import { getServiceBaseUrl } from "@repo/service-discovery";

export const getBaseUrl = () => {
  return getServiceBaseUrl("web");
};
