import {
  buildCustomerAvatarObjectKey,
  buildPublicObjectUrl,
  extensionForAvatarMime,
  isAllowedAvatarObjectKey,
} from '@/app/lib/customer-avatar';
import {
  createOvhS3Client,
  getOvhUserAssetsBucket,
  isOvhUserAssetsConfigured,
} from '@/app/lib/ovh-s3';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export { isOvhUserAssetsConfigured };

export async function uploadCustomerAvatarToOvh(
  customerId: string,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  const bucket = getOvhUserAssetsBucket();
  if (!bucket) {
    throw new Error('OVH user assets bucket is not configured.');
  }

  const extension = extensionForAvatarMime(contentType);
  if (!extension) {
    throw new Error('Unsupported image type.');
  }

  const key = buildCustomerAvatarObjectKey(customerId, extension);
  const client = createOvhS3Client();

  const putInput = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  };

  try {
    await client.send(new PutObjectCommand({ ...putInput, ACL: 'public-read' }));
  } catch {
    await client.send(new PutObjectCommand(putInput));
  }

  return buildPublicObjectUrl(key);
}

export async function getOvhUserAsset(
  objectKey: string
): Promise<{ body: Uint8Array; contentType: string }> {
  if (!isAllowedAvatarObjectKey(objectKey)) {
    throw new Error('Invalid object key.');
  }

  const bucket = getOvhUserAssetsBucket();
  if (!bucket) {
    throw new Error('OVH user assets bucket is not configured.');
  }

  const client = createOvhS3Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    })
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
