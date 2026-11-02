#!/usr/bin/env node
// 브랜드 언어 가이드 검사: 숙박 어휘가 "레스텔 자신을 설명하는 문장"에 쓰였는지 찾아낸다.
// 사용: node scripts/check-forbidden-words.mjs  (기본: src/i18n, src/data, src/views)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['src/i18n/locales', 'src/data', 'src/views'];
const forbidden = [
  /1박|2박|숙박\s?패키지|투숙|체크인|체크아웃|객실|침실|침구\s?완비|룸서비스|조식|올나이트|밤타임/g,
  /\bcheck[- ]?in\b|\bcheck[- ]?out\b|\bovernight stay\b|\bhotel room\b|\bbed(s)?\b|\bduvet\b|\blodging\b/gi,
  /チェックイン|チェックアウト|客室|宿泊パック|1泊/g,
  /入住|退房|客房|住宿套餐|一晚/g,
];
// 허용 문맥: 숙박이 아님을 밝히거나 비교·금지 규칙을 설명하는 문장
const allow = [
  /아닙니다|아닌|아니|않습니다|쓰지\s?않|금지|대신|없습니다|없음|비교|차이|vs|대실/,
  /\bnot\b|\bno\b|\bnever\b|\binstead\b|\bwithout\b|\bdiffer|\bunlike\b|rather than|don't|do not|isn't|forbidden|prohibited|avoid/i,
  /ではありません|ではなく|ありません|使いません|禁止|代わり|違い|ない/,
  /不是|並非|并非|不提供|沒有|没有|不用|禁止|取代|不同|而非|無|无/,
  /không|Không|thay cho|thay vì|ไม่|แทน/,
];
let hits = 0;
function scan(file) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const re of forbidden) {
      re.lastIndex = 0;
      const m = line.match(re);
      if (m && !allow.some((a) => a.test(line))) {
        hits++;
        console.log(`${file}:${i + 1}  [${m.join(', ')}]  ${line.trim().slice(0, 110)}`);
      }
    }
  });
}
function walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) readdirSync(p).forEach((c) => walk(join(p, c)));
  else if (['.json', '.ts', '.astro', '.md'].includes(extname(p))) scan(p);
}
targets.forEach(walk);
if (hits) { console.log(`\n⚠ ${hits}곳에서 숙박 어휘가 발견되었습니다. 문맥을 확인해 주세요.`); process.exitCode = 1; }
else console.log('✓ 숙박 어휘 검사 통과');
