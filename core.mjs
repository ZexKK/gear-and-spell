export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function inline(text) {
  const tokens = [];
  const token = html => `\u0000${tokens.push(html) - 1}\u0000`;
  let value = escapeHtml(text.replace(/\u0000/g, ''));
  value = value.replace(/`([^`]+)`/g, (_, code) => token(`<code>${code}</code>`));
  value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => token(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`));
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return value.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
}
export function renderMarkdown(source) {
  const lines = source.replace(/\r/g, '').split('\n');
  let html = '', paragraph = [], list = '', code = null;
  const flushParagraph = () => { if (paragraph.length) { html += `<p>${paragraph.map(inline).join('<br>')}</p>`; paragraph = []; } };
  const flushList = () => { if (list) { html += `</${list}>`; list = ''; } };
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flushParagraph(); flushList();
      if (code !== null) { html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`; code = null; } else code = [];
      continue;
    }
    if (code !== null) { code.push(line); continue; }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const item = line.match(/^\s*(?:([-*])|\d+\.)\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); const n = heading[1].length; html += `<h${n}>${inline(heading[2])}</h${n}>`; }
    else if (item) { flushParagraph(); const type = item[1] ? 'ul' : 'ol'; if (list !== type) { flushList(); html += `<${type}>`; list = type; } html += `<li>${inline(item[2])}</li>`; }
    else if (/^>\s?/.test(line)) { flushParagraph(); flushList(); html += `<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`; }
    else if (/^---+$/.test(line.trim())) { flushParagraph(); flushList(); html += '<hr>'; }
    else { flushList(); paragraph.push(line); }
  }
  if (code !== null) html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`;
  flushParagraph(); flushList(); return html;
}
export function rollDice(sides, count, bonus, random = Math.random) {
  if (![4,6,8,10,12,20,100].includes(sides) || !Number.isInteger(count) || count < 1 || count > 10 || !Number.isInteger(bonus) || Math.abs(bonus) > 100) throw new RangeError('请选择有效的骰子参数');
  const values = Array.from({length: count}, () => Math.floor(random() * sides) + 1);
  return {values, total: values.reduce((sum, n) => sum + n, bonus)};
}
export function clockText(ms) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`; }
export class FocusTimer {
  constructor(minutes = 25, now = Date.now) { this.now = now; this.duration = minutes * 60000; this.reset(); }
  reset() { this.running = false; this.remaining = this.duration; this.deadline = 0; }
  start() { if (this.remaining <= 0) this.remaining = this.duration; this.deadline = this.now() + this.remaining; this.running = true; }
  pause() { this.remaining = this.left(); this.running = false; }
  left() { return this.running ? Math.max(0, this.deadline - this.now()) : this.remaining; }
}
