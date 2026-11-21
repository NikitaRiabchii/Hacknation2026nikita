import { Body, Controller, Get, Post } from '@nestjs/common';
import { BenefitsService } from './benefits.service';

@Controller('api')
export class ZusController {
  constructor(private readonly benefits: BenefitsService) {}

  @Get('profile') profile() {
    return { name: 'Anna Kowalska', peselMasked: '******1234', insuranceStatus: 'Aktywne', debt: 0, employer: 'Przykładowa Sp. z o.o.' };
  }

  @Get('zus/status') status() {
    return { connection: 'MOCK_PUE', insuranceStatus: 'Aktywne', unpaidContributions: 0, benefits: [{ name: 'Zasiłek macierzyński', status: 'W przygotowaniu', amount: null }], updatedAt: new Date().toISOString() };
  }

  @Post('benefits/calculate') calculateLegacy(@Body() dto: any) { return this.benefits.calculate(dto); }

  @Post('calculator/calculate') calculate(@Body() dto: any) { return this.benefits.calculate(dto); }

  @Post('risk/check') riskCheck(@Body() dto: any) { return this.benefits.riskCheck(dto); }

  @Post(['chat', 'assistant/chat']) async chat(@Body() dto: any) {
    const message = String(dto.message ?? '').trim();
    const history = Array.isArray(dto.history) ? dto.history.slice(-8) : [];
    if (!message) return { answer: 'Napisz pytanie, a pomogę doprecyzować sytuację i wymagane dokumenty.' };

    const systemPrompt = `Jesteś polskim ekspertem ZUS Nawigator. ODPOWIADAJ WYŁĄCZNIE PO POLSKU. Nie używaj zdań ani fragmentów po angielsku. Pomagasz planować macierzyństwo i świadczenia. Wyjaśnij prawa, dokumenty ZAM/ZLA/ZUR3/ZAO4, podstawę wyliczenia, terminy i ryzyka. Zadaj najwyżej 2 krótkie pytania doprecyzowujące — wszystkie po polsku. Formatuj odpowiedź poprawnym Markdownem: używaj krótkich nagłówków zaczynających się od ##, numerowanych lub punktowanych list, pogrubień dla nazw formularzy i terminów oraz cytatów blokowych dla ważnych ostrzeżeń. Nie używaj surowych gwiazdek, niepowiązanego tekstu bez akapitu ani formatowania pseudo-Wiki. Nie gwarantuj wyniku ani nie przedstawiaj informacji jako aktualnego prawa — zaznacz, że decyzję potwierdza ZUS. Zachowuj zwięzłość i praktyczny ton. To aplikacja MVP, nie porada prawna.`;

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
      const data: any = await response.json();
      const answer = data?.choices?.[0]?.message?.content;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('Model nie zwrócił odpowiedzi');
      return { answer: answer.trim(), sources: ['LM Studio — openai/gpt-oss-20b', 'ZUS Nawigator — model konsultacyjny'], mode: 'local-ai' };
    } catch (_error: any) {
      const lowercase = message.toLowerCase();
      let fallback = 'Możemy przygotować najważniejsze dokumenty i terminowe zadania. Uzupełnij dane o typie zatrudnienia i terminie.';
      if (lowercase.includes('zasiłek') || lowercase.includes('świadczenie')) fallback = 'Najczęściej sprawdź ZAM, ZUS ZLA oraz podstawę wymiaru. Kwota zależy od typu zatrudnienia i składki chorobowej.\n\nPotrzebne są: typ zatrudnienia, przewidywana data rozpoczęcia i aktywność ubezpieczenia chorobowego.';
      if (lowercase.includes('urlop') || lowercase.includes('opieki')) fallback = 'Urlop macierzyński i rodzicielski mają inne zasady i długości. Najpierw potwierdź typ zatrudnienia i przewidywaną datę rozpoczęcia.';
      return { answer: fallback, sources: ['ZUS Nawigator — tryb awaryjny'], mode: 'fallback', warning: 'LM Studio jest niedostępne. Uruchom serwer na porcie 1234.' };
    }
  }

  @Post('documents/parse') parse(@Body() dto: any) {
    return { fileName: dto.fileName ?? 'dokument.pdf', extracted: { dateOfBirth: '2026-04-10', codeB: true, childrenCount: 1 }, completeness: 82, missingFields: ['numer PESEL dziecka'] };
  }

  @Post('documents/generate') generate(@Body() dto: any) {
    return { bundleName: 'pakiet-zus-demo.pdf', documents: dto.documents ?? ['ZAM', 'ZUR3', 'ZAO4'], status: 'ready', downloadUrl: '/api/documents/download/demo' };
  }

  @Get('documents/download/demo') download() { return { message: 'Demo: generowanie PDF podłączone do integracji pdf-lib.' }; }
}
