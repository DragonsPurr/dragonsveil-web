'use client';

import { externalLinkAttributes, logoTypes } from '@/app/lib/constants';
import type { NavSocialLink } from '@/app/lib/site-settings';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/shop', label: 'Shop' },
  { href: '/contact', label: 'Contact' },
];

type NavigationProps = {
  /** When true, sticky positioning is handled by a parent header (e.g. shop sub-nav). */
  embedded?: boolean;
  socialLinks?: NavSocialLink[];
};

function SocialIconImage({
  candidates,
  desaturateToWhite,
}: {
  candidates: string[];
  desaturateToWhite: boolean;
}) {
  const [index, setIndex] = useState(0);
  const src = candidates[index];
  if (!src) return null;

  return (
    // Brandfetch CDN must be hotlinked; do not route through next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt=""
      width={24}
      height={24}
      className={`w-5 h-5 md:w-6 md:h-6 object-contain bg-transparent${
        desaturateToWhite ? ' dp-nav-social-icon' : ''
      }`}
      loading="lazy"
      decoding="async"
      onError={() => {
        setIndex((current) => (current + 1 < candidates.length ? current + 1 : current));
      }}
    />
  );
}

function SocialIcons({ links }: { links: NavSocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="flex items-center gap-2 shrink-0 m-0 p-0 list-none" aria-label="Social links">
      {links.map((link) => (
        <li key={link._key} className="m-0 p-0">
          <a
            href={link.url}
            aria-label={link.label}
            title={link.label}
            className={`inline-flex items-center justify-center w-6 h-6 bg-transparent opacity-80 hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-(--dv-light-purple) rounded-sm${
              link.desaturateToWhite ? ' dp-nav-social-link' : ''
            }`}
            {...externalLinkAttributes}
          >
            <SocialIconImage
              candidates={link.iconCandidates}
              desaturateToWhite={link.desaturateToWhite}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Navigation({ embedded = false, socialLinks = [] }: NavigationProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile && menuOpen) setMenuOpen(false);
  }, [isMobile, menuOpen]);

  const isActive = (href: string) => {
    if (pathname == null) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const linkClass = (active: boolean) =>
    active
      ? 'text-(--dv-light-purple) no-underline hover:text-(--dv-light-purple) focus:text-(--dv-light-purple)'
      : 'dp-link';

  const renderNavLink = (href: string, label: string) => {
    const active = isActive(href);

    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={linkClass(active)}
      >
        {label}
      </Link>
    );
  };

  const navLinksContent = <>{navLinks.map(({ href, label }) => renderNavLink(href, label))}</>;

  return (
    <nav
      className={`bg-black w-full flex justify-center py-1 md:py-1.5 md:pr-12 px-3 md:px-0 ${
        embedded ? '' : 'sticky top-0 z-50 border-b-2 border-(--dv-light-purple)'
      }`}
    >
      <div className="w-full max-w-7xl flex items-center justify-between gap-2 md:gap-3">
        <div className="flex flex-row items-center gap-2 md:gap-4 min-w-0">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={logoTypes.wide_for_dark_bkgds}
              alt="Dragon's Veil Creations"
              className="w-24 sm:w-32 md:w-40 h-auto"
              width={400}
              height={400}
              priority
            />
          </Link>
          <span className="hidden lg:inline text-base font-bold whitespace-nowrap leading-none">
            a{' '}
            <a href="https://dragonspurr.ca" className="dp-link" {...externalLinkAttributes}>
              Dragon&apos;s Purr
            </a>{' '}
            Brand
          </span>
        </div>

        {!isMobile && (
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="dp-nav-item">{navLinksContent}</div>
            <SocialIcons links={socialLinks} />
          </div>
        )}

        {isMobile && (
          <div className="flex items-center gap-2 shrink-0">
            <SocialIcons links={socialLinks} />
            <div className="relative">
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center w-7 h-7 p-0 rounded-sm border border-(--dv-light-purple) hover:bg-red-950/40 focus:outline-hidden focus:ring-2 focus:ring-(--dv-light-purple) shrink-0"
              >
                <span className="sr-only">Menu</span>
                <span aria-hidden className="flex flex-col justify-between w-4 h-3 leading-none">
                  <span className="block w-full h-0.5 bg-white flex-none" />
                  <span className="block w-full h-0.5 bg-white flex-none" />
                  <span className="block w-full h-0.5 bg-white flex-none" />
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-max max-w-[80vw] rounded-lg border border-(--dv-light-purple) bg-black/95 px-4 py-3 flex flex-col gap-3 text-left">
                  <div className="flex flex-col gap-3 items-start">
                    {navLinks.map(({ href, label }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          aria-current={active ? 'page' : undefined}
                          className={`${linkClass(active)} self-start whitespace-nowrap text-sm md:text-base`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
