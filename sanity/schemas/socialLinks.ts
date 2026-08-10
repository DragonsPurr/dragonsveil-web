import { BrandfetchIconInput } from '../components/BrandfetchIconInput';
import { SocialLinkNavPreview } from '../components/SocialLinkNavPreview';

export const socialLinks = {
  name: 'socialLinks',
  title: 'Social Links',
  type: 'document',
  fields: [
    {
      name: 'items',
      title: 'Links',
      type: 'array',
      description:
        'Shown as icons on the right side of the top navigation. Order here is the display order.',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          title: 'Social link',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Accessible name for the link (e.g. Instagram).',
              validation: (Rule: { required: () => unknown }) => Rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Profile or page URL.',
              validation: (Rule: {
                required: () => { uri: (opts: { scheme: string[] }) => unknown };
              }) =>
                Rule.required().uri({
                  scheme: ['http', 'https'],
                }),
            },
            {
              name: 'brandDomain',
              title: 'Brand domain',
              type: 'string',
              description:
                'Optional Brandfetch domain override (e.g. discord.com when the URL uses discord.gg). Leave empty to use the hostname from the URL.',
            },
            {
              name: 'brandfetchIcon',
              title: 'Brandfetch icon',
              type: 'object',
              description:
                'Pick which Brandfetch asset to use. Leave empty for automatic selection.',
              components: {
                input: BrandfetchIconInput,
              },
              fields: [
                {
                  name: 'type',
                  title: 'Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Icon', value: 'icon' },
                      { title: 'Symbol', value: 'symbol' },
                      { title: 'Logo', value: 'logo' },
                    ],
                  },
                },
                {
                  name: 'theme',
                  title: 'Theme',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Dark', value: 'dark' },
                      { title: 'Light', value: 'light' },
                    ],
                  },
                },
                {
                  name: 'format',
                  title: 'Format',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'SVG', value: 'svg' },
                      { title: 'PNG', value: 'png' },
                      { title: 'JPEG', value: 'jpeg' },
                    ],
                  },
                },
              ],
            },
            {
              name: 'customIcon',
              title: 'Custom icon',
              type: 'image',
              description:
                'Optional replacement for the Brandfetch icon. Prefer a square PNG or SVG.',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                  description: 'Describe the icon if it differs from the link label.',
                },
              ],
            },
            {
              name: 'desaturateToWhite',
              title: 'Desaturate to white',
              type: 'boolean',
              description:
                'When on, the icon is forced to white in the nav (and purple on hover). Turn off to keep Brandfetch/custom colors.',
              initialValue: true,
            },
            {
              name: 'navPreview',
              title: 'Nav preview',
              type: 'string',
              readOnly: true,
              description: 'How this icon will look in the site navigation.',
              components: {
                input: SocialLinkNavPreview,
              },
            },
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
              media: 'customIcon',
            },
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Social Links',
        subtitle: 'Top navigation icons',
      };
    },
  },
};
