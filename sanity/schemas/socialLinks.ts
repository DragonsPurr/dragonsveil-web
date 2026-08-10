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
