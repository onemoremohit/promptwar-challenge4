import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CrowdIntelligence from '../../components/CrowdIntelligence';
import { FIFA_STADIUMS } from '../../data/stadiumData';

describe('CrowdIntelligence Component', () => {
  const mockStadium = FIFA_STADIUMS[0];
  const mockZoneOccupancies = { 'A': 15000 };
  const mockOnOccupancyChange = vi.fn();

  it('renders crowd intelligence dashboard', () => {
    render(
      <CrowdIntelligence 
        selectedStadium={mockStadium} 
        zoneOccupancies={mockZoneOccupancies}
        onOccupancyChange={mockOnOccupancyChange}
      />
    );
    expect(screen.getByText('👥 Crowd Intelligence')).toBeInTheDocument();
  });

  it('triggers evacuation plan and shows modal', () => {
    render(
      <CrowdIntelligence 
        selectedStadium={mockStadium} 
        zoneOccupancies={{ 'A': mockStadium.zones[0].capacity }} // Max capacity to trigger critical
        onOccupancyChange={mockOnOccupancyChange}
      />
    );
    
    // Find the evac trigger button for the critical zone
    const triggerBtns = screen.getAllByRole('button', { name: /Generate evacuation plan/i });
    fireEvent.click(triggerBtns[0]);
    
    // Modal should appear
    expect(screen.getByRole('dialog', { name: /AI Evacuation Plan/i })).toBeInTheDocument();
    
    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close evacuation plan/i });
    fireEvent.click(closeBtn);
    
    expect(screen.queryByRole('dialog', { name: /AI Evacuation Plan/i })).not.toBeInTheDocument();
  });
});
