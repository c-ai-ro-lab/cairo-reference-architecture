// Runs the workflow's Code-node logic outside n8n with stubbed globals.
// Usage: node workflows/client-intake-agent/tests/code-nodes.test.js
const assert = require('node:assert');
const path = require('node:path');
const wf = require(path.join(__dirname, '..', 'workflow.json'));

const code = (name) => wf.nodes.find((n) => n.name === name).parameters.jsCode;
const run = (src, input, refs = {}) => {
  const $input = { first: () => ({ json: input }) };
  const $ = (n) => ({ first: () => ({ json: refs[n] }) });
  return new Function('$input', '$', src)($input, $);
};
const sample = (f) => require(path.join(__dirname, '..', 'samples', f));

// 1. Valid lead passes and is normalized
const ok = run(code('Validate & Normalize Input'), sample('valid-request.json'))[0].json;
assert.strictEqual(ok.valid, true);
assert.strictEqual(ok.lead.email, ok.lead.email.toLowerCase());

// 2. Empty / malformed payloads are rejected without throwing
for (const bad of [{}, { body: null }, sample('invalid-request.json')]) {
  const r = run(code('Validate & Normalize Input'), bad)[0].json;
  assert.strictEqual(r.valid, false);
  assert.ok(r.errors.length > 0);
}

// 3. Well-formed LLM output is accepted
const refs = { 'Validate & Normalize Input': ok };
const good = run(code('Parse & Validate LLM Output'),
  { content: [{ text: JSON.stringify(sample('expected-llm-output.json')) }] }, refs)[0].json;
assert.strictEqual(good.qualification.reason, 'ok');

// 4. Malformed, off-schema, or missing LLM output falls back to human review
const badOutputs = [
  {},
  { content: [{ text: 'Sure! Here is the analysis...' }] },
  { content: [{ text: '{"summary":"x","recommended_tier":"Platinum","qualification_score":90}' }] },
  { content: [{ text: '{"summary":"x","recommended_tier":"Growth","qualification_score":150}' }] },
];
for (const b of badOutputs) {
  const r = run(code('Parse & Validate LLM Output'), b, refs)[0].json;
  assert.strictEqual(r.qualification.needs_human_review, true);
  assert.strictEqual(r.qualification.reason, 'llm_output_invalid');
}

console.log('All code-node tests passed.');
