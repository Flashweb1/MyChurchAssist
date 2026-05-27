import { safeAsync } from '../lib/safe-async';

describe('safeAsync', () => {
  it('returns success result', async () => {
    const result = await safeAsync(() => Promise.resolve(42));
    expect(result).toEqual({ success: true, data: 42 });
  });

  it('returns failure result on rejection', async () => {
    const result = await safeAsync(
      () => Promise.reject(new Error('boom')),
      'Custom error'
    );
    expect(result).toEqual({ success: false, error: 'boom' });
  });

  it('uses default error message when none provided', async () => {
    const result = await safeAsync(
      () => Promise.reject('something')
    );
    expect(result).toEqual({ success: false, error: 'An unexpected error occurred' });
  });
});