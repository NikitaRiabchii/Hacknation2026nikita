import { Injectable } from '@nestjs/common';
import type { BenefitRequest, RiskRequest } from './dto';

@Injectable()
export class BenefitsService {
  calculate(dto: BenefitRequest) {
    const rawBasis = Number(dto.basis ?? 5000);
    const basis = Number.isFinite(rawBasis) && rawBasis >= 0 ? rawBasis : 5000;
    const employment = dto.employmentType ?? 'Umowa o pracę';
    const scenario = String(dto.scenario ?? 'maternity');
    const rawChildren = Number(dto.children ?? 1);
    const children = Number.isFinite(rawChildren) ? Math.min(5, Math.max(1, Math.floor(rawChildren))) : 1;
    const enhancedCertificate = dto.enhancedCertificate === true;

    let name = 'Zasiłek macierzyński';
    let rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '70' ? 0.70 : 0.815;
    let weeks = 20;
    let note = 'Orientacyjny wymiar dla jednego dziecka i jednego porodu; rozliczenia ZUS wymagają potwierdzenia podstawy wymiaru.';

    if (scenario === 'maternity') {
      name = 'Urlop macierzyński i zasiłek macierzyński';
      weeks = [20, 31, 33, 35, 37][Math.min(children - 1, 4)] ?? 37;
      rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '70' ? 0.70 : 0.815;
      note = 'Kodeks: 20 tygodni dla jednego dziecka, 31/33/35/37 tygodni odpowiednio dla dwojga, trojga, czworga i pięciorga lub więcej dzieci.';
    } else if (scenario === 'parental') {
      name = 'Urlop i zasiłek rodzicielski';
      if (enhancedCertificate) {
        weeks = children === 1 ? 65 : 67;
      } else {
        weeks = children === 1 ? 41 : 43;
      }
      rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '81.5' ? 0.815 : 0.70;
      note = 'Urlop rodzicielski przysługuje do 41/43 tygodni; przy ważnym zaświadczeniu „Za życiem” 65/67 tygodni. Dla obojga rodziców dotyczy łącznie 9 tygodni wyłącznego prawa dla każdego z rodziców.';
    } else if (scenario === 'adoption') {
      name = 'Urlop na warunkach macierzyńskiego';
      weeks = [20, 31, 33, 35, 37][Math.min(children - 1, 4)] ?? 37;
      rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '70' ? 0.70 : 0.815;
      note = 'Wymiar zależy od liczby przyjętych/adoptowanych dzieci i wieku dziecka; zakres wymagających danych należy potwierdzić z ZUS i pracodawcą.';
    } else if (scenario === 'foster') {
      name = 'Urlop na warunkach macierzyńskiego i urlop rodzicielski';
      weeks = [20, 31, 33, 35, 37][Math.min(children - 1, 4)] ?? 37;
      rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '70' ? 0.70 : 0.815;
      note = 'Kodeks przewiduje 20 tygodni dla jednego dziecka i wydłużenie dla większej liczby dzieci; rodzinna piecza zastępcza może wymagać dodatkowych terminów i dokumentów.';
    } else if (scenario === 'sickness') {
      name = 'Wynagrodzenie chorobowe / zasiłek chorobowy';
      if (dto.sicknessReason === 'pregnancy' || dto.sicknessReason === 'commute') {
        rate = 1;
        note = 'Przy chorobie przypadającej w czasie ciąży oraz wypadku w drodze do pracy lub z pracy przysługuje wynagrodzenie chorobowe w wysokości 100% podstawy.';
      } else {
        rate = 0.80;
        note = 'Zasadniczo wynagrodzenie chorobowe wynosi 80% podstawy przez okres do 33 dni rocznie lub do 14 dni dla pracownika po 50. roku życia; dalszy okres rozlicza zasiłek chorobowy.';
      }
      weeks = dto.durationWeeks ? Math.max(1, Number(dto.durationWeeks)) : 4;
    } else if (scenario === 'premature') {
      name = 'Uzupełniający urlop macierzyński';
      rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '70' ? 0.70 : 0.815;
      weeks = Math.max(0, Number(dto.hospitalWeeks ?? 0));
      note = 'Wymiar zależy od wieku ciążowego, masy urodzeniowej dziecka i okresu pobytu w szpitalu. Niepełny tydzień pobytu sumuje się i zaokrągla w górę do pełnego tygodnia.';
    } else if (scenario === 'death') {
      name = 'Urlop macierzyński po urodzeniu martwego dziecka / zgonie dziecka';
      rate = dto.benefitRate === '100' ? 1 : dto.benefitRate === '70' ? 0.70 : 0.815;
      weeks = Number(dto.childWeeksAfterBirth ?? 0) >= 8 ? 1 : 8;
      note = 'Jeśli dziecko urodziło się martwo albo zmarło przed upływem 8 tygodni życia: urlop macierzyński wynosi 8 tygodni po porodzie, co najmniej 7 dni od zgonu. Po 8 tygodniach życia zachowuje się 7 dni urlopu.';
    }

    const monthly = basis * rate;
    const total = monthly * (weeks / 52) * 12;
    const risks: string[] = [];

    if (!dto.startDate) risks.push('Uzupełnij przewidywaną datę rozpoczęcia urlopu lub świadczenia.');
    if (employment.toLowerCase().includes('działalność') && dto.insuranceActive !== true) risks.push('Potwierdź aktywne dobrowolne ubezpieczenie chorobowe w działalności gospodarczej.');
    if (!dto.documents || dto.documents.length === 0) risks.push('Brakuje wymaganej listy dokumentów.');
    if (scenario === 'parental') risks.push('Złóż wniosek co najmniej 21 dni przed rozpoczęciem urlopu rodzicielskiego.');
    if (scenario === 'premature') risks.push('Dodaj zaświadczenie szpitala oraz dokumenty wymagane przepisami dotyczącymi urlopów związanych z rodzicielstwem.');
    if (scenario === 'maternity' && children > 1) risks.push('Zweryfikuj wymiar dla liczby dzieci urodzonych przy jednym porodzie: 31, 33, 35 lub 37 tygodni.');

    return {
      scenario,
      name,
      employment,
      basis,
      rate,
      monthly: Math.round(monthly * 100) / 100,
      weeks,
      months: Math.round((weeks / 52 * 12) * 100) / 100,
      estimatedTotal: Math.round(total * 100) / 100,
      risks,
      legalNote: note,
      disclaimer: 'Wycena orientacyjna. Ostateczne prawo i podstawę wymiaru potwierdza ZUS oraz pracodawca.',
    };
  }

  riskCheck(dto: RiskRequest) {
    const issues: Array<{ severity: 'high' | 'medium' | 'low'; title: string; message: string }> = [];
    if (!dto.birthDate && !dto.expectedBirthDate) issues.push({ severity: 'high', title: 'Brak danych o porodzie', message: 'Podaj przewidywaną lub rzeczywistą datę porodu.' });
    if (!dto.employmentType) issues.push({ severity: 'high', title: 'Nieznany typ zatrudnienia', message: 'Wybierz umowę o pracę, zlecenie lub działalność gospodarczą.' });
    if (!dto.documents?.includes('ZAM')) issues.push({ severity: 'medium', title: 'Brak formularza ZAM', message: 'Przygotuj formularz ZAM we właściwym trybie.' });
    if (!dto.documents?.includes('ZUS ZLA')) issues.push({ severity: 'medium', title: 'Brak ZUS ZLA', message: 'Zweryfikuj wymagane zaświadczenie lekarskie.' });
    if (dto.scenario === 'parental') issues.push({ severity: 'medium', title: 'Termin wniosku', message: 'Wniosek o urlop rodzicielski składa się co najmniej 21 dni przed rozpoczęciem urlopu.' });
    if (dto.scenario === 'premature') issues.push({ severity: 'high', title: 'Zaświadczenie szpitala', message: 'Uzupełnij informację o pobycie dziecka w szpitalu i jego masie urodzeniowej.' });
    if (dto.scenario === 'maternity' && dto.birthDate && dto.expectedBirthDate) issues.push({ severity: 'low', title: 'Sprawdź wcześniejsze wykorzystanie urlopu', message: 'Przed porodem można wykorzystać maksymalnie 6 tygodni urlopa macierzyńskiego.' });
    if (dto.terminationDate) issues.push({ severity: 'low', title: 'Okres ochronny', message: 'Po złożeniu wniosku o urlop ochronna zasada Kodeksu pracy zaczyna obowiązywać zgodnie z terminami określonymi ustawą.' });
    return { issues, score: Math.max(0, 100 - issues.length * 18) };
  }
}
