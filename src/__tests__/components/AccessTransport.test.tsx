import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AccessTransport from '../../components/AccessTransport';
import { FIFA_STADIUMS } from '../../data/stadiumData';

describe('AccessTransport Component', () => {
  const mockStadium = FIFA_STADIUMS[0];

  it('renders accessibility and transport hub', () => {
    render(<AccessTransport selectedStadium={mockStadium} />);
    expect(screen.getByText('♿ Access & Transport')).toBeInTheDocument();
  });

  it('changes mobility need and updates AI route', () => {
    render(<AccessTransport selectedStadium={mockStadium} />);
    
    const wheelchairBtn = screen.getByRole('radio', { name: /Wheelchair \/ Mobility Aid/i });
    fireEvent.click(wheelchairBtn);
    
    // Check if the route updates
    expect(screen.getByText(/Use accessible entrance at Gate A-North/i)).toBeInTheDocument();
  });

  it('allows user to book accessible assistance', () => {
    render(<AccessTransport selectedStadium={mockStadium} />);
    
    const select = screen.getByLabelText(/Select your arrival time for assistance/i);
    fireEvent.change(select, { target: { value: '14:00' } });
    
    expect(screen.getByText(/Assistance request noted for/i)).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });
});
