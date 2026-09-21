// Vercel 빌드 때 실행: 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)를 읽어 js/env.js 를 만듭니다.
// 로컬에서는 실행하지 않아도 됩니다 (js/env.js 는 빈 값이 들어있는 기본 파일).
const fs = require('fs');
const path = require('path');

const url = (process.env.SUPABASE_URL || '').trim();
const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

if (/service_role/i.test(anonKey) || (anonKey.split('.')[1] && /service_role/.test(Buffer.from(anonKey.split('.')[1], 'base64').toString()))) {
  console.error('ERROR: SUPABASE_ANON_KEY 에 service_role 키가 들어있는 것 같습니다. anon(public) 키를 넣으세요.');
  process.exit(1);
}
if (!url || !anonKey) {
  console.warn('WARN: SUPABASE_URL / SUPABASE_ANON_KEY 가 설정되지 않았습니다. js/config.js 의 값을 그대로 사용합니다.');
}

const body =
  '// 자동 생성 파일 (scripts/generate-env.js). 직접 수정하지 마세요.\n' +
  'window.ENV = ' + JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey }, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'js', 'env.js'), body);
console.log('js/env.js written (' + (url && anonKey ? 'from env vars' : 'empty') + ')');
