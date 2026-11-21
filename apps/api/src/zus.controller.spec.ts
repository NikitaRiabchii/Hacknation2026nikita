/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { BenefitsService } from './benefits.service';
import { ZusController } from './zus.controller';
import { AuthController } from './auth.controller';

describe('ZUS mock API', () => {
  let zus: ZusController;
  let auth: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZusController, AuthController],
      providers: [BenefitsService],
    }).compile();
    zus = module.get(ZusController);
    auth = module.get(AuthController);
  });

  it('returns a mock ZUS status', () => {
    expect(zus.status()).toEqual(expect.objectContaining({ connection: 'MOCK_PUE', insuranceStatus: 'Aktywne', unpaidContributions: 0 }));
  });

  it('returns the insured profile', () => {
    expect(zus.profile()).toEqual(expect.objectContaining({ name: 'Anna Kowalska', insuranceStatus: 'Aktywne' }));
  });

  it('returns chat guidance for benefits', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '## Świadczenie\n\n- Formularz ZAM' } }] }),
    }) as unknown as typeof fetch;

    const response = await zus.chat({ message: 'Jak uzyskać zasiłek?' });
    expect(response.answer).toContain('ZAM');
    global.fetch = originalFetch;
  });

  it('returns chat guidance for leave', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '## Urlop\n\nSprawdź typ zatrudnienia i termin.' } }] }),
    }) as unknown as typeof fetch;

    const response = await zus.chat({ message: 'Urlop rodzicielski' });
    expect(response.answer).toContain('Urlop');
    global.fetch = originalFetch;
  });

  it('parses a document with extracted demo fields', () => {
    const result = zus.parse({ fileName: 'ZLA.pdf' });
    expect(result.completeness).toBeGreaterThanOrEqual(80);
    expect(result.extracted.childrenCount).toBe(1);
  });

  it('creates a document bundle', () => {
    expect(zus.generate({ documents: ['ZAM', 'ZUR3', 'ZAO4'] }).status).toBe('ready');
  });

  it('provides a mock mObywatel login', () => {
    expect(auth.login({ name: 'Jan Kowalski' })).toEqual(expect.objectContaining({ accessToken: 'mock-mobywatel-jwt', user: expect.objectContaining({ verified: true }) }));
  });
});
