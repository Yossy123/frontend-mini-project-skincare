import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadTs } from './helpers/load-ts.mjs';

const root = path.resolve(import.meta.dirname, '..');
const config = loadTs('src/lib/legal/config.ts', { globals: { process } });
const content = loadTs('src/lib/legal/content.ts', { dependencies: { './config': config } });

test('every legal document has unique, anchored sections with text', () => {
  for (const [key, document] of Object.entries(content.LEGAL_DOCUMENTS)) {
    assert.ok(document.title && document.summary, `${key} needs a title and summary`);
    const ids = document.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length, `${key} section ids must be unique`);
    for (const section of document.sections) {
      assert.ok(section.title && section.body.length > 0, `${key}/${section.id} is empty`);
    }
    assert.ok(ids.includes('kontak'), `${key} must end with a contact section`);
  }
});

test('each document is served at its path, and the footer and sign-up form link to them', () => {
  const footer = fs.readFileSync(path.join(root, 'src/components/Footer.tsx'), 'utf8');
  const register = fs.readFileSync(path.join(root, 'src/app/register/page.tsx'), 'utf8');

  for (const [key, href] of Object.entries(content.LEGAL_PATHS)) {
    assert.ok(fs.existsSync(path.join(root, 'src/app', href, 'page.tsx')), `${href} has no page`);
    assert.ok(footer.includes(`LEGAL_PATHS.${key}`), `the footer must link to ${href}`);
  }
  assert.ok(register.includes('/syarat-ketentuan') && register.includes('/kebijakan-privasi'), 'sign-up must link to the terms and privacy policy');
});

test('contact lines leave out details that are not filled in', () => {
  const lines = config.contactLines();
  assert.ok(lines[0].startsWith('WhatsApp: +62'));
  assert.ok(lines.every((line) => !line.endsWith(': ')), 'no empty contact line');
});
