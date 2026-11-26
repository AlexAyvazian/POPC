import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('petition page uses the generated live Change.org screenshot preview', async () => {
  const html = await fs.readFile(new URL('./petition.html', import.meta.url), 'utf8');
  assert(html.includes('src="images/petition-change-org-live.png"'));
  assert(html.includes('class="petition-live-screenshot-link"'));
  assert(html.includes('href="https://www.change.org/putvotersovercorporatedonors"'));
  assert(!html.includes('id="petition-count"'));
  assert(!html.includes('petition-live.js'));
});

test('scheduled capture workflow refreshes the preview without retriggering itself from image commits', async () => {
  const workflow = await fs.readFile(new URL('./.github/workflows/petition-preview.yml', import.meta.url), 'utf8');
  const script = await fs.readFile(new URL('./scripts/capture-petition-preview.py', import.meta.url), 'utf8');
  assert(workflow.includes('cron:'));
  assert(workflow.includes('capture-petition-preview.py'));
  assert(workflow.includes('images/petition-change-org-live.png'));
  assert(!workflow.includes("      - 'images/petition-change-org-live.png'"));
  assert(script.includes('Verified signatures'));
  assert(script.includes('putvotersovercorporatedonors'));
});
