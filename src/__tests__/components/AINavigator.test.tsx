import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AINavigator from '../../components/AINavigator';
import { FIFA_STADIUMS } from '../../data/stadiumData';

describe('AINavigator Component', () => {
  const mockStadium = FIFA_STADIUMS[0];

  it('renders chat interface with welcome message', () => {
    render(<AINavigator selectedStadium={mockStadium} crowdTier="Low" />);
    expect(screen.getByText('🧭 AI Navigator')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to /i)).toBeInTheDocument();
  });

  it('handles user input and sends message', async () => {
    render(<AINavigator selectedStadium={mockStadium} crowdTier="Moderate" />);
    
    const input = screen.getByPlaceholderText(/Ask anything/i);
    const sendBtn = screen.getByRole('button', { name: /Send navigation query/i });
    
    fireEvent.change(input, { target: { value: 'Where is the exit?' } });
    fireEvent.click(sendBtn);
    
    expect(screen.getByText('Where is the exit?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/Route:/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('handles quick prompts', async () => {
    render(<AINavigator selectedStadium={mockStadium} crowdTier="High" />);
    
    const promptBtn = screen.getByRole('button', { name: /Where is the nearest restroom/i });
    fireEvent.click(promptBtn);
    
    // Original prompt contains emoji which is sliced off, so we check for the text part
    expect(screen.getByText('Where is the nearest restroom?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/Estimated time/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
