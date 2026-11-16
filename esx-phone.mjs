// 乐鑫科技 688018 手机监测 (零依赖, dsh-go 内置 Node.js 直接跑)
// node esx-phone.mjs        查一次
// node esx-phone.mjs 140    带成本价, 额外算盈亏
// node esx-phone.mjs 140 w  每60秒刷一次, Ctrl+C 停
const C = 'sh688018';
const K = { nh: 183.85, ph: 176.15, b: 167.3, pv: 160.13, g: 158.25 };

const get = async (u, gbk) => {
  let e;
  for (let i = 0; i < 3; i++) {
    try {
      const c = new AbortController(), t = setTimeout(() => c.abort(), 12000);
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile' }, signal: c.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const b = Buffer.from(await r.arrayBuffer());
      if (!gbk) return b.toString('utf8');
      try { return new TextDecoder('gbk').decode(b); } catch { return b.toString('latin1'); }
    } catch (x) { e = x; if (i < 2) await new Promise(s => setTimeout(s, 700)); }
  }
  throw e;
};

async function run(cost) {
  const [qt, kt] = await Promise.all([
    get(`http://qt.gtimg.cn/q=${C}`, 1),
    get(`https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${C},day,,,70,qfq`).catch(() => ''),
  ]);
  const f = (qt.match(/"([^"]+)"/) || [, ''])[1].split('~');
  const n = i => { const v = parseFloat(f[i]); return isFinite(v) ? v : 0; };
  const p = n(3), ch = n(32), vr = n(49), to = n(38), am = n(37) / 1e4, amp = n(43);

  let cl = [];
  try {
    const j = JSON.parse(kt);
    cl = (j.data[C].qfqday || j.data[C].day || []).map(r => +r[2]);
  } catch { }
  const ma = k => cl.length >= k ? cl.slice(-k).reduce((a, b) => a + b, 0) / k : 0;
  const m5 = ma(5), m20 = ma(20), m60 = ma(60);

  let rsi = 0;
  if (cl.length > 7) {
    let ag = 0, al = 0;
    for (let i = 1; i <= 6; i++) { const d = cl[i] - cl[i - 1]; d >= 0 ? ag += d : al -= d; }
    ag /= 6; al /= 6;
    for (let i = 7; i < cl.length; i++) {
      const d = cl[i] - cl[i - 1];
      ag = (ag * 5 + Math.max(d, 0)) / 6; al = (al * 5 + Math.max(-d, 0)) / 6;
    }
    rsi = al ? 100 - 100 / (1 + ag / al) : 100;
  }

  const S = [], add = (l, s, t) => S.push([l, s, t]);
  if (m60 && p < m60) add('A', '卖', `跌破MA60(${m60.toFixed(2)})，趋势破坏 → 清仓`);
  else if (m20 && p < m20 && ch < -2) add('A', '卖', `跌破MA20(${m20.toFixed(2)})且跌${ch.toFixed(1)}% → 清仓`);
  if (ch <= -7 && am >= 25) add('A', '卖', `放量长阴${ch.toFixed(1)}%/${am.toFixed(0)}亿 → 减半`);
  if (p >= K.ph * .98 && vr < 1.2) add('B', '卖', `冲前高${K.ph}滞涨 → 减30%`);
  if (rsi > 85 && to > 8) add('B', '卖', `RSI6 ${rsi.toFixed(0)}超买+换手${to.toFixed(1)}% → 减20%`);
  if (p > K.nh && am > 25) add('A', '买', `破历史新高且放量 → 跟进20%`);
  if (m20 && Math.abs(p - m20) / m20 <= .02 && vr < .85 && ch > -1) add('B', '买', `回踩MA20缩量止跌 → 建仓30%`);
  if (p > K.b && vr > 1.5) add('B', '买', `站上${K.b}放量 → 加仓30%`);
  if (m60 && p <= m60 * 1.03 && rsi < 25) add('B', '买', `跌至MA60超卖 → 短线试仓`);
  if (!S.length) add('C', '看', m5 && p < m5 ? `跌破MA5(${m5.toFixed(2)})短线转弱，反弹是减仓位` : '无明确信号 → 持有观察');

  const t = S[0];
  const L = [];
  L.push(`${f[1] || '乐鑫科技'} ${p.toFixed(2)}  ${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%   ${new Date().toLocaleTimeString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })}`);
  L.push(`量比${vr.toFixed(2)} 换手${to.toFixed(2)}% 振幅${amp.toFixed(2)}% 成交${am.toFixed(2)}亿`);
  L.push('');
  L.push(`${t[1]}【${t[0]}级】${t[2]}`);
  L.push(t[1] === '卖' ? `  持仓→按比例减，破${m20 ? m20.toFixed(2) : '149'}清仓` : t[1] === '买' ? `  空仓→分批建，止损${K.g}下方` : `  持仓→拿住，破${K.pv}减半`);
  S.slice(1, 3).forEach(s => L.push(`  ${s[1]} ${s[2]}`));
  L.push('');
  L.push(`上 ${K.nh} / ${K.ph} / ${K.b}`);
  L.push(`下 ${K.pv} / ${K.g} / ${m20 ? m20.toFixed(2) : '--'} / ${m60 ? m60.toFixed(2) : '--'}`);
  L.push(`距MA20 ${m20 ? ((p / m20 - 1) * 100).toFixed(1) : '--'}%  距新高 ${((p / K.nh - 1) * 100).toFixed(1)}%  RSI6 ${rsi.toFixed(0)}`);

  if (cost > 0) {
    const pl = (p / cost - 1) * 100, pl1 = Math.round(pl * 10) / 10;
    const adv = pl1 >= 25 ? '减仓落袋' : pl1 >= 15 ? '减1/3锁利' : pl1 >= 8 ? '持有，止损上移到成本' : pl1 >= 0 ? '守成本' : pl1 >= -8 ? `看${m20 ? m20.toFixed(2) : '149'}止跌` : '破纪律线，减仓';
    L.push('');
    L.push(`成本${cost} → 浮盈${pl >= 0 ? '+' : ''}${pl.toFixed(1)}%  ${adv}`);
  }
  console.log(L.join('\n'));
}

const cost = parseFloat(process.argv[2] || '0') || 0;
await run(cost);
if (process.argv[3] === 'w') {
  setInterval(() => { console.clear?.(); run(cost).catch(e => console.log('采集失败:', e.message)); }, 60000);
}
