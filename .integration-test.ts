import assert from 'node:assert/strict';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let passed = 0;
function ok(label: string) { passed += 1; console.log(`  ✓ ${label}`); }

function mockRes() {
  const res: any = {
    statusCode: 200,
    headersMap: {} as Record<string, string>,
    bodyText: undefined as string | undefined,
    status(code: number) { this.statusCode = code; return this; },
    setHeader(name: string, value: string) { this.headersMap[name.toLowerCase()] = value; return this; },
    send(data: string) { this.bodyText = data; return this; },
  };
  return res as VercelResponse & typeof res;
}

function mockReq(opts: { method: string; body?: unknown; cookie?: string; query?: Record<string, string> }): VercelRequest {
  return {
    method: opts.method,
    headers: opts.cookie ? { cookie: opts.cookie } : {},
    body: opts.body,
    query: opts.query ?? {},
  } as unknown as VercelRequest;
}

function json(res: any) { return res.bodyText ? JSON.parse(res.bodyText) : undefined; }
function cookieFrom(res: any): string {
  const setCookie: string = res.headersMap['set-cookie'];
  assert.ok(setCookie, 'expected a set-cookie header');
  return setCookie.split(';')[0];
}
async function call(handler: (req: VercelRequest, res: VercelResponse) => Promise<void>, req: VercelRequest) {
  const res = mockRes();
  await handler(req, res);
  return res;
}

async function main() {
  const site = (await import('./api/site.js')).default;
  const authLogin = (await import('./api/auth/[action].js')).default;
  const clubsIndex = (await import('./api/clubs/[[...params]].js')).default;
  const membersIndex = (await import('./api/members/[[...params]].js')).default;
  const eventsIndex = (await import('./api/events/[[...params]].js')).default;
  const sectionsIndex = (await import('./api/sections/[[...params]].js')).default;

  function login(action: string) {
    return (req: VercelRequest, res: VercelResponse) => authLogin({ ...req, query: { action } } as any, res);
  }

  console.log('-- public site aggregate: clubs, about-on-home, no power levels --');
  const siteRes = await call(site, mockReq({ method: 'GET' }));
  assert.equal(siteRes.statusCode, 200);
  const body = json(siteRes);
  assert.equal(body.sections.length, 6, `expected 6 sections, got ${body.sections.length}`);
  const clubsSection = body.sections.find((s: any) => s.type === 'clubs');
  assert.ok(clubsSection, 'clubs-type section present');
  assert.equal(clubsSection.items.length, 6, 'all 6 clubs present');
  const tc = clubsSection.items.find((c: any) => c.slug === 'technical-committee');
  assert.equal(tc.members.length, 8, 'technical-committee club has all 8 seeded members');
  const codingClub = clubsSection.items.find((c: any) => c.slug === 'coding-club');
  assert.equal(codingClub.events.length, 1, 'coding-club has its one assigned event');
  const about = body.sections.find((s: any) => s.type === 'custom' && s.config.variant === 'about');
  assert.ok(about, 'about-variant custom section present (folded into home)');
  assert.ok(!body.sections.some((s: any) => s.type === 'stats'), 'power levels / stats section still absent');
  ok('site aggregate reflects clubs + about-on-home + no stats');

  console.log('-- auth via Drizzle --');
  const loginRes = await call(login('login'), mockReq({ method: 'POST', body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_BOOTSTRAP_PASSWORD } }));
  assert.equal(loginRes.statusCode, 200);
  const cookie = cookieFrom(loginRes);
  ok('login works through Drizzle-backed auth');

  console.log('-- clubs CRUD --');
  const createClub = await call(clubsIndex, mockReq({
    method: 'POST', cookie, body: { name: 'Test Club', slug: 'test-club', tagline: 't', description: 'd', img_url: '', accent: 'cyan' },
  }));
  assert.equal(createClub.statusCode, 201);
  const clubId = json(createClub).id;
  ok('POST /api/clubs creates');

  const dupSlug = await call(clubsIndex, mockReq({
    method: 'POST', cookie, body: { name: 'Dupe', slug: 'test-club', tagline: '', description: '', img_url: '', accent: 'red' },
  }));
  assert.equal(dupSlug.statusCode, 409);
  ok('duplicate slug rejected with 409');

  const updateClub = await call(clubsIndex, mockReq({ method: 'PUT', cookie, query: { params: clubId }, body: { tagline: 'updated' } }));
  assert.equal(json(updateClub).tagline, 'updated');
  assert.equal(json(updateClub).name, 'Test Club', 'partial update preserves untouched fields');
  ok('PUT /api/clubs/:id merge-updates');

  console.log('-- member/event club assignment --');
  const createMember = await call(membersIndex, mockReq({
    method: 'POST', cookie, body: { club_id: clubId, name: 'Temp', role: '', img_url: '', quote: null, stats: [], size: 'sm' },
  }));
  assert.equal(createMember.statusCode, 201);
  assert.equal(json(createMember).club_id, clubId);
  const memberId = json(createMember).id;
  ok('member created with club_id assignment');

  const createEvent = await call(eventsIndex, mockReq({
    method: 'POST', cookie, body: { club_id: clubId, chapter: '99', page: '999', title: 'Temp Event', tag: '', date_label: '', description: '' },
  }));
  assert.equal(json(createEvent).club_id, clubId);
  const eventId = json(createEvent).id;
  ok('event created with club_id assignment');

  const site2 = await call(site, mockReq({ method: 'GET' }));
  const testClubInSite = json(site2).sections.find((s: any) => s.type === 'clubs').items.find((c: any) => c.slug === 'test-club');
  assert.equal(testClubInSite.members.length, 1);
  assert.equal(testClubInSite.events.length, 1);
  ok('site aggregate correctly scopes members/events to the new club');

  console.log('-- cleanup --');
  await call(membersIndex, mockReq({ method: 'DELETE', cookie, query: { params: memberId } }));
  await call(eventsIndex, mockReq({ method: 'DELETE', cookie, query: { params: eventId } }));
  const delClub = await call(clubsIndex, mockReq({ method: 'DELETE', cookie, query: { params: clubId } }));
  assert.equal(delClub.statusCode, 200);
  ok('test member/event/club cleaned up');

  console.log('-- sections still work (reorder, accent) --');
  const secList = await call(sectionsIndex, mockReq({ method: 'GET', cookie }));
  assert.equal(json(secList).length, 6);
  ok('sections list unaffected by Drizzle migration');

  console.log(`\nALL ${passed} CHECKS PASSED`);
}

main().catch((err) => {
  console.error('INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
