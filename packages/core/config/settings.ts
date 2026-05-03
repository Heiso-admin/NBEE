import { cache } from "react";
import { getSystemSettings } from "@heiso/core/server/services/system/setting";
import { getSiteSettings } from "@heiso/core/server/site.service";
import type { Settings } from "@heiso/core/types/system";

export const settings = cache(async (withoutKey: boolean = false): Promise<Settings> => {
  const data = await getSystemSettings(withoutKey);
  // Prefer environment variable if set
  if (process.env.NOTIFY_EMAIL) {
    data["NOTIFY_EMAIL"] = process.env.NOTIFY_EMAIL;
  }
  if (process.env.RESEND_API_KEY) {
    data["RESEND_API_KEY"] = process.env.RESEND_API_KEY;
  }
  if (process.env.NBEE_AWS_ACCESS_KEY) {
    data["AWS_ACCESS_KEY"] = process.env.NBEE_AWS_ACCESS_KEY;
  }
  if (process.env.NBEE_AWS_SECRET_KEY) {
    data["AWS_SECRET_KEY"] = process.env.NBEE_AWS_SECRET_KEY;
  }
  if (process.env.NBEE_AWS_S3_REGION) {
    data["AWS_S3_REGION"] = process.env.NBEE_AWS_S3_REGION;
  }
  if (process.env.NBEE_AWS_S3_BUCKET) {
    data["AWS_S3_BUCKET"] = process.env.NBEE_AWS_S3_BUCKET;
  }
  // assets-foundation:public + private buckets
  if (process.env.NBEE_AWS_S3_BUCKET_PUBLIC) {
    data["AWS_S3_BUCKET_PUBLIC"] = process.env.NBEE_AWS_S3_BUCKET_PUBLIC;
  }
  if (process.env.NBEE_AWS_S3_BUCKET_PRIVATE) {
    data["AWS_S3_BUCKET_PRIVATE"] = process.env.NBEE_AWS_S3_BUCKET_PRIVATE;
  }
  return data;
});

export const site = cache((): Promise<Settings> => {
  return getSiteSettings() as Promise<Settings>;
});
