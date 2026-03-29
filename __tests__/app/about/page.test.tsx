/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import { getAboutPageContent } from '@/app/lib/about';
import About from '@/app/about/page';

jest.mock('@portabletext/react', () => ({
  PortableText: () => <span data-testid="portable-text-placeholder" />,
}));

jest.mock('@/app/lib/sanity', () => ({
  sanityClient: {},
  urlFor: jest.fn(() => ({
    width: () => ({
      height: () => ({
        fit: () => ({
          url: () => 'https://example.com/sanity-image.jpg',
        }),
      }),
    }),
  })),
  isSanityConfigured: jest.fn(() => false),
}));

jest.mock('@/app/lib/about', () => ({
  getAboutPageContent: jest.fn(),
  resolvePortraitAlt: () => 'Kayt and Ryan',
  defaultSectionTitle: (text: string) => [
    {
      _type: 'block',
      _key: 'mock-title',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 'mock-span', text, marks: [] }],
    },
  ],
}));

const mockGetAboutPageContent = getAboutPageContent as jest.MockedFunction<typeof getAboutPageContent>;

async function renderAboutPage() {
  const ui = await About();
  render(ui);
}

describe('About page', () => {
  beforeEach(() => {
    mockGetAboutPageContent.mockResolvedValue(null);
  });

  it('renders the profile image with correct alt text', async () => {
    await renderAboutPage();
    const img = screen.getByRole('img', { name: /kayt and ryan/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Kayt and Ryan');
  });

  it('profile image has correct src', async () => {
    await renderAboutPage();
    const img = screen.getByRole('img', { name: /ryan/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('kayt-and-ryan.png'));
  });

  it('renders the bio text', async () => {
    await renderAboutPage();
    expect(screen.getByText(/hi! we're kayt and ryan!/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /we started dragon's purr for a bunch of different reasons, but chief among them was a desire to share our creativity with the world, and to make dorky little trinkets that folks like us would find funny, charming, and above all, inclusive; it's our hope that you'll find a bit of yourselves in our quirky designs./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /beyond that, we believe in helping out where we can, and championing causes close to our hearts, both through the art we make, and through direct support in the form of charitable donations which come from the sale of that same art./i,
      ),
    ).toBeInTheDocument();
  });
});
