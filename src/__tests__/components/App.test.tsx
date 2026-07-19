import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App Component', () => {
  it('renders the application shell without crashing', () => {
    render(<App />);
    expect(screen.getAllByText(/StadiumIQ/i)[0]).toBeInTheDocument();
  });

  it('navigates between tabs correctly', () => {
    render(<App />);
    
    // Initial tab should be Command Center
    expect(screen.getByText('⚡ Command Center')).toBeInTheDocument();
    
    // Click on AI Navigator
    const navTab = screen.getByRole('tab', { name: /AI Stadium Navigator/i });
    fireEvent.click(navTab);
    
    // Verify AI Navigator is visible
    expect(screen.getByText('🧭 AI Navigator')).toBeInTheDocument();

    // Click on Fan Hub
    const fanHubTab = screen.getByRole('tab', { name: /Multilingual Fan Hub/i });
    fireEvent.click(fanHubTab);
    expect(screen.getByText('🌍 Fan Hub')).toBeInTheDocument();
  });

  it('renders stadium selector and changes stadium', () => {
    render(<App />);
    
    const selector = screen.getByLabelText(/Select FIFA World Cup 2026 stadium/i);
    expect(selector).toBeInTheDocument();
    
    fireEvent.change(selector, { target: { value: 'sofi-stadium' } });
    
    // The stadium name should update in the app header and info card
    expect(screen.getAllByText(/SoFi Stadium/i).length).toBeGreaterThan(0);
  });
});
