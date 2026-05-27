import { formatCurrency, formatCurrencyShort } from '../lib/currency';

describe('currency utilities', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56, '₦')).toBe('₦ 1,234.56');
    expect(formatCurrency(1000, '$')).toBe('$ 1,000.00');
    expect(formatCurrency(1234567.89, '€')).toBe('€ 1,234,567.89');
  });

  it('formats short currency correctly', () => {
    expect(formatCurrencyShort(1500, '₦')).toBe('₦ 1.5K');
    expect(formatCurrencyShort(1500000, '₦')).toBe('₦ 1.5M');
    expect(formatCurrencyShort(999, '₦')).toBe('₦ 999.00');
  });
});