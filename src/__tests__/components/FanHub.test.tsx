import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FanHub from '../../components/FanHub';
import { FIFA_STADIUMS } from '../../data/stadiumData';

describe('FanHub Component', () => {
  const mockStadium = FIFA_STADIUMS[0];

  it('renders multilingual fan hub', () => {
    render(<FanHub selectedStadium={mockStadium} />);
    expect(screen.getByText('🌍 Fan Hub')).toBeInTheDocument();
    expect(screen.getByText(/Select Your Language/i)).toBeInTheDocument();
  });

  it('changes language when language button is clicked', () => {
    render(<FanHub selectedStadium={mockStadium} />);
    
    const espanolBtn = screen.getByRole('radio', { name: /Select Spanish language/i });
    fireEvent.click(espanolBtn);
    
    // Check if the prompt changes to Spanish
    expect(screen.getByText(/El asistente de IA está listo para ayudarte/i)).toBeInTheDocument();
  });

  it('handles sending a message via quick prompt', async () => {
    render(<FanHub selectedStadium={mockStadium} />);
    
    const promptBtn = screen.getByText('Where can I park?');
    fireEvent.click(promptBtn);
    
    // Should show user message
    expect(screen.getByText('Where can I park?')).toBeInTheDocument();
    
    // Should show typing indicator initially
    expect(screen.getByLabelText('AI is generating response')).toBeInTheDocument();
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.queryByLabelText('AI is generating response')).not.toBeInTheDocument();
    });
  });
});
