# 코치 홈페이지 — 강연·코칭 문의 페이지

대기업 HR·교육 담당자가 코치 소개·프로그램·자격·강연 이력을 보고, 그 자리에서 문의를 남기는 한 장짜리 사이트.
설계도: [prd-v1.md](prd-v1.md) (오늘 만든 것) · [prd-v2.md](prd-v2.md) (앞으로의 방향) · [prd-v3-admin.md](prd-v3-admin.md) (관리자 화면)

## 파일 구성

| 파일 | 무엇 |
|---|---|
| `assets/content.js` | **화면 글자 전부.** 이름·소개·프로그램·자격·강연 이력·완료 문구. 이 파일만 고치면 됩니다 |
| `assets/config.js` | Supabase 연결 정보 (주소·공개 키) |
| `supabase/schema.sql` | 문의 표 + 보안 설정. Supabase에 한 번 실행 |
| `index.html` / `thanks.html` | 메인 / 문의 완료 화면 |
| `assets/styles.css`, `assets/main.js` | 디자인 / 화면 그리기·양식 보내기 |

## 1. 글자 바꾸기
`assets/content.js` 를 열어 따옴표 안의 예시 글을 실제 내용으로 바꿉니다.
강연 이력의 기업·기관 이름은 **공개를 허락받은 것만** 씁니다.

## 2. Supabase 연결 (문의 저장)
1. https://supabase.com 에서 로그인 → **New project** (지역은 Seoul 권장)
2. 왼쪽 **SQL Editor** → New query → `supabase/schema.sql` 내용을 붙여넣고 **Run**
3. **Project Settings → API** 에서 두 값을 복사해 `assets/config.js` 에 넣기
   - `url` ← Project URL
   - `key` ← anon public 키 (또는 Publishable 키)
   - ⚠ service_role / Secret 키는 절대 넣지 않습니다
4. 들어온 문의 보기: **Table Editor → inquiries**

## 3. Vercel 배포
Node 설치 없이 GitHub을 거쳐 올리는 방법입니다.
1. GitHub에 새 저장소를 만들고 이 폴더를 올립니다 (Claude에게 "GitHub에 올려줘"라고 요청)
2. https://vercel.com 에서 GitHub로 로그인 → **Add New → Project** → 그 저장소 **Import**
3. Framework Preset은 **Other**, 나머지는 그대로 두고 **Deploy**
4. 나온 주소(`○○.vercel.app`)에서 문의를 하나 넣어보고, Supabase Table Editor에 남는지 확인

이후에는 GitHub에 올릴 때마다 Vercel이 자동으로 다시 배포합니다.

## 내 컴퓨터에서 미리 보기
```powershell
python -m http.server 5173
```
브라우저에서 http://localhost:5173 을 엽니다.
