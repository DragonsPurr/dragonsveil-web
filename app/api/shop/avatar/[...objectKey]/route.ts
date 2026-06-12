import { isAllowedAvatarObjectKey } from '@/app/lib/customer-avatar';
import { getOvhUserAsset, isOvhUserAssetsConfigured } from '@/app/lib/ovh-user-assets';

type RouteContext = {
  params: Promise<{ objectKey: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isOvhUserAssetsConfigured()) {
    return new Response('Not configured', { status: 503 });
  }

  const { objectKey: segments } = await context.params;
  const objectKey = decodeURIComponent(segments.join('/'));

  if (!isAllowedAvatarObjectKey(objectKey)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const asset = await getOvhUserAsset(objectKey);
    return new Response(Buffer.from(asset.body), {
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
