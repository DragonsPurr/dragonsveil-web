import { siteInfo } from '@/app/lib/constants';
import type { Metadata } from 'next';
import { BoxIcon } from '@/components/icons/BoxIcon';
import { boxiconsContactPhone, boxiconsContactEmail } from '@/components/icons/boxicons-contact';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${siteInfo.name}.`,
};

const phoneHref = `tel:${siteInfo.phone.replace(/\D/g, '')}`;
const productSupportMailto = `mailto:${siteInfo.productSupportEmail}?subject=${encodeURIComponent('Product support request')}`;
const generalInquiryMailto = `mailto:${siteInfo.generalInquiryEmail}?subject=${encodeURIComponent('General inquiry')}`;
const billingInquiryMailto = `mailto:${siteInfo.billingInquiryEmail}?subject=${encodeURIComponent('Billing inquiry')}`;

export default function Contact() {
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="dp-page-header">Get in touch</h1>
      <p className="dp-body-text text-gray-300 mb-8 md:mb-10">
        Want to reach us? We&apos;d love to hear from you. Here&apos;s how you can get in touch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-lg border border-(--dv-gray-600) bg-black/40 p-6 md:p-8 space-y-4">
          <div className="flex justify-center">
            <BoxIcon icon={boxiconsContactPhone} width="4rem" height="4rem" />
          </div>
          <div className="flex justify-center">
            <h2 className="font-cinzel_decorative text-2xl text-(--dv-light-purple)">
              Talk to us
            </h2>
          </div>
          <p className="font-cormorant_garamond text-lg md:text-xl text-gray-300">
            Questions about our shop, custom work, or an existing order? Give us a call during
            business hours.
          </p>
          <p>
            <a href={phoneHref} className="dp-link font-cinzel text-xl md:text-2xl">
              {siteInfo.phone}
            </a>
          </p>
          <p className="font-cormorant_garamond text-base text-gray-400">{siteInfo.hours}</p>
        </section>

        <section className="rounded-lg border border-(--dv-gray-600) bg-black/40 p-6 md:p-8 space-y-4 flex flex-col">
          <div className="flex justify-center">
            <BoxIcon icon={boxiconsContactEmail} width="4rem" height="4rem" />
          </div>
          <div className="flex justify-center">
            <h2 className="font-cinzel_decorative text-2xl text-(--dv-light-purple)">
              Contact support
            </h2>
          </div>
          <p className="font-cormorant_garamond text-lg md:text-xl text-gray-300 flex-1">
            Need help with an order, shipping, or your account? Send us a message and we&apos;ll get
            back to you as soon as we can.
          </p>
          <a href={productSupportMailto} className="dp-form-button inline-block text-center w-fit">
            Product Support
          </a>
          <a href={generalInquiryMailto} className="dp-form-button inline-block text-center w-fit">
            General Inquiries
          </a>
          <a href={billingInquiryMailto} className="dp-form-button inline-block text-center w-fit">
            Billing Inquiries
          </a>
        </section>
      </div>
    </div>
  );
}
