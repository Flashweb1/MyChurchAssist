import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../components/LanguageSwitcher';

let mockLanguage = 'en';
const mockChangeLanguage = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: mockLanguage,
      changeLanguage: mockChangeLanguage,
    },
    t: (key: string) => key,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockLanguage = 'en';
    mockChangeLanguage.mockClear();
  });

  it('renders current language', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText(/English/)).toBeInTheDocument();
  });

  it('opens language menu on click', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/Français/)).toBeInTheDocument();
    expect(screen.getByText(/Español/)).toBeInTheDocument();
    expect(screen.getByText(/Português/)).toBeInTheDocument();
  });

  it('changes language when option is clicked', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(screen.getByText(/Français/));
    expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
  });

  it('highlights current language as blue', () => {
    mockLanguage = 'es';
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    const menuButtons = screen.getAllByRole('button');
    const menuLanguageButtons = menuButtons.filter(
      (btn) => btn.className.includes('w-full')
    );
    const espanolButton = menuLanguageButtons.find(
      (btn) => btn.textContent?.includes('Español')
    );
    expect(espanolButton).toBeTruthy();
    expect(espanolButton!.className).toContain('bg-blue-50');
  });
});