"use server";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { settings } from "@heiso/core/config";

const kExpiresIn = 5 * 60; // 5 min(對齊 assets-foundation §5)

let s3Client: S3Client | null = null;

export type Visibility = "public" | "private";

export async function initS3Client() {
  if (s3Client) return s3Client;

  const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_S3_REGION } = await settings();
  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AWS_S3_REGION) {
    throw new Error(
      "AWS_ACCESS_KEY or AWS_SECRET_KEY or AWS_S3_REGION is not set",
    );
  }

  s3Client = new S3Client({
    region: AWS_S3_REGION as string,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY as string,
      secretAccessKey: AWS_SECRET_KEY as string,
    },
  });

  return s3Client;
}

/**
 * 依 visibility 取對應 bucket name。
 * Phase B 過渡期:沒設新 env 時 fallback 到舊 `AWS_S3_BUCKET`(heiso-assets)。
 */
async function getBucketName(visibility: Visibility): Promise<string> {
  const s = await settings();

  if (visibility === "public") {
    const bucket = s.AWS_S3_BUCKET_PUBLIC ?? s.AWS_S3_BUCKET;
    if (!bucket) throw new Error("AWS_S3_BUCKET_PUBLIC is not set");
    return bucket as string;
  }

  // private
  const bucket = s.AWS_S3_BUCKET_PRIVATE;
  if (!bucket) throw new Error("AWS_S3_BUCKET_PRIVATE is not set");
  return bucket as string;
}

/**
 * 產 pre-signed PUT URL,給 client 直傳 S3 用。
 * Tenant 一律由 server 端 `process.env.TENANT_ID` 決定,client 無法干預(防偽造)。
 *
 * @param filename S3 key 後段(例:`{sha256}.jpg`),前面會加 `{tenant}/`
 * @param visibility 'public' (default) | 'private'
 */
export async function getPreSignedUrl(
  filename: string,
  visibility: Visibility = "public",
) {
  const s3Client = await initS3Client();
  const bucket = await getBucketName(visibility);

  const tenant = process.env.TENANT_ID ?? "test";
  const path = `${tenant}/${filename}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: path,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: kExpiresIn });

  return { path, url };
}

/**
 * 簽 GET URL,給 private bucket 走 server-side download 用。
 * 5 min 過期(對齊 PUT)。
 *
 * @param path       完整 S3 key(已含 `{tenant}/` 前綴,即 row 的 file.path)
 * @param visibility 'private' (default) | 'public' — public 通常走 CDN,不需要簽
 */
export async function getPreSignedDownloadUrl(
  path: string,
  visibility: Visibility = "private",
) {
  const s3Client = await initS3Client();
  const bucket = await getBucketName(visibility);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: path,
  });

  return getSignedUrl(s3Client, command, { expiresIn: kExpiresIn });
}
