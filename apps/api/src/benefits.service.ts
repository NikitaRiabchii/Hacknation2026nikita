import { Injectable } from '@nestjs/common';

@Injectable()
export class BenefitsService {
  calculate(dto: any) {
    const basis = Number(dto.basis ?? 5000);
    const employment = dto.employmentType ?? 'contract';
    const scenario = dto.scenario ?? 'maternity';
    const benefitByScenario: Record<string, { name: string; rate: number; months: number }> = {
      maternity: { name: 'Zasiłek macierzyński', rate: 0.815, months: 20 },
      parental: { name: 'Zasiłek rodzicielski', rate: 0.7000, months: 41 },
      adoption: { name: 'Zasiłek z tytułu adopcji', rate: 0.815, months: 9 },
      foster: { name: 'Zasiłek rodzinny zastępczy', rate: 0.815, months: 9 },
      sickness: { name: 'Zasiłek chorobowy', rate: 1, months: 0.25 },
      premature: { name: 'Zasiłek z tytułu wcześniaka', rate: 0.815, months: 9 },
      death: { name: 'Zasiłek pogrzebowy / wsparcie', rate: 0.815, months: 1 },
    };
    const benefit = benefitByScenario[scenario] ?? benefitByScenario.maternity;

    const monthly = basis * benefit.rate;
    const total = monthly * Number(benefit.months);
    const risks: string[] = [];
    if (!dto.startDate) risks.push('Uzupełnij przewidywaną datę rozpoczęcia świadczenia.');
    if (employment === 'b2b' && !dto.insuranceActive) risks.push('Potwierdź aktywne ubezpieczenie chorobowe w działalności gospodarczej.');
    if (!dto.documents || dto.documents.length === 0) risks.push('Brakuje listy wymaganych dokumentów.');

    return { scenario, name: benefit.name, employment, basis, rate: benefit.rate, monthly: Math.round(monthly * 100) / 100, months: benefit.months, estimatedTotal: Math.round(total * 100) / 100, risks };
  }

  riskCheck(dto: any) {
    const issues: Array<{ severity: 'high' | 'medium' | 'low'; title: string; message: string }> = [];
    if (!dto.birthDate) issues.push({ severity: 'high', title: 'Brak danych o porodzie', message: 'Podaj datę porodu lub przewidywanego rozwiązania.' });
    if (!dto.employmentType) issues.push({ severity: 'high', title: 'Nieznany typ zatrudnienia', message: 'Wybierz umowę o pracę, zlecenie lub działalność.' });
    if (!dto.documents?.includes('ZAM')) issues.push({ severity: 'medium', title: 'Brak formularza ZAM', message: 'Przygotuj ZAM u pracodawcy.' });
    if (!dto.documents?.includes('ZUS ZLA')) issues.push({ severity: 'medium', title: 'Brak ZUS ZLA', message: 'Zweryfikuj dokument zaświadczenia lekarskiego.' });
    if (dto.terminationDate) issues.push({ severity: 'low', title: 'Zmień termin wyliczeń', message: 'Po rozwiązaniu umowy sprawdź prawo do okresu ochronnego.' });
    return { issues, score: Math.max(0, 100 - issues.length * 18) };
  }
}
