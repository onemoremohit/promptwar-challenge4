import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StaffOps from '../../components/StaffOps';
import { FIFA_STADIUMS } from '../../data/stadiumData';

describe('StaffOps Component', () => {
  const mockStadium = FIFA_STADIUMS[0];

  it('renders staff ops dashboard', () => {
    render(<StaffOps selectedStadium={mockStadium} />);
    expect(screen.getByText('👷 Staff Ops')).toBeInTheDocument();
  });

  it('allows reporting an incident and displays it in the log', () => {
    render(<StaffOps selectedStadium={mockStadium} />);
    
    const input = screen.getByLabelText(/Describe the incident/i);
    const submitBtn = screen.getByRole('button', { name: /Classify with AI/i });
    
    fireEvent.change(input, { target: { value: 'Fire reported in the kitchen' } });
    fireEvent.click(submitBtn);
    
    expect(screen.getByText('Fire reported in the kitchen')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('🔺 Escalate to Security')).toBeInTheDocument();
  });

  it('allows adjusting sustainability metrics', () => {
    render(<StaffOps selectedStadium={mockStadium} />);
    
    const slider = screen.getByLabelText(/Adjust Renewable Energy \(%\)/i);
    fireEvent.change(slider, { target: { value: '100' } });
    
    expect(slider).toHaveValue('100');
  });
});
