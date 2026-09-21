# 집들이 인터랙티브 초대장 (GBC 도트 스타일)

빌드 도구 없이 HTML/CSS/JS만으로 만든 정적 사이트입니다. 도트 그림(우편함, 편지, 집, 달력 등)은 전부 `js/sprites.js`에서 코드로 직접 그린 오리지널 에셋이며, 외부 이미지/음원은 없습니다. (폰트만 Google Fonts의 Press Start 2P를 사용)

## 파일 구조
```
index.html
css/style.css        # 맨 위 :root 에서 팔레트(색) 관리
js/config.js         # 설정은 여기만 고치면 됩니다
js/app.js            # 화면 전환, ?to= 처리, 폼, 마무리 화면
js/dialog.js         # 타이핑 대화창, ▶ 메뉴, 방향키 이동, 8비트 효과음
js/calendar-ui.js    # 달력
js/gcal.js           # 구글 캘린더 링크 생성
js/supabase-client.js
js/env.js            # 배포 때 자동 생성 (환경 변수 → 브라우저용 값)
scripts/generate-env.js
vercel.json
js/sprites.js        # 도트 그림 (스펙의 파일 구조에 추가된 파일)
supabase/schema.sql
```

## 1. Supabase 설정
1. [supabase.com](https://supabase.com)에서 프로젝트를 만듭니다.
2. **SQL Editor**에 `supabase/schema.sql` 전체를 붙여넣고 Run. `rsvps` 테이블이 만들어지고, RLS로 익명(anon)은 **insert만** 가능합니다. (읽기/수정/삭제 불가)
3. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사해 `js/config.js`의 `supabase.url`, `supabase.anonKey`에 넣습니다. `service_role` 키는 절대 넣지 마세요.
4. 응답은 대시보드 **Table Editor → rsvps**에서 확인합니다.

저장 컬럼: `name`, `invited_as`(URL `?to=` 원본), `attend_date`, `attend_time`, `has_guests`, `guest_count`(본인 제외 동반 인원), `favorite_foods`(배열: western/korean/chinese/japanese), `can_eat_spicy`, `spicy_level`(1~5, 못 먹으면 null), `food_notes`, `created_at`.

## 2. config.js 수정
| 항목 | 설명 |
|---|---|
| `supabase` | url / anonKey |
| `event` | title, description, location, mapUrl, durationHours, timezone |
| `availableDates` | 선택 가능한 날짜 `"YYYY-MM-DD"` 배열 (여러 달이면 ◀ ▶ 자동 활성화) |
| `availableTimes` | `["13:00", "17:00"]` |
| `notices` | 마무리 화면 안내 카드 문구 |
| `foods` | 음식 선택지 `{id, label}` |
| `text` | 화면의 모든 영어 문구 |

색상은 `css/style.css` 맨 위 `--c-*` 변수만 바꾸면 화면과 도트 그림에 모두 반영됩니다.

## 3. 로컬 실행
```
python3 -m http.server 8000
```
→ http://localhost:8000 (파일을 더블클릭으로 열어도 동작하지만, 폰트 로딩 등을 위해 서버 실행을 권장)

## 4. 배포 (Vercel / Netlify)
Vercel은 `vercel.json`이 있어서 설정할 것이 환경 변수뿐입니다. **Project Settings → Environment Variables**에 아래 두 개를 추가하고 배포하세요.

| 변수명 | 값 |
|---|---|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | anon public 키 (`service_role` 키 금지, 넣으면 빌드가 실패합니다) |

배포할 때 `scripts/generate-env.js`가 이 값을 `js/env.js`로 만들고, `config.js`가 그 값을 우선 사용합니다. 변수를 안 넣으면 `config.js`에 직접 적은 값을 씁니다. 환경 변수는 빌드 결과에 그대로 들어가므로 anon 키가 브라우저에 공개되는 것은 똑같습니다. (보호는 RLS가 담당)

Netlify 등 다른 곳은 Build command에 `node scripts/generate-env.js`, Publish directory에 `.`을 넣으면 같은 방식으로 동작합니다.

(환경 변수 없이 쓰려면) 빌드 설정이 필요 없습니다. 이 폴더 자체를 정적 사이트로 올리면 됩니다. (Netlify는 폴더 드래그&드롭, Vercel은 `vercel` 또는 Git 연동 후 Framework Preset을 *Other*, Build Command 비움, Output Directory `.`)

## 5. 개인 링크(?to=) 만들기
`https://내도메인/?to=이름` 형식입니다. 이름칸이 자동으로 채워지고, DB의 `invited_as`에 원본 값이 함께 저장됩니다.

- 한글/공백은 자동 인코딩되어도 되고 직접 써도 됩니다: `?to=은미`, `?to=Eunmi%20Kim`
- 브라우저 콘솔에서 한 번에 만들기:
  ```js
  ["Eunmi","Minsu Kim","지수"].map(n => `https://내도메인/?to=${encodeURIComponent(n)}`).join("\n")
  ```

## 조작법
- 터치/클릭, 또는 키보드: 방향키로 이동, Enter/Space로 선택. 대화창은 Enter/클릭으로 타이핑 스킵.
- 효과음은 기본 음소거이며, 오른쪽 위 `SOUND` 버튼으로 켭니다.

## 참고
- 화면은 160x144 비율을 유지한 채 창 크기에 맞게 확대합니다(소수 배율 허용). 390px 폭 폰에서는 약 2.3배입니다.
- iOS가 작은 입력칸에 포커스할 때 화면을 확대하는 것을 막기 위해 viewport에 `maximum-scale=1`을 넣었습니다.
- Supabase 값이 기본 placeholder 상태면 SUBMIT은 실패(RETRY)로 표시됩니다.
