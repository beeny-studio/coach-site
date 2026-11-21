/*
 * Supabase 연결 정보
 * ─────────────────────────────────────────────
 * Supabase 대시보드 → Project Settings → API (또는 API Keys) 에서 복사해 넣으세요.
 *
 *  • url : Project URL  (예: https://abcdefgh.supabase.co)
 *  • key : anon(public) 키 또는 Publishable 키 (sb_publishable_... 로 시작)
 *
 * 이 두 값은 원래 화면(브라우저)에 공개되는 값이라 여기 넣어도 됩니다.
 * 대신 supabase/schema.sql 의 보안 설정(RLS)으로 "넣기만 되고 읽기는 안 되게" 막아둡니다.
 *
 * ⚠ service_role 키 / Secret 키(sb_secret_...)는 절대 여기 넣지 마세요.
 */
window.SUPABASE_CONFIG = {
  url: "",
  key: "",
};
