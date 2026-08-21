import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CPGRAMS Portal branding', () => {
  render(<App />);
  const brandingText = screen.getAllByText(/CPGRAMS Portal/i);
  expect(brandingText.length).toBeGreaterThan(0);
});
