import { detectCountry, getCurrencyForCountry } from '../lib/geo';

describe('geo utilities', () => {
  describe('detectCountry', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('detects country from API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ country_code: 'US' }),
      });

      const country = await detectCountry();
      expect(country).toBe('US');
    });

    it('falls back when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const country = await detectCountry();
      expect(country).toBeDefined();
      expect(typeof country).toBe('string');
    });
  });

  describe('getCurrencyForCountry', () => {
    it('gets currency for US', () => {
      const currency = getCurrencyForCountry('US');
      expect(currency).toEqual({
        currency: 'USD',
        symbol: '$',
        locale: 'en-US'
      });
    });

    it('gets currency for Ghana', () => {
      const currency = getCurrencyForCountry('GH');
      expect(currency.symbol).toBe('GH₵');
    });

    it('falls back to US for unknown country', () => {
      const currency = getCurrencyForCountry('XX');
      expect(currency.symbol).toBe('$');
    });
  });
});