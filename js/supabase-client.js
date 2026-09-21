/* supabase-client.js - SDK 없이 Supabase REST(PostgREST)로 RSVP 한 줄을 INSERT 합니다.
   RLS 가 anon 의 insert 만 허용하므로 응답 본문(return=representation)은 요청하지 않습니다. */
(function (root) {
  'use strict';

  function isConfigured() {
    const s = (root.CONFIG && root.CONFIG.supabase) || {};
    return Boolean(s.url && s.anonKey) && !/YOUR-/i.test(s.url + s.anonKey);
  }

  async function insertRsvp(row) {
    if (!isConfigured()) throw new Error('Supabase is not configured (edit js/config.js)');
    const s = root.CONFIG.supabase;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(s.url.replace(/\/+$/, '') + '/rest/v1/' + (s.table || 'rsvps'), {
        method: 'POST',
        headers: {
          apikey: s.anonKey,
          Authorization: 'Bearer ' + s.anonKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error('Supabase ' + res.status + ' ' + body.slice(0, 200));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  root.SupabaseClient = { isConfigured, insertRsvp };
})(window);
