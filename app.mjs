import {renderMarkdown, escapeHtml, rollDice, clockText, FocusTimer} from './core.mjs';
import {articles, categories, games} from './content.mjs';
const $ = selector => document.querySelector(selector);
let category = 'all';
function renderArticles() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const matches = articles.filter(a => (category === 'all' || a.category === category) && `${a.title} ${a.summary} ${a.body} ${categories[a.category]}`.toLocaleLowerCase().includes(query));
  $('#article-list').innerHTML = matches.map(a => `<button class="article-row" data-article="${a.id}" aria-label="阅读示例笔记：${escapeHtml(a.title)}"><span class="article-num">${String(articles.indexOf(a)+1).padStart(2,'0')}</span><span class="article-content"><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.summary)}</p><span class="article-meta"><span class="pill">${categories[a.category]}</span><span>${a.read}阅读</span><span>示例笔记</span></span></span><span class="article-arrow" aria-hidden="true">↗</span></button>`).join('');
  $('#no-results').hidden = matches.length !== 0;
  $('#result-count').textContent = `共 ${matches.length} 篇笔记`;
}
$('#search').addEventListener('input', renderArticles);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active',b === button); b.setAttribute('aria-pressed',String(b === button)); });
  renderArticles();
}));
document.addEventListener('keydown', event => {
  if (event.key === '/' && !document.querySelector('dialog[open]') && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
});
function showDetail(title, subtitle, body, label, badge) {
  $('#detail-label').textContent = label;
  $('#detail-content').innerHTML = `<span class="sample-badge">${badge}</span><h2>${escapeHtml(title)}</h2><p class="dialog-subtitle">${escapeHtml(subtitle)}</p><div class="prose">${renderMarkdown(body)}</div>`;
  $('#detail-dialog').showModal();
}
$('#article-list').addEventListener('click', event => {
  const button = event.target.closest('[data-article]'); if (!button) return;
  const article = articles.find(a => a.id === button.dataset.article);
  showDetail(article.title, article.summary, article.body, `KNOWLEDGE ARCHIVE / ${categories[article.category]}`, '示例笔记 · 可替换为你的文章');
});
document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => {
  const game = games[button.dataset.game];
  showDetail(game.title,game.subtitle,game.body,'THE GAME ROOM / 项目档案','示例项目 · 虚构概念');
}));
document.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => $(`#${button.dataset.tool}-dialog`).showModal()));
const diceHistory = [];
$('#roll').addEventListener('click', () => {
  const fields = [$('#dice-count'),$('#dice-bonus')];
  for (const field of fields) if (!field.reportValidity()) return;
  const sides = Number($('#dice-sides').value), count = Number($('#dice-count').value), bonus = Number($('#dice-bonus').value);
  const {values,total} = rollDice(sides,count,bonus);
  const notation = `${count}D${sides}${bonus ? (bonus > 0 ? ' + ' : ' − ') + Math.abs(bonus) : ''}`;
  const breakdown = values.join(' + ') + (bonus ? `${bonus > 0 ? ' + ' : ' − '}${Math.abs(bonus)}` : '');
  $('#dice-total').textContent = total;
  $('#dice-breakdown').textContent = `${notation} · ${breakdown} = ${total}`;
  diceHistory.unshift({notation,total}); diceHistory.splice(5);
  $('#dice-history').innerHTML = diceHistory.map(item => `<li><span>${item.notation}</span><strong>${item.total}</strong></li>`).join('');
});
const timer = new FocusTimer();
let finished = false;
function updateTimer() {
  const left = timer.left();
  if (timer.running && left === 0) { timer.pause(); finished = true; $('#focus-status').textContent = '这一轮专注完成了。伸个懒腰，休息一下吧。'; }
  $('#focus-clock').textContent = clockText(left);
  $('#focus-toggle').textContent = timer.running ? '暂停' : finished ? '再来一轮' : left < timer.duration ? '继续专注' : '开始专注';
  $('#focus-minutes').disabled = timer.running || (left < timer.duration && !finished);
  $('#focus-badge').textContent = timer.running ? clockText(left) : finished ? '完成 ✓' : '↗';
  document.title = timer.running ? `${clockText(left)} · 专注中 · 齿轮与咒文` : finished ? '专注完成 · 齿轮与咒文' : '齿轮与咒文 · 机械与魔法';
}
$('#focus-toggle').addEventListener('click', () => {
  if (timer.running) { timer.pause(); $('#focus-status').textContent = '已暂停。准备好后，可以继续。'; }
  else {
    if (!$('#focus-minutes').reportValidity()) return;
    if (timer.remaining === timer.duration || finished) { timer.duration = Number($('#focus-minutes').value) * 60000; timer.reset(); }
    timer.start(); finished = false; $('#focus-status').textContent = '不用着急，一次只做一件事。';
  }
  updateTimer();
});
function setDuration() {
  if (!$('#focus-minutes').reportValidity()) return;
  timer.duration = Number($('#focus-minutes').value) * 60000;
  timer.reset(); finished = false; $('#focus-status').textContent = '准备好时，开始这一轮专注。'; updateTimer();
}
$('#focus-minutes').addEventListener('change', setDuration);
$('#focus-reset').addEventListener('click', setDuration);
setInterval(updateTimer,250);
document.addEventListener('visibilitychange',updateTimer);
const markdown = `# 一间机械与魔法的工坊\n\n每个想法，都值得一次小小的尝试。\n\n## 今天的探索清单\n\n- 记录一个**游戏灵感**\n- 留出一段*专注时间*\n- 做一个刚好能用的小工具\n\n> 好奇心是燃料，创造是咒语。\n\n### 一个小咒语\n\n\`\`\`\n齿轮 + 灵感 = 新的可能\n\`\`\`\n\n用 \`Markdown\` 给文字一点结构。`;
$('#markdown-input').value = markdown;
function updateMarkdown() { const value = $('#markdown-input').value; $('#markdown-preview').innerHTML = renderMarkdown(value); $('#word-count').textContent = `${Array.from(value).length} 字符 · ${value.split('\n').length} 行`; }
$('#markdown-input').addEventListener('input',updateMarkdown);
$('#download-markdown').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('#markdown-input').value], {type:'text/markdown;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = '工坊笔记.md'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
});
renderArticles(); updateTimer(); updateMarkdown();
