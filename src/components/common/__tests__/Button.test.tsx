import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Button from '../Button';
import { ThemeProvider } from '../../../theme/ThemeContext';

// Mock the theme provider for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Button Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the title correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />, { wrapper });
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={onPressMock} />, { wrapper });
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPressMock} disabled={true} />,
      { wrapper }
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows activity indicator when loading', () => {
    const { queryByText } = render(
      <Button title="Loading" onPress={() => {}} loading={true} />,
      { wrapper }
    );
    
    expect(queryByText('Loading')).toBeNull();
  });
});

