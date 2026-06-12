import {
  buildPublicObjectUrl,
  getCustomerAvatarProxyUrl,
  isAllowedAvatarUrl,
} from '@/app/lib/customer-avatar';

describe('customer-avatar', () => {
  it('accepts avatar URLs on the OVH user-assets bucket under /avatars/', () => {
    const url = 'https://dp-user-assets.s3.ca-east-tor.io.cloud.ovh.net/avatars/cus_1/123.jpg';
    expect(isAllowedAvatarUrl(url)).toBe(true);
    expect(
      getCustomerAvatarProxyUrl({ metadata: { avatar_url: url } })
    ).toBe('/api/shop/avatar/avatars/cus_1/123.jpg');
  });

  it('rejects external avatar URLs', () => {
    expect(
      isAllowedAvatarUrl('https://evil.example/avatars/x.jpg')
    ).toBe(false);
    expect(
      getCustomerAvatarProxyUrl({ metadata: { avatar_url: 'https://evil.example/x.jpg' } })
    ).toBeNull();
  });

  it('builds public object URLs', () => {
    expect(buildPublicObjectUrl('avatars/cus_1/1.jpg')).toBe(
      'https://dp-user-assets.s3.ca-east-tor.io.cloud.ovh.net/avatars/cus_1/1.jpg'
    );
  });
});
