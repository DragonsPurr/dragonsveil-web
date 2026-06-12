import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders the main tagline', () => {
    render(<Home />);
    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dragon's Veil Creations/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/masquerade masks, fascinators, and various other accessories/i)
    ).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<Home />);
    expect(screen.getByAltText("Dragon's Veil Creations logo")).toBeInTheDocument();
  });

  it('logo has correct src', () => {
    render(<Home />);
    const img = screen.getByRole('img', { name: /dragon's veil creations logo/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('square-logo-for-dark-bkgds.png'));
  });
});
