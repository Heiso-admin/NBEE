import { Elysia } from "elysia";
import { getPortalSetting } from "./site.service";

export const siteRoute = new Elysia({
  name: "siteRoute",
  prefix: "/site",
}).get("/", () => getPortalSetting());
