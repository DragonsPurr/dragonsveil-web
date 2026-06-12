import type { ReactNode } from 'react';

export const portfolioItem = {
  name: 'portfolioItem',
  title: 'Portfolio Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Caption or title for the image (used as alt text).',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Description for the image (used as caption).',
    },
    {
      name: 'url',
      title: 'Project URL',
      type: 'url',
      description: 'Optional external link shown in the portfolio lightbox.',
    },
  ],
  preview: {
    select: { title: 'title', media: 'image' },
    prepare({ title, media }: { title?: string | null; media?: unknown }) {
      return {
        title: title || 'Untitled',
        media: media as ReactNode,
      };
    },
  },
};
