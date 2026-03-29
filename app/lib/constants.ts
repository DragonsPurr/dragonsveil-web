const envConfig = {
  emailjs: {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    userId: process.env.NEXT_PUBLIC_EMAILJS_USER_ID,
  },
  umamiAnalyticsId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
};

const asset_base_url = "https://dp-dv-assets.tor1.digitaloceanspaces.com";

const externalLinkAttributes = { target: "_blank", rel: "noreferrer" as const };

const siteInfo = {
  name: "Dragon's Veil Creations",
  url: "https://dragonsveil.ca",
  email: "info@dragonsveil.ca",
  phone: "+1 (416) 555-1234",
  address: "608-26 Carluke Crescent, Toronto, ON M2L 2J2",
  hours: "Monday - Friday: 9:00 AM - 5:00 PM",
  description: "Dragon's Veil is a Toronto-Based Creative Duo that makes things",
};

const socialMedia = {
  bluesky: "https://bsky.app/profile/dragonspurr.bsky.social",
  heycafe: "https://hey.cafe/@dragonspurr",
  eh: "https://ehnw.ca/u/dragonspurr",
  instagram: "https://www.instagram.com/dragonspurr",
  facebook: "https://www.facebook.com/dragonspurr",
};

const logoTypes = {
  vertical_for_dark_bkgds: `${asset_base_url}/brand/vert-logo_dark-bkgd.png`,
  square: `${asset_base_url}/brand/square-logo.png`,
  square_for_dark_bkgds: `${asset_base_url}/brand/square-logo-for-dark-bkgds.png`,
  square_no_text: `${asset_base_url}/brand/square-logo-no-text.png`,
  wide_for_dark_bkgds: `${asset_base_url}/brand/wide-logo_dark-bkgd.png`,
  wide: `${asset_base_url}/brand/wide-logo.png`,
  publication_banner: `${asset_base_url}/brand/publication-banner.png`,
  hipsterdonut_logo: `${asset_base_url}/brand/hipsterdonut-logo-wide.png`,
};

export { asset_base_url, externalLinkAttributes, logoTypes, siteInfo, socialMedia, envConfig };
