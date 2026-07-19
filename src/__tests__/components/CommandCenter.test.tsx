import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommandCenter from '../../components/CommandCenter';
import { FIFA_STADIUMS } from '../../data/stadiumData';

describe('CommandCenter Component', () => {
  const mockStadium = FIFA_STADIUMS[0];
  const mockOnStadiumChange = vi.fn();
  const mockOnNavigate = vi.fn();
  const mockOccupancies = { 'A': 10000 };

  it('renders command center dashboard', () => {
    render(
      <CommandCenter 
        selectedStadium={mockStadium} 
        onStadiumChange={mockOnStadiumChange}
        zoneOccupancies={mockOccupancies}
        onNavigate={mockOnNavigate}
      />
    );
    expect(screen.getByText('⚡ Command Center')).toBeInTheDocument();
    expect(screen.getByText('AI Situation Brief')).toBeInTheDocument();
  });

  it('calls onNavigate when quick actions are clicked', () => {
    render(
      <CommandCenter 
        selectedStadium={mockStadium} 
        onStadiumChange={mockOnStadiumChange}
        zoneOccupancies={mockOccupancies}
        onNavigate={mockOnNavigate}
      />
    );
    
    const fanHubBtn = screen.getByRole('button', { name: /Go to 🌍 Fan Hub/i });
    fireEvent.click(fanHubBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith('fanhub');
  });
});
