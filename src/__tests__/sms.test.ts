let sendSms: typeof import('../lib/sms').sendSms;
let originalKey: string | undefined;

jest.mock('node-fetch', () => undefined);

global.fetch = jest.fn();

beforeAll(() => {
  originalKey = process.env.TERMII_API_KEY;
  process.env.TERMII_API_KEY = 'test-api-key';
});

afterAll(() => {
  process.env.TERMII_API_KEY = originalKey;
});

beforeEach(async () => {
  jest.resetModules();
  jest.clearAllMocks();
  const mod = await import('../lib/sms');
  sendSms = mod.sendSms;
});

describe('SMS utility', () => {
  it('sends SMS successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Successfully Send' })
    });

    const result = await sendSms({
      to: '+2348012345678',
      message: 'Test message'
    });

    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.termii.com/api/sms/send',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"to":"+2348012345678"')
      })
    );
  });

  it('handles SMS failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid API key' })
    });

    const result = await sendSms({
      to: '+2348012345678',
      message: 'Test message'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });

  it('handles missing API key', async () => {
    process.env.TERMII_API_KEY = '';
    jest.resetModules();
    jest.clearAllMocks();
    const mod = await import('../lib/sms');
    sendSms = mod.sendSms;

    const result = await sendSms({
      to: '+2348012345678',
      message: 'Test message'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Termii API key not configured');

    process.env.TERMII_API_KEY = 'test-api-key';
  });
});
