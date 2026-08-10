import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';
import type { NavSocialLink } from '@/app/lib/site-settings';

const sampleSocialLinks: NavSocialLink[] = [
  {
    _key: 'ig',
    label: 'Instagram',
    url: 'https://instagram.com/dragonsveil',
    iconSrc:
      'https://cdn.brandfetch.io/domain/instagram.com/w/64/h/64/theme/light/type/icon/fallback/transparent.png?c=test',
    iconSvgSrc:
      'https://cdn.brandfetch.io/domain/instagram.com/theme/light/type/symbol/fallback/transparent.svg?c=test',
    iconSource: 'brandfetch',
  },
  {
    _key: 'custom',
    label: 'Discord',
    url: 'https://discord.gg/example',
    iconSrc: 'https://cdn.sanity.io/images/example/discord.png',
    iconSvgSrc: null,
    iconSource: 'custom',
  },
];

describe('Navigation', () => {
  it('renders the logo with correct alt text', () => {
    render(<Navigation />);
    expect(screen.getByAltText("Dragon's Veil Creations")).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^shop$/i })).toBeInTheDocument();
  });

  it('links to correct internal paths', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /^shop$/i })).toHaveAttribute('href', '/shop');
  });

  it('Shop link is an internal route (not external)', () => {
    render(<Navigation />);
    const shopLink = screen.getByRole('link', { name: /^shop$/i });
    expect(shopLink).not.toHaveAttribute('target', '_blank');
  });

  it('does not render social links when the list is empty', () => {
    render(<Navigation socialLinks={[]} />);
    expect(screen.queryByRole('list', { name: /social links/i })).not.toBeInTheDocument();
  });

  it('renders social links when provided', () => {
    render(<Navigation socialLinks={sampleSocialLinks} />);
    const ig = screen.getByRole('link', { name: 'Instagram' });
    const discord = screen.getByRole('link', { name: 'Discord' });
    expect(ig).toHaveAttribute('href', 'https://instagram.com/dragonsveil');
    expect(ig).toHaveAttribute('target', '_blank');
    expect(discord).toHaveAttribute('href', 'https://discord.gg/example');
    expect(screen.getByRole('list', { name: /social links/i })).toBeInTheDocument();
  });
});
