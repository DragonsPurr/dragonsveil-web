import {
  createOvhS3Client,
  getOvhSiteAssetsBucket,
  isOvhSiteAssetsConfigured,
} from '@/app/lib/ovh-s3';
import { isAllowedSiteAssetObjectKey } from '@/app/lib/site-assets';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export { isOvhSiteAssetsConfigured };

export async function getOvhSiteAsset(
  objectKey: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  if (!isAllowedSiteAssetObjectKey(objectKey)) {
    throw new Error('Invalid object key.');
  }

  const bucket = getOvhSiteAssetsBucket();
  if (!bucket) {
    throw new Error('OVH site assets bucket is not configured.');
  }

  const client = createOvhS3Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  );

  if (!response.Body) {
    throw new Error('Object not found.');
  }

  const bytes = await response.Body.transformToByteArray();
  return {
    body: bytes,
    contentType: response.ContentType ?? 'application/octet-stream',
  };
}
