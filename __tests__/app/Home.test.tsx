import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders the main tagline', () => {
    render(<Home />);
    expect(
      screen.getByText(/Welcome to Dragon's Purr Crafts and Sundry/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Toronto-Based creative duo that makes quirky, bespoke crafts/i)
    ).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<Home />);
    expect(screen.getByAltText("Dragon's Purr Crafts and Sundry logo")).toBeInTheDocument();
  });

  it('logo has correct src', () => {
    render(<Home />);
    const img = screen.getByRole('img', { name: /dragon's purr crafts and sundry logo/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('square-logo-for-dark-bkgds.png'));
  });
});
