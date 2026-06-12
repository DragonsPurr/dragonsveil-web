import { buildSiteAssetUrl, SITE_ASSETS_PROXY_BASE } from './site-assets';

const asset_base_url = SITE_ASSETS_PROXY_BASE;

const externalLinkAttributes = { target: '_blank', rel: 'noreferrer' as const };

const siteInfo = {
  name: "Dragon's Veil Creations",
  url: 'https://dragonsveil.ca',
  email: 'info@dragonsveil.ca',
  productSupportEmail: 'productsupport@dragonspurr.ca',
  generalInquiryEmail: 'info@dragonsveil.ca',
  billingInquiryEmail: 'billing@dragonspurr.ca',
  phone: '+1 (416) 555-1234',
  address: '608-26 Carluke Crescent, Toronto, ON M2L 2J2',
  hours: 'Monday - Friday: 9:00 AM - 5:00 PM',
  description: "Dragon's Veil is a Toronto-Based Creative Duo that makes things",
};

const socialMedia = {
  bluesky: 'https://bsky.app/profile/dragonspurr.bsky.social',
  heycafe: 'https://hey.cafe/@dragonspurr',
  eh: 'https://ehnw.ca/u/dragonspurr',
  instagram: 'https://www.instagram.com/dragonspurr',
  facebook: 'https://www.facebook.com/dragonspurr',
};

const logoTypes = {
  circular_white: buildSiteAssetUrl('brand/dragonsveil_vert-white-bkgd.png'),
  circular_black: buildSiteAssetUrl('brand/dragonsveil_vert-black-bkgd.png'),
  square: buildSiteAssetUrl('brand/dragonsveil_vert-light-bkgd.png'),
  square_for_dark_bkgds: buildSiteAssetUrl('brand/dragonsveil_vert-dark-bkgd.png'),
  square_no_text: buildSiteAssetUrl('brand/dragonsveil_vert-no-text.png'),
  wide_for_dark_bkgds: buildSiteAssetUrl('brand/dragonsveil_wide-dark-bkgd.png'),
  wide: buildSiteAssetUrl('brand/dragonsveil_vert-light-bkgd.png'),
  publication_banner: buildSiteAssetUrl('brand/publication-banner.png'),
  hipsterdonut_logo: buildSiteAssetUrl('brand/dragonsveil_hipsterdonut-logo-wide.png'),
};

export { asset_base_url, externalLinkAttributes, logoTypes, siteInfo, socialMedia };
