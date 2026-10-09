import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadTs } from './helpers/load-ts.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const { GUIDES, guideSeenKey } = loadTs('src/lib/guide/content.ts');

const SOURCES = {
  admin: ['src/app/admin/layout.tsx'],
  doctor: ['src/app/doctor/layout.tsx'],
  customer: ['src/components/Navbar.tsx', 'src/components/NotificationBell.tsx'],
};

test('every role has a tour and guide topics with real content', () => {
  for (const role of ['admin', 'doctor', 'customer']) {
    const guide = GUIDES[role];
    assert.ok(guide.tour.length >= 4, `${role} tour is too short`);
    assert.ok(guide.topics.length >= 4, `${role} has too few topics`);
    for (const step of guide.tour) {
      assert.ok(step.title.trim() && step.body.trim(), `${role} tour step is empty`);
    }
    const ids = guide.topics.map((topic) => topic.id);
    assert.equal(new Set(ids).size, ids.length, `${role} topic ids must be unique`);
    for (const topic of guide.topics) {
      assert.ok(topic.title.trim() && topic.summary.trim() && topic.steps.length > 0, `${role}/${topic.id} is incomplete`);
    }
  }
});

test('every tour target exists in the page it points at', () => {
  for (const role of ['admin', 'doctor', 'customer']) {
    const source = SOURCES[role].map(read).join('\n');
    for (const step of GUIDES[role].tour.filter((item) => item.target)) {
      const target = step.target;
      if (target.startsWith('nav:')) {
        const href = target.slice('nav:'.length);
        assert.ok(source.includes(`href: '${href}'`), `${role} tour points at a menu ${href} that does not exist`);
      } else {
        assert.ok(
          source.includes(`data-tour="${target}"`) || source.includes(`'${target}'`),
          `${role} tour points at "${target}" which is not marked in the page`
        );
      }
    }
  }
});

test('the guide pages named by the roles exist', () => {
  for (const role of ['admin', 'doctor', 'customer']) {
    const page = path.join('src/app', GUIDES[role].guideHref, 'page.tsx');
    assert.ok(fs.existsSync(path.join(root, page)), `${GUIDES[role].guideHref} has no page`);
  }
});

test('the seen marker is kept per role and per user', () => {
  assert.notEqual(guideSeenKey('admin', 1), guideSeenKey('admin', 2));
  assert.notEqual(guideSeenKey('admin', 1), guideSeenKey('doctor', 1));
});
