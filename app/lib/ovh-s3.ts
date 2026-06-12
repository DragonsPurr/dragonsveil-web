import { S3Client } from '@aws-sdk/client-s3';

export function getOvhS3Credentials() {
  const endpoint = process.env.OVH_S3_ENDPOINT?.trim();
  const region = process.env.OVH_S3_REGION?.trim() || 'ca-east-tor';
  const accessKeyId = process.env.OVH_S3_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.OVH_S3_SECRET_KEY?.trim();

  return { endpoint, region, accessKeyId, secretAccessKey };
}

export function isOvhS3Configured(): boolean {
  const { endpoint, accessKeyId, secretAccessKey } = getOvhS3Credentials();
  return Boolean(endpoint && accessKeyId && secretAccessKey);
}

export function getOvhUserAssetsBucket(): string | undefined {
  return process.env.OVH_USER_ASSETS_S3_BUCKET?.trim();
}

export function getOvhSiteAssetsBucket(): string | undefined {
  return process.env.OVH_SITE_ASSETS_S3_BUCKET?.trim();
}

export function isOvhUserAssetsConfigured(): boolean {
  return isOvhS3Configured() && Boolean(getOvhUserAssetsBucket());
}

export function isOvhSiteAssetsConfigured(): boolean {
  return isOvhS3Configured() && Boolean(getOvhSiteAssetsBucket());
}

export function createOvhS3Client(): S3Client {
  const { endpoint, region, accessKeyId, secretAccessKey } = getOvhS3Credentials();
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('OVH S3 storage is not configured.');
  }

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });
}
