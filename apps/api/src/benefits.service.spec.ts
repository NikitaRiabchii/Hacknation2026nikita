import { BenefitsService } from './benefits.service';

describe('BenefitsService', () => {
  const service = new BenefitsService();

  it('calculates maternity benefit at 81.5% of the basis', () => {
    const result = service.calculate({ scenario: 'maternity', basis: 5000, employmentType: 'Umowa o pracę', documents: ['ZAM'], startDate: '2026-04-15', children: 1 });
    expect(result.monthly).toBe(4075);
    expect(result.weeks).toBe(20);
  });

  it('calculates sickness benefit at 100% for pregnancy or commute accident', () => {
    const result = service.calculate({ scenario: 'sickness', basis: 5000, employmentType: 'Umowa o pracę', documents: ['ZUS ZLA'], startDate: '2026-04-15', sicknessReason: 'pregnancy' });
    expect(result.monthly).toBe(5000);
  });

  it('calculates ordinary sickness benefit at 80%', () => {
    const result = service.calculate({ scenario: 'sickness', basis: 5000, employmentType: 'Umowa o pracę', documents: ['ZUS ZLA'], startDate: '2026-04-15', sicknessReason: 'ordinary' });
    expect(result.monthly).toBe(4000);
  });

  it('calculates parental benefit at 70% and 41 weeks', () => {
    const result = service.calculate({ scenario: 'parental', basis: 5000, employmentType: 'Umowa zlecenie', documents: ['ZAM'], startDate: '2026-04-15', children: 1 });
    expect(result.monthly).toBe(3500);
    expect(result.weeks).toBe(41);
  });

  it('extends parental leave to 65 weeks with the enhanced certificate', () => {
    const result = service.calculate({ scenario: 'parental', basis: 5000, employmentType: 'Umowa o pracę', documents: ['ZAM'], startDate: '2026-04-15', enhancedCertificate: true, children: 1 });
    expect(result.weeks).toBe(65);
  });

  it('calculates adoption benefit', () => {
    const result = service.calculate({ scenario: 'adoption', basis: 4000, documents: ['ZAM'], startDate: '2026-04-15', children: 1 });
    expect(result.monthly).toBe(3260);
    expect(result.weeks).toBe(20);
  });

  it('returns a risk for missing B2B insurance', () => {
    const result = service.calculate({ scenario: 'maternity', basis: 5000, employmentType: 'Działalność gospodarcza', documents: ['ZAM'], startDate: '2026-04-15', insuranceActive: false });
    expect(result.risks).toContain('Potwierdź aktywne dobrowolne ubezpieczenie chorobowe w działalności gospodarczej.');
  });

  it('identifies missing documents in risk check', () => {
    const result = service.riskCheck({ birthDate: '2026-04-10', employmentType: 'Umowa o pracę', documents: [] });
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });

  it('gives a complete profile a high readiness score', () => {
    const result = service.riskCheck({ birthDate: '2026-04-10', employmentType: 'Umowa o pracę', documents: ['ZAM', 'ZUS ZLA'] });
    expect(result.score).toBe(100);
  });
});
