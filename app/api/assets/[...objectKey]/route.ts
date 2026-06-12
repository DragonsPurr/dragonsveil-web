import { getOvhSiteAsset, isOvhSiteAssetsConfigured } from '@/app/lib/ovh-site-assets';
import { isAllowedSiteAssetObjectKey } from '@/app/lib/site-assets';

type RouteContext = {
  params: Promise<{ objectKey: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isOvhSiteAssetsConfigured()) {
    return new Response('Not configured', { status: 503 });
  }

  const { objectKey: segments } = await context.params;
  const objectKey = decodeURIComponent(segments.join('/'));

  if (!isAllowedSiteAssetObjectKey(objectKey)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const asset = await getOvhSiteAsset(objectKey);
    return new Response(Buffer.from(asset.body), {
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
