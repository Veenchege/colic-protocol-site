#!/usr/bin/env node
// Usage: node apply-blueprint-patch.js path/to/blueprint.html
// Replaces the lead-forwarding script block so the quiz ?ref= (assessment ID)
// is forwarded onto every Gumroad link, alongside the existing ?le= email.
// Writes blueprint.html.bak first. Refuses to change anything if the old
// block is not found exactly once.
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('Usage: node apply-blueprint-patch.js path/to/blueprint.html'); process.exit(1); }
const html = fs.readFileSync(file, 'utf8');

const OLD = `<script>
(function () {
  // Forward the lead's email (passed as ?le= from an email link, or elsewhere)
  // onto every Gumroad checkout link on this page, so the webhook can match
  // the eventual sale back to a specific lead even if they check out with a
  // different email than the one they used on the quiz.
  var params = new URLSearchParams(window.location.search);
  var leadEmail = params.get('le');
  if (!leadEmail) return;
  document.querySelectorAll('a[href*="colicprotocol.gumroad.com"]').forEach(function (a) {
    var url = new URL(a.href);
    url.searchParams.set('le', leadEmail);
    a.href = url.toString();
  });
})();
</script>`;

const NEW = `<script>
(function () {
  // Forward the lead's email (?le=) and the quiz assessment ID (?ref=)
  // onto every Gumroad checkout link so the webhook can match the sale.
  var params = new URLSearchParams(window.location.search);
  var leadEmail = params.get('le');
  var ref = params.get('ref');
  if (!leadEmail && !ref) return;
  document.querySelectorAll('a[href*="colicprotocol.gumroad.com"]').forEach(function (a) {
    var url = new URL(a.href);
    if (leadEmail) url.searchParams.set('le', leadEmail);
    if (ref) url.searchParams.set('ref', ref);
    a.href = url.toString();
  });
})();
</script>`;

const count = html.split(OLD).length - 1;
if (count !== 1) {
  console.error('Expected the old block exactly once, found ' + count + '. Nothing changed. Edit by hand using the NEW block in this file.');
  process.exit(2);
}
fs.writeFileSync(file + '.bak', html);
fs.writeFileSync(file, html.replace(OLD, NEW));
console.log('Patched ' + file + ' (backup at ' + file + '.bak)');
