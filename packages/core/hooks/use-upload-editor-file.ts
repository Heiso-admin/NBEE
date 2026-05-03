import { ourFileRouter } from "@heiso/core/lib/upload-router";
import { useUploadS3File } from "./use-upload-s3-file";

// tenant 由 server-side env(TENANT_ID)決定;CDN host 由 NEXT_PUBLIC_CDN_URL 決定
export const useUploadEditorFile = () => {
  return useUploadS3File({
    router: ourFileRouter,
    endpoint: "editor",
  });
};
