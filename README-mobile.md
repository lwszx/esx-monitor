# 乐鑫科技 688018.SH 手机看盘页

纯静态单文件页面（`index.html`），无构建、无依赖，手机浏览器直接打开即可。
行情数据来自腾讯行情接口，页面每 **15 秒自动刷新**，切回前台立即刷新。

## 三种打开方式

| 方式 | 地址 |
| --- | --- |
| GitHub Pages | https://lwszx.github.io/esx-monitor/ |
| Statically CDN | https://cdn.statically.io/gh/lwszx/esx-monitor/main/index.html |
| raw.githack | https://raw.githack.com/lwszx/esx-monitor/main/index.html |

> GitHub Pages 需在仓库 Settings → Pages 中把 source 指到 `main` 分支根目录后生效；
> 两个 CDN 方式仓库公开即可直接访问，适合复制到微信里打开。

## 页面功能

- **实时价格**：现价、涨跌额、涨跌幅、开高低收、振幅，红涨绿跌配色
- **30 日走势**：迷你 SVG 折线 + 渐变填充，无需图表库
- **成交额 / 量比 / 换手**：三个关键量能指标
- **买卖信号**：按 MA5/10/20/60、RSI6/14、量比换手、关键位综合判定，分 A / B / C 三级
- **我的持仓**：填成本价 + 股数，自动算浮盈浮亏与建议动作（存 localStorage，只在本机）
- **关键位表**：历史新高、前高、突破线、多空分界、缺口下沿、MA20 / MA60，并给出距现价百分比
- **均线指标表**：MA5/10/20/60 与 RSI6/14，超买超卖标注

## 免责

本页只是技术工具与个人观察记录，所有信号为机械规则计算结果，**不构成任何投资建议**。
数据源为第三方公开接口，可能有延迟或错误，据此交易风险自负。
