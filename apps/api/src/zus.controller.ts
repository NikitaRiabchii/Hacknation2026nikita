import { Body, Controller, Get, Header, Post, StreamableFile, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BenefitsService } from './benefits.service';
import type { BenefitRequest, ChatRequest, DocumentRequest, RiskRequest } from './dto';

@Controller('api')
export class ZusController {
  constructor(private readonly benefits: BenefitsService) {}

  @Get('profile') profile() {
    return { name: 'Anna Kowalska', peselMasked: '******1234', insuranceStatus: 'Aktywne', debt: 0, employer: 'Przykładowa Sp. z o.o.' };
  }

  @Get('zus/status') status() {
    return { connection: 'MOCK_PUE', insuranceStatus: 'Aktywne', unpaidContributions: 0, benefits: [{ name: 'Zasiłek macierzyński', status: 'W przygotowaniu', amount: null }], updatedAt: new Date().toISOString() };
  }

  @Post('benefits/calculate') calculateLegacy(@Body() dto: BenefitRequest) { return this.benefits.calculate(dto); }

  @Post('calculator/calculate') calculate(@Body() dto: BenefitRequest) { return this.benefits.calculate(dto); }

  @Post('risk/check') riskCheck(@Body() dto: RiskRequest) { return this.benefits.riskCheck(dto); }

  @Post(['chat', 'assistant/chat']) async chat(@Body() dto: ChatRequest) {
    const message = String(dto.message ?? '').trim();
    const history = Array.isArray(dto.history) ? dto.history.slice(-8) : [];
    if (!message) return { answer: 'Napisz pytanie, a pomogę doprecyzować sytuację i wymagane dokumenty.' };

    const systemPrompt = `Jesteś polskim ekspertem ZUS Nawigator. ODPOWIADAJ WYŁĄCZNIE PO POLSKU. Pomagasz planować macierzyństwo i świadczenia na podstawie polskiego prawa pracy i przepisów ZUS. Uwzględniaj: urlop macierzyński 20, 31, 33, 35 lub 37 tygodni zależnie od liczby dzieci; maksymalnie 6 tygodni urlopu przed porodem; urlop rodzicielski zwykle do 41 lub 43 tygodni, a z zaświadczeniem „Za życiem” do 65 lub 67 tygodni; co najmniej 9 tygodni wyłącznego prawa każdego rodzica; wniosek o urlop rodzicielski co najmniej 21 dni przed rozpoczęciem; urlop ojcowski do 2 tygodni; uzupełniający urlop macierzyński dla wcześniaków zależny od pobytu dziecka w szpitalu i masy urodzeniowej; urlop macierzyński 8 tygodni po urodzeniu martwego dziecka lub zgonie przed upływem 8 tygodni życia. Wyjaśniaj ochronę pracownika przed rozwiązaniem umowy po złożeniu wniosku o urlopy rodzinne oraz potrzebę dokumentów ZAM/ZLA/ZUR3/ZAO4 i zaświadczeń. Zadaj najwyżej 2 krótkie pytania doprecyzowujące. Formatuj Markdownem: krótkie nagłówki, listy, pogrubienia i cytaty dla ostrzeżeń. Nie podawaj dokładnej decyzji prawnej bez danych i zaznacz, że ostateczne prawo potwierdza ZUS/pracodawca. To aplikacja MVP, nie porada prawna. Odpowiadaj zwięźle i po polsku.`;

    const body = {
      model: process.env.LM_STUDIO_MODEL ?? 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history
          .filter((item: any) => item?.role === 'user' || item?.role === 'assistant')
          .map((item: any) => ({ role: item.role, content: String(item.content ?? '').slice(0, 3000) })),
        { role: 'user', content: `${message}\n\nOdpowiedz wyłącznie po polsku.` },
      ],
      temperature: 0.15,
      top_p: 0.9,
      max_tokens: 801,
      stream: false,
    };

    try {
      const response = await fetch(process.env.LM_STUDIO_API_URL ?? 'http://127.0.0.1:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`LM Studio zwróciło status ${response.status}`);
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const answer = data?.choices?.[0]?.message?.content;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('Model nie zwrócił odpowiedzi');
      return { answer: answer.trim(), sources: ['LM Studio — openai/gpt-oss-20b', 'ZUS Nawigator — model konsultacyjny'], mode: 'local-ai' };
    } catch (_error: unknown) {
      const lowercase = message.toLowerCase();
      let fallback = 'Możemy przygotować najważniejsze dokumenty i terminowe zadania. Uzupełnij dane o typie zatrudnienia i terminie.';
      if (lowercase.includes('zasiłek') || lowercase.includes('świadczenie')) fallback = 'Najczęściej sprawdź ZAM, ZUS ZLA oraz podstawę wymiaru. Kwota zależy od typu zatrudnienia i składki chorobowej.\n\nPotrzebne są: typ zatrudnienia, przewidywana data rozpoczęcia i aktywność ubezpieczenia chorobowego.';
      if (lowercase.includes('urlop') || lowercase.includes('opieki')) fallback = 'Urlop macierzyński i rodzicielski mają inne zasady i długości. Najpierw potwierdź typ zatrudnienia i przewidywaną datę rozpoczęcia.';
      return { answer: fallback, sources: ['ZUS Nawigator — tryb awaryjny'], mode: 'fallback', warning: 'LM Studio jest niedostępne. Uruchom serwer na porcie 1234.' };
    }
  }

  @Post('documents/parse') parse(@Body() dto: DocumentRequest) {
    return { fileName: dto.fileName ?? 'dokument.pdf', extracted: { dateOfBirth: '2026-04-10', codeB: true, childrenCount: 1 }, completeness: 82, missingFields: ['numer PESEL dziecka'] };
  }

  @Post('documents/generate') generate(@Body() dto: DocumentRequest) {
    return { bundleName: 'pakiet-zus-demo.pdf', documents: dto.documents ?? ['ZAM', 'ZUR3', 'ZAO4'], status: 'ready', downloadUrl: '/api/documents/download/demo' };
  }

  @Get('documents/download/demo') download() { return { message: 'Demo: generowanie PDF podłączone do integracji pdf-lib.' }; }

  @Get('guide/summary') guideSummary() {
    return {
      title: 'Poradnik dla rodziców i opiekunów dzieci',
      edition: 'ZUS, stan prawny 1 kwietnia 2026',
      downloadUrl: '/api/guide/download',
      sections: [
        { title: 'Ubezpieczenia i praca', text: 'Zasady obowiązkowego ubezpieczenia chorobowego, pracy zlecenia i prowadzenia działalności gospodarczej.' },
        { title: 'Zasiłek macierzyński', text: 'Prawo po porodzie, długość urlopu, warianty 81,5%, 100% i 70% oraz podział między rodziców.' },
        { title: 'Urlopy i wcześniaki', text: 'Uzupełniający urlop macierzyński, urlop ojcowski i zasady uznawania pobytu dziecka w szpitalu.' },
        { title: 'Zasiłek opiekuńczy', text: 'Opieka nad dzieckiem lub innym członkiem rodziny, limity roczne i formularze Z-15A/Z-15B.' },
        { title: 'Pogrzeb i sytuacje szczególne', text: 'Zasiłek pogrzebowy po martwym porodzie, zasiłek po śmierci dziecka i wymagane dokumenty.' },
        { title: 'Praktyczne kontakty', text: 'PUE/eZUS, mZUS, infolinia 22 560 16 00 oraz e-wizyta i e-mail mama@zus.pl.' },
      ],
    };
  }

  @Get('guide/download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="Poradnik-dla-rodzicow-ZUS-2026.pdf"')
  guideDownload() {
    const filePath = resolve(process.cwd(), '../../Materiały dla uczestników/Poradnik dla rodziców, ZUS 2026.pdf');
    if (!existsSync(filePath)) throw new NotFoundException('Poradnik nie został znaleziony');
    return new StreamableFile(createReadStream(filePath));
  }
}
