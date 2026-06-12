import { render, screen } from '@testing-library/react';
import Contact from '@/app/contact/page';

describe('Contact page', () => {
  it('renders page heading and intro', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByText(/want to reach us/i)).toBeInTheDocument();
  });

  it('renders phone link with tel href', () => {
    render(<Contact />);
    const phoneLink = screen.getByRole('link', { name: /\+1 \(416\) 555-1234/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:14165551234');
  });

  it('renders support email links', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: /product support/i })).toHaveAttribute(
      'href',
      expect.stringContaining('productsupport@dragonspurr.ca')
    );
    expect(screen.getByRole('link', { name: /general inquiries/i })).toHaveAttribute(
      'href',
      expect.stringContaining('info@dragonsveil.ca')
    );
    expect(screen.getByRole('link', { name: /billing inquiries/i })).toHaveAttribute(
      'href',
      expect.stringContaining('billing@dragonspurr.ca')
    );
  });

  it('renders business hours', () => {
    render(<Contact />);
    expect(screen.getByText(/monday - friday: 9:00 am - 5:00 pm/i)).toBeInTheDocument();
  });
});
