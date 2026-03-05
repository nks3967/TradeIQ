import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as LightweightCharts from "lightweight-charts";

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { display: none; }
  html, body { margin: 0; padding: 0; }
  input, textarea, button, select { font-family: inherit; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.93) } to { opacity:1; transform:scale(1) } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(48px) } to { opacity:1; transform:translateY(0) } }
  @keyframes glow     { 0%,100% { box-shadow:0 0 32px rgba(0,100,255,0.28) } 50% { box-shadow:0 0 64px rgba(0,100,255,0.52) } }
  @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.38 } }
  @keyframes blink    { 0%,100% { opacity:1 } 50% { opacity:0 } }
  @keyframes tickUp   { 0% { color:#00E676 } 100% { } }
  @keyframes tickDown { 0% { color:#FF4458 } 100% { } }
  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes barGrow  { from { height:0 } to { } }

  .fu  { animation: fadeUp  0.38s ease both }
  .fi  { animation: fadeIn  0.32s ease both }
  .si  { animation: scaleIn 0.32s ease both }
  .su  { animation: slideUp 0.42s ease both }
  .hov { transition: transform 0.18s, opacity 0.18s; cursor:pointer }
  .hov:hover { transform: translateY(-2px); opacity:0.9 }
  .hov-s { transition: transform 0.16s cubic-bezier(.34,1.56,.64,1); cursor:pointer }
  .hov-s:hover { transform: scale(1.05) }
  .tab-b { transition: all 0.22s cubic-bezier(.34,1.56,.64,1) }
  .tab-b:hover { transform: scale(1.08) }
`;

/* ─── SVG ICONS (no emojis, clean strokes) ──────────────────────────────── */
const Ic = ({ n, s=22, c="currentColor", style:sx={} }) => {
  const base = { width:s, height:s, display:"block", flexShrink:0 };
  const st = { fill:"none", stroke:c, strokeWidth:"1.7", strokeLinecap:"round", strokeLinejoin:"round" };
  const ico = {
    portfolio:  <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    markets:    <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    trade:      <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    learn:      <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    settings:   <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    check:      <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st} strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow:      <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    back:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="15 18 9 12 15 6"/></svg>,
    close:      <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevron:    <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="9 18 15 12 9 6"/></svg>,
    upload:     <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    code:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    plus:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    sun:        <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    wallet:     <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="16" cy="13" r="1" fill={c} strokeWidth="0"/></svg>,
    chart:      <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    user:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    refresh:    <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    info:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    lock:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    star:       <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    trending:   <svg viewBox="0 0 24 24" style={{...base,...sx}} {...st}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  };
  return ico[n] || null;
};

/* ─── SYMBOLS ────────────────────────────────────────────────────────────── */
const SYMBOLS = {
  BTCUSDT:  { name:"Bitcoin",   short:"BTC",   color:"#F7931A", ws:"btcusdt",  rest:"BTCUSDT",  base:67000,  type:"crypto" },
  ETHUSDT:  { name:"Ethereum",  short:"ETH",   color:"#627EEA", ws:"ethusdt",  rest:"ETHUSDT",  base:3500,   type:"crypto" },
  SOLUSDT:  { name:"Solana",    short:"SOL",   color:"#9945FF", ws:"solusdt",  rest:"SOLUSDT",  base:175,    type:"crypto" },
  BNBUSDT:  { name:"BNB",       short:"BNB",   color:"#F3BA2F", ws:"bnbusdt",  rest:"BNBUSDT",  base:580,    type:"crypto" },
  XRPUSDT:  { name:"Ripple",    short:"XRP",   color:"#00AAE4", ws:"xrpusdt",  rest:"XRPUSDT",  base:0.60,   type:"crypto" },
  ADAUSDT:  { name:"Cardano",   short:"ADA",   color:"#0033AD", ws:"adausdt",  rest:"ADAUSDT",  base:0.48,   type:"crypto" },
  DOGEUSDT: { name:"Dogecoin",  short:"DOGE",  color:"#C2A633", ws:"dogeusdt", rest:"DOGEUSDT", base:0.16,   type:"meme"   },
  PEPEUSDT: { name:"PEPE",      short:"PEPE",  color:"#4CAF50", ws:"pepeusdt", rest:"PEPEUSDT", base:0.000014,type:"meme"   },
  XAUUSD:   { name:"Gold",      short:"XAU",   color:"#FFD700", ws:null,       rest:null,       base:2340,   type:"commodity"},
  EURUSD:   { name:"EUR/USD",   short:"EUR",   color:"#00C9FF", ws:null,       rest:null,       base:1.082,  type:"forex"  },
  NIFTY50:  { name:"Nifty 50",  short:"NIFTY", color:"#FF6B35", ws:null,       rest:null,       base:22400,  type:"index"  },
  SENSEX:   { name:"Sensex",    short:"SENSEX",color:"#FF6B9D", ws:null,       rest:null,       base:73800,  type:"index"  },
};

const TIMEFRAMES = ["1m","5m","15m","30m","1h","4h","1D","1W"];

/* ─── LEARN DATA ─────────────────────────────────────────────────────────── */
const LEARN_LEVELS = [
  {
    level: "Beginner",
    color: "#00C9FF",
    desc: "Start here — understand the fundamentals",
    lessons: [
      { title:"What is Paper Trading?", duration:"3 min", content:"Paper trading means practicing with virtual money. You execute real trades on live prices, but no actual money is at risk. It builds muscle memory, tests strategies, and teaches you how markets move — without the emotional cost of real losses. Use this phase to experiment aggressively." },
      { title:"Reading a Price Chart", duration:"4 min", content:"A price chart shows how an asset's value changes over time. The horizontal axis is time, the vertical axis is price. Every point on the chart represents a price at a specific moment. Zooming out shows you the big trend; zooming in shows short-term noise. Always look at multiple timeframes before deciding." },
      { title:"Candlestick Charts", duration:"5 min", content:"Each candle represents a time period (1m, 1h, 1D etc). The body shows open and close prices. Green body = price rose. Red body = price fell. The thin wicks above and below the body show the highest and lowest prices reached during that period. A long wick means price was strongly rejected at that level." },
      { title:"What is Volume?", duration:"3 min", content:"Volume is the number of units traded in a period. High volume on a price move = conviction. Low volume = weak move, likely to reverse. When price breaks a key level on high volume, the breakout is more likely to hold. Volume spikes without price movement often signal a major move loading up." },
    ],
  },
  {
    level: "Intermediate",
    color: "#9945FF",
    desc: "Learn the tools traders use every day",
    lessons: [
      { title:"Moving Averages (EMA vs SMA)", duration:"6 min", content:"SMA (Simple Moving Average) treats all candles equally — smooth but slow to react. EMA (Exponential Moving Average) weights recent prices more heavily — faster and more responsive. For short-term trading use EMA 9 and EMA 21. For trend direction, EMA 50 above/below price is a strong signal. EMA 200 defines the long-term trend. When short EMA crosses above long EMA, it is called a Golden Cross — a classic buy signal." },
      { title:"RSI — Relative Strength Index", duration:"5 min", content:"RSI measures the speed and magnitude of price changes on a 0-100 scale. Above 70 = overbought (price may pull back). Below 30 = oversold (price may bounce). But RSI divergence is more powerful: when price makes a new high but RSI does not, momentum is fading — a reversal is likely. RSI works best combined with trend structure, not as a standalone signal." },
      { title:"MACD Explained", duration:"6 min", content:"MACD uses two EMAs (12 and 26 period) subtracted from each other. When the MACD line crosses above the signal line, it is bullish momentum. The histogram bars show the distance between the two lines — growing bars mean momentum is building. Zero-line crossovers confirm new trend direction. MACD is most reliable on 1h timeframes and above." },
      { title:"Support and Resistance", duration:"5 min", content:"Support is a price level where buyers historically step in and stop price from falling further. Resistance is where sellers consistently appear. Once a resistance level is broken, it often becomes new support (role reversal). The more times price tests a level without breaking it, the more significant that level becomes. Mark these on Daily charts first, then look for entries on lower timeframes." },
    ],
  },
  {
    level: "Advanced",
    color: "#F7931A",
    desc: "Professional strategies and risk control",
    lessons: [
      { title:"Bollinger Bands Strategy", duration:"7 min", content:"Bollinger Bands consist of a 20-period SMA with an upper and lower band 2 standard deviations away. When bands squeeze together (low volatility), a major move is loading. Price touching the upper band in an uptrend is not automatically a sell — in strong trends, price can 'ride the band.' Look for candle patterns at the bands for confirmation. Band breaks on high volume signal strong continuation." },
      { title:"Risk Management — The Core Skill", duration:"8 min", content:"Never risk more than 1-2% of your capital on a single trade. Define your stop-loss before entering. Calculate position size based on stop distance, not on how much you want to make. A risk-to-reward ratio of 1:2 means even with a 40% win rate, you are profitable. Capital preservation is the only job of a beginner. Consistent small wins compound. Large losses do not recover easily." },
      { title:"Market Structure", duration:"7 min", content:"Markets move in a series of higher highs and higher lows (uptrend) or lower highs and lower lows (downtrend). A break of structure (BOS) occurs when price takes out a significant swing high or low. This signals a potential trend change. Smart money operates by inducing liquidity at key swing points before moving in the opposite direction. Understanding structure prevents trading against the dominant trend." },
      { title:"Building a Trading Plan", duration:"6 min", content:"A trading plan defines exactly what setups you trade, what timeframes you use, your entry rules, stop placement, take-profit targets, maximum daily loss limit, and when to stop trading. Without a plan, you are gambling. Review your trades every week. Track win rate, average risk-reward, and total P&L. Improve one thing at a time. The process matters more than any single trade." },
    ],
  },
];

/* ─── PRICE FORMATTING ───────────────────────────────────────────────────── */
const fmtP = (v) => {
  if (!v && v !== 0) return "—";
  if (v >= 10000) return v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (v >= 100)   return v.toFixed(2);
  if (v >= 1)     return v.toFixed(4);
  if (v >= 0.01)  return v.toFixed(6);
  return v.toFixed(8);
};
const fmtM = (v) => {
  const abs = Math.abs(v);
  if (abs >= 100000) return "₹" + (abs / 100000).toFixed(2) + "L";
  if (abs >= 1000)   return "₹" + (abs / 1000).toFixed(1) + "K";
  return "₹" + abs.toFixed(2);
};

/* ─── TECHNICAL ANALYSIS (computed from real candle data) ───────────────── */
function computeTechnicals(candles) {
  if (!candles || !Array.isArray(candles) || candles.length < 20) return null;
  const closes = candles.map(c => c.close);
  const n = closes.length;

  const ema = (data, period) => {
    const k = 2 / (period + 1);
    let e = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < data.length; i++) e = data[i] * k + e * (1 - k);
    return e;
  };
  const sma = (data, period) => data.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  const rsiVal = (() => {
    const slice = closes.slice(-15);
    let gains = 0, losses = 0;
    for (let i = 1; i < slice.length; i++) {
      const d = slice[i] - slice[i - 1];
      if (d > 0) gains += d; else losses += Math.abs(d);
    }
    if (losses === 0) return 100;
    const rs = (gains / 14) / (losses / 14);
    return 100 - 100 / (1 + rs);
  })();
  
  const macdLine = ema(closes, 12) - ema(closes, 26);
  const signal   = ema(closes.slice(-9).map((_, i) => ema(closes.slice(0, n - 9 + i + 1), 12) - ema(closes.slice(0, n - 9 + i + 1), 26)), 9);
  
  const stochSlice = candles.slice(-14);
  const hh = Math.max(...stochSlice.map(c => c.high));
  const ll = Math.min(...stochSlice.map(c => c.low));
  const stoch = ((closes[n - 1] - ll) / (hh - ll || 1)) * 100;
  
  const sma20 = sma(closes, 20);
  const std20 = Math.sqrt(closes.slice(-20).reduce((a, c) => a + (c - sma20) ** 2, 0) / 20);
  const bbUpper = sma20 + 2 * std20;
  const bbLower = sma20 - 2 * std20;
  const price = closes[n - 1];
  
  const atrSlice = candles.slice(-14);
  const atr = atrSlice.reduce((a, c, i) => {
    if (i === 0) return a;
    const prev = atrSlice[i - 1].close;
    return a + Math.max(c.high - c.low, Math.abs(c.high - prev), Math.abs(c.low - prev));
  }, 0) / 14;

  const e9  = ema(closes, 9);
  const e21 = ema(closes, 21);
  const e50 = ema(closes, Math.min(50, n));
  const e200= ema(closes, Math.min(200, n));
  const s14 = sma(closes, Math.min(14, n));
  const s50 = sma(closes, Math.min(50, n));

  const rows = [
    { n:"EMA 9",    v:fmtP(e9),       sig: price > e9   ? "BUY" : "SELL"    },
    { n:"EMA 21",   v:fmtP(e21),      sig: price > e21  ? "BUY" : "SELL"    },
    { n:"EMA 50",   v:fmtP(e50),      sig: price > e50  ? "BUY" : "SELL"    },
    { n:"EMA 200",  v:fmtP(e200),     sig: price > e200 ? "BUY" : "SELL"    },
    { n:"SMA 14",   v:fmtP(s14),      sig: price > s14  ? "BUY" : "SELL"    },
    { n:"SMA 50",   v:fmtP(s50),      sig: price > s50  ? "BUY" : "SELL"    },
    { n:"RSI(14)",  v:rsiVal.toFixed(1), sig: rsiVal>70?"SELL":rsiVal<30?"BUY":"NEUTRAL" },
    { n:"MACD",     v:macdLine.toFixed(4), sig: macdLine > signal ? "BUY" : "SELL" },
    { n:"Stoch",    v:stoch.toFixed(1),  sig: stoch>80?"SELL":stoch<20?"BUY":"NEUTRAL" },
    { n:"BB Upper", v:fmtP(bbUpper),  sig: price > bbUpper ? "SELL" : "NEUTRAL" },
    { n:"BB Lower", v:fmtP(bbLower),  sig: price < bbLower ? "BUY"  : "NEUTRAL" },
    { n:"ATR",      v:fmtP(atr),      sig: "NEUTRAL" },
  ];
  const buys     = rows.filter(r => r.sig === "BUY").length;
  const sells    = rows.filter(r => r.sig === "SELL").length;
  const neutrals = rows.filter(r => r.sig === "NEUTRAL").length;
  const score    = buys / rows.length;
  const overall  =
    score > 0.65 ? "STRONG BUY"  :
    score > 0.50 ? "BUY"         :
    score < 0.25 ? "STRONG SELL" :
    score < 0.40 ? "SELL"        : "NEUTRAL";
  const oc = overall.includes("BUY") ? "#00E676" : overall.includes("SELL") ? "#FF4458" : "#FFB300";

  return { rows, buys, sells, neutrals, overall, oc, rsi: rsiVal, atr, bbUpper, bbLower, sma20, e9, e21, e50 };
}

function NativeChart({ candles, theme, overlays = [] }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const ema9Ref = useRef(null);
  const ema21Ref = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const { createChart, CandlestickSeries, LineSeries } = LightweightCharts;

    const dark = theme === "dark";
    const textColor = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,80,0.55)";
    const gridColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,100,0.06)";

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 300,
      height: chartContainerRef.current.clientHeight || 300,
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: { mode: 1 },
    });

    let candleSeries;
    let ema9;
    let ema21;

    // v5 path
    if (
      typeof chart.addSeries === "function" &&
      CandlestickSeries &&
      LineSeries
    ) {
      candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00E676",
        downColor: "#FF4458",
        borderVisible: false,
        wickUpColor: "#00E676",
        wickDownColor: "#FF4458",
      });

      ema9 = chart.addSeries(LineSeries, {
        color: "#2962FF",
        lineWidth: 2,
        crosshairMarkerVisible: false,
      });

      ema21 = chart.addSeries(LineSeries, {
        color: "#FF6D00",
        lineWidth: 2,
        lineStyle: 2,
        crosshairMarkerVisible: false,
      });
    } else {
      // v4 fallback
      candleSeries = chart.addCandlestickSeries({
        upColor: "#00E676",
        downColor: "#FF4458",
        borderVisible: false,
        wickUpColor: "#00E676",
        wickDownColor: "#FF4458",
      });

      ema9 = chart.addLineSeries({
        color: "#2962FF",
        lineWidth: 2,
        crosshairMarkerVisible: false,
      });

      ema21 = chart.addLineSeries({
        color: "#FF6D00",
        lineWidth: 2,
        lineStyle: 2,
        crosshairMarkerVisible: false,
      });
    }

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema9Ref.current = ema9;
    ema21Ref.current = ema21;

    resizeObserverRef.current = new ResizeObserver(() => {
      if (!chartRef.current || !chartContainerRef.current) return;
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth || 300,
        height: chartContainerRef.current.clientHeight || 300,
      });
    });

    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      ema9Ref.current = null;
      ema21Ref.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;
    if (!Array.isArray(candles) || candles.length === 0) return;

    const ema9Values = overlays?.[0]?.values || [];
    const ema21Values = overlays?.[1]?.values || [];

    const mapByTime = new Map();

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (!c || c.time == null) continue;

      const sec = Math.floor(Number(c.time) / 1000);
      if (!Number.isFinite(sec)) continue;

      mapByTime.set(sec, {
        time: sec,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        e9: Number(ema9Values[i]),
        e21: Number(ema21Values[i]),
      });
    }

    const sorted = Array.from(mapByTime.values()).sort((a, b) => a.time - b.time);

    const candleData = sorted.map((x) => ({
      time: x.time,
      open: x.open,
      high: x.high,
      low: x.low,
      close: x.close,
    }));

    const e9Data = sorted
      .filter((x) => Number.isFinite(x.e9))
      .map((x) => ({ time: x.time, value: x.e9 }));

    const e21Data = sorted
      .filter((x) => Number.isFinite(x.e21))
      .map((x) => ({ time: x.time, value: x.e21 }));

    if (!candleData.length) return;

    candleSeriesRef.current.setData(candleData);
    ema9Ref.current?.setData(e9Data);
    ema21Ref.current?.setData(e21Data);

    chartRef.current?.timeScale().fitContent();
  }, [candles, overlays]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "100%", minHeight: 300 }} />;
}

/* ─── WEBSOCKET PRICE HOOK ───────────────────────────────────────────────── */
function useBinancePrices(symbols, isActive, tf) {
  const [prices, setPrices]   = useState({});
  const [candles, setCandles] = useState({});
  const [dir, setDir]         = useState({});
  const wsRef  = useRef(null);
  const candRef= useRef({});

  useEffect(() => {
    if (!isActive) return;
    const seeded = {};
    Object.entries(SYMBOLS).forEach(([k, s]) => {
      if (!s.ws) {
        const cands = [];
        let p = prices[k] || s.base;
        for (let i = 0; i < 80; i++) {
          const open  = p;
          const close = open + (Math.random() - 0.5) * open * 0.001;
          const high  = Math.max(open, close) + Math.random() * open * 0.0005;
          const low   = Math.min(open, close) - Math.random() * open * 0.0005;
          cands.push({ open, close, high, low, time: Date.now() - (80 - i) * 60000 });
          p = close;
        }
        seeded[k] = cands;
        candRef.current[k] = cands;
      }
    });
    setCandles(c => ({ ...c, ...seeded }));
    setPrices(p => {
      const n = { ...p };
      Object.entries(SYMBOLS).forEach(([k, s]) => { if (!s.ws && !n[k]) n[k] = s.base; });
      return n;
    });
  }, [isActive, tf]);

  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => {
      setPrices(p => {
        const n = { ...p }; const d = {};
        Object.entries(SYMBOLS).forEach(([k, s]) => {
          if (!s.ws) {
            const drift = (Math.random() - 0.495) * s.base * 0.0001;
            n[k] = Math.max((n[k] || s.base) + drift, s.base * 0.2);
            d[k] = drift >= 0 ? "up" : "down";
            const prev = candRef.current[k] || [];
            const last = prev[prev.length - 1];
            if (last) {
              const newC = { ...last, close: n[k], high: Math.max(last.high, n[k]), low: Math.min(last.low, n[k]) };
              const updated = [...prev.slice(-79), newC];
              candRef.current[k] = updated;
              setCandles(c => ({ ...c, [k]: updated }));
            }
          }
        });
        setDir(dd => ({ ...dd, ...d }));
        return n;
      });
    }, 1500);
    return () => clearInterval(iv);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const interval = tf.toLowerCase();

    Object.entries(SYMBOLS).filter(([, s]) => s.ws).forEach(([key, s]) => {
      fetch(`https://api.binance.com/api/v3/klines?symbol=${s.rest}&interval=${interval}&limit=80`)
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          const cands = data.map(d => ({
            open:  parseFloat(d[1]),
            high:  parseFloat(d[2]),
            low:   parseFloat(d[3]),
            close: parseFloat(d[4]),
            time:  d[0],
          }));
          candRef.current[key] = cands;
          setCandles(c => ({ ...c, [key]: cands }));
          setPrices(p => ({ ...p, [key]: cands[cands.length - 1]?.close || p[key] }));
        })
        .catch(console.error);
    });

    const streams = Object.entries(SYMBOLS)
      .filter(([, s]) => s.ws)
      .map(([, s]) => `${s.ws}@ticker`);
    const url = `wss://stream.binance.com:9443/stream?streams=${streams.join("/")}`;
    let ws;
    let retryTimer;

    const connect = () => {
      try {
        ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onmessage = (e) => {
          try {
            const { stream, data } = JSON.parse(e.data);
            const sym = Object.entries(SYMBOLS).find(([, s]) => s.ws && stream.startsWith(s.ws));
            if (sym) {
              const [key] = sym;
              const price = parseFloat(data.c);
              setPrices(p => {
                const prevP = p[key] || SYMBOLS[key].base;
                setDir(d => ({ ...d, [key]: price >= prevP ? "up" : "down" }));
                return { ...p, [key]: price };
              });
            }
          } catch (_) {}
        };
        ws.onerror = () => {};
        ws.onclose = () => { retryTimer = setTimeout(connect, 3000); };
      } catch (_) {}
    };
    connect();

    return () => {
      clearTimeout(retryTimer);
      if (ws) ws.close();
    };
  }, [isActive, tf]);

  useEffect(() => {
    if (!isActive) return;
    Object.entries(SYMBOLS).filter(([, s]) => s.ws).forEach(([key]) => {
      const price = prices[key];
      if (!price) return;
      const prev = candRef.current[key];
      if (!prev || prev.length === 0) return;
      const last = { ...prev[prev.length - 1] };
      last.close = price;
      last.high  = Math.max(last.high, price);
      last.low   = Math.min(last.low, price);
      const updated = [...prev.slice(0, -1), last];
      candRef.current[key] = updated;
      setCandles(c => ({ ...c, [key]: updated }));
    });
  }, [prices, isActive]);

  return { prices, candles, dir };
}


/* ─── THEME ──────────────────────────────────────────────────────────────── */
const makeT = (dark) => ({
  bg:     dark ? "#05080f"                   : "#eef2ff",
  card:   dark ? "rgba(255,255,255,0.056)"   : "rgba(255,255,255,0.75)",
  border: dark ? "rgba(255,255,255,0.088)"   : "rgba(0,0,100,0.09)",
  text:   dark ? "#ffffff"                   : "#08101e",
  sub:    dark ? "rgba(255,255,255,0.40)"    : "rgba(0,0,80,0.42)",
  dim:    dark ? "rgba(255,255,255,0.18)"    : "rgba(0,0,80,0.18)",
  nav:    dark ? "rgba(4,7,16,0.90)"         : "rgba(228,236,255,0.90)",
  inp:    dark ? "rgba(255,255,255,0.07)"    : "rgba(0,0,80,0.055)",
  accent: "#0073FF",
});

/* ─── SPARKLINE ──────────────────────────────────────────────────────────── */
function Spark({ candles, up }) {
  if (!candles || !Array.isArray(candles) || candles.length < 2) return <div style={{ width:80, height:30 }}/>;
  const closes = candles.slice(-20).map(c => c.close).filter(n => !isNaN(n));
  if (closes.length < 2) return <div style={{ width:80, height:30 }}/>;
  const min = Math.min(...closes), max = Math.max(...closes);
  const pts = closes.map((v, i) => {
    const x = (i / (closes.length - 1)) * 80;
    const y = 28 - ((v - min) / (max - min || 1)) * 26;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="80" height="30" style={{ display:"block" }}>
      <polyline points={pts} fill="none" stroke={up ? "#00E676" : "#FF4458"} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── LOCAL STORAGE HOOK ─────────────────────────────────────────────────── */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Local Storage Error:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Local Storage Error:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/* ─── MEMOIZED STYLES ────────────────────────────────────────────────────── */
const GlobalStyle = React.memo(() => <style>{CSS}</style>);

/* ─── ONBOARDING SHELL ───────────────────────────────────────────────────── */
const Obshell = ({ step, title, sub, children, dark, T }) => (
  <div style={{ minHeight:"100vh", background: dark ? "linear-gradient(150deg,#030610,#09152a)" : "linear-gradient(150deg,#eef2ff,#e4ecff)", display:"flex", flexDirection:"column", alignItems:"center", padding:"52px 22px 32px", fontFamily:"DM Sans, sans-serif", color:T.text }}>
    <GlobalStyle />
    <div style={{ width:"100%", maxWidth:400 }}>
      <div style={{ display:"flex", gap:6, marginBottom:32 }}>
        {[1,2,3].map(s => <div key={s} style={{ flex:1, height:3, borderRadius:2, background: s<=step ? "#0073FF" : dark?"rgba(255,255,255,0.1)":"rgba(0,0,100,0.1)", transition:"background 0.4s" }}/>)}
      </div>
      <div className="fu" style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.8px", marginBottom:6, lineHeight:1.2 }}>{title}</div>
      <div className="fu" style={{ fontSize:14, color:T.sub, marginBottom:32, animationDelay:"0.05s" }}>{sub}</div>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function TradeIQ() {
  const [phase,      setPhase]      = useLocalStorage("tiq_phase", "splash");
  const [userName,   setUserName]   = useLocalStorage("tiq_userName", "");
  const [selSyms,    setSelSyms]    = useLocalStorage("tiq_selSyms", ["BTCUSDT","ETHUSDT","SOLUSDT","XAUUSD","NIFTY50"]);
  const [startAmt,   setStartAmt]   = useLocalStorage("tiq_startAmt", 100000);
  const [theme,      setTheme]      = useLocalStorage("tiq_theme", "dark");
  const [balance,    setBalance]    = useLocalStorage("tiq_balance", 100000);
  const [portfolio,  setPortfolio]  = useLocalStorage("tiq_portfolio", {});

  const [nameVal,    setNameVal]    = useState(userName || "");
  const [amtInput,   setAmtInput]   = useState(String(startAmt));
  const [tab,        setTab]        = useState(1);
  const [sym,        setSym]        = useState(selSyms[0] || "BTCUSDT");
  const [tf,         setTf]         = useState("1h");
  const [tradeMode,  setTradeMode]  = useState("BUY");
  const [qty,        setQty]        = useState("");
  const [msg,        setMsg]        = useState(null);
  const [learnLv,    setLearnLv]    = useState(null);
  const [settSec,    setSettSec]    = useState(null);
  const [importCode, setImportCode] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [filter,     setFilter]     = useState("all");
  const [aKey,       setAKey]       = useState(0);

  const { prices, candles, dir } = useBinancePrices(selSyms, phase === "app", tf);
  const dark = theme === "dark";
  const T    = makeT(dark);

  const totalVal  = Object.entries(portfolio).reduce((s, [k, q]) => s + q * (prices[k] || SYMBOLS[k]?.base || 0), 0);
  const totalPnL  = totalVal + balance - startAmt;
  const curS      = SYMBOLS[sym];
  const curP      = prices[sym] || curS?.base || 0;
  const curChgPct = curS ? ((curP - curS.base) / curS.base) * 100 : 0;
  const curCands  = candles[sym] || [];
  
  const tech      = useMemo(() => computeTechnicals(curCands), [curCands, curP, sym]);

  const ath = curCands.length ? Math.max(...curCands.map(c => c.high)) : curP * 1.3;
  const atl = curCands.length ? Math.min(...curCands.map(c => c.low))  : curP * 0.5;

  const chartOverlays = useMemo(() => {
    if (!tech || !curCands.length) return [];
    const closes = curCands.map(c => c.close);
    const emaLine = (p) => {
      const k = 2 / (p + 1); let e = closes[0];
      return closes.map(v => { e = v * k + e * (1 - k); return e; });
    };
    return [
      { values: emaLine(9),  color: "#00C9FF", dash: "none" },
      { values: emaLine(21), color: "#9945FF", dash: "4,3"  },
    ];
  }, [curCands, sym, tech]); 

  const execTrade = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return flash("Enter a valid quantity", false);
    if (tradeMode === "BUY") {
      const cost = q * curP;
      if (cost > balance) return flash("Insufficient balance", false);
      setPortfolio(p => ({ ...p, [sym]: (p[sym] || 0) + q }));
      setBalance(b => b - cost);
      flash(`Bought ${q} ${sym}`, true);
    } else {
      if ((portfolio[sym] || 0) < q) return flash("Not enough holdings", false);
      const val = q * curP;
      setPortfolio(p => { const n = { ...p, [sym]: p[sym] - q }; if (n[sym] <= 0) delete n[sym]; return n; });
      setBalance(b => b + val);
      flash(`Sold for ${fmtM(val)}`, true);
    }
    setQty("");
  };

  const flash = (text, ok) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };
  const go    = (s) => { setSym(s); setTab(2); setAKey(k => k + 1); };

  const glass = (extra = {}) => ({
    background:            T.card,
    backdropFilter:        "blur(24px)",
    WebkitBackdropFilter:  "blur(24px)",
    border:                `1px solid ${T.border}`,
    borderRadius:          20,
    boxShadow: dark
      ? "0 8px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)"
      : "0 4px 24px rgba(0,0,100,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
    ...extra,
  });

  useEffect(() => {
    if (phase === "splash") {
      const t = setTimeout(() => setPhase("name"), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase]);

  if (phase === "splash") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#030610,#09152a,#040c1c)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"DM Sans, sans-serif" }}>
      <GlobalStyle />
      <div className="si" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
        <div style={{ width:92, height:92, borderRadius:28, background:"linear-gradient(135deg,#0055ff,#6600ff)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, animation:"glow 2s ease-in-out infinite" }}>
          <Ic n="trending" s={46} c="#fff"/>
        </div>
        <div className="fu" style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:"-1.5px" }}>TradeIQ</div>
        <div className="fu" style={{ fontSize:13, color:"rgba(255,255,255,0.35)", letterSpacing:"0.22em", textTransform:"uppercase", marginTop:6, animationDelay:"0.1s" }}>Paper Trading · Real Markets</div>
        <div style={{ display:"flex", gap:7, marginTop:48 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: i===0?22:7, height:7, borderRadius:4, background: i===0?"#0073FF":"rgba(255,255,255,0.18)", animation:`pulse 1.6s ease-in-out ${i*0.25}s infinite` }}/>)}
        </div>
      </div>
    </div>
  );

  if (phase === "name") return (
    <Obshell step={1} title="What should we call you?" sub="Personalise your trading experience" dark={dark} T={T}>
      <input
        autoFocus
        defaultValue={nameVal}
        onChange={e => setNameVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { setUserName(e.target.value.trim()); setPhase("symbols"); } }}
        placeholder="Your name"
        style={{ width:"100%", background:T.inp, border:`1px solid ${T.border}`, borderRadius:16, padding:"18px 20px", color:T.text, fontSize:18, fontWeight:600, outline:"none", marginBottom:16, transition:"border 0.2s" }}
      />
      <button onClick={() => { if (nameVal.trim()) { setUserName(nameVal.trim()); setPhase("symbols"); } }} style={{ width:"100%", background: nameVal.trim() ? "linear-gradient(135deg,#0055ff,#6600ff)" : dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,80,0.07)", border:"none", borderRadius:16, padding:"17px", color: nameVal.trim() ? "#fff" : T.sub, fontSize:16, fontWeight:800, cursor:"pointer", transition:"all 0.28s", boxShadow: nameVal.trim() ? "0 12px 40px rgba(0,80,255,0.35)" : "none", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
        Continue <Ic n="arrow" s={18} c={nameVal.trim() ? "#fff" : T.sub}/>
      </button>
    </Obshell>
  );

  if (phase === "symbols") return (
    <Obshell step={2} title={`Pick your markets, ${userName}`} sub="Select at least 3 — you can change this later" dark={dark} T={T}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:22 }}>
        {Object.entries(SYMBOLS).map(([k, s], i) => {
          const on = selSyms.includes(k);
          return (
            <div key={k} className="hov-s" onClick={() => setSelSyms(p => on ? p.filter(x => x !== k) : [...p, k])}
              style={{ background: on ? `${s.color}1e` : T.inp, border:`1px solid ${on ? s.color+"55" : T.border}`, borderRadius:14, padding:"12px 6px", textAlign:"center", animation:`fadeUp 0.3s ease ${i*0.03}s both`, boxShadow: on ? `0 0 16px ${s.color}28` : "none", transition:"all 0.2s", position:"relative" }}>
              {on && <div style={{ position:"absolute", top:5, right:5, width:14, height:14, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="check" s={8} c="#fff"/></div>}
              <div style={{ fontSize:15, fontWeight:900, color:s.color, fontFamily:"JetBrains Mono, monospace", marginBottom:3 }}>
                {k.slice(0,3)}
              </div>
              <div style={{ fontSize:9, fontWeight:700, color: on ? T.text : T.sub }}>{s.short}</div>
              <div style={{ fontSize:8, color:T.dim, marginTop:1 }}>{s.type}</div>
            </div>
          );
        })}
      </div>
      <button disabled={selSyms.length < 3} onClick={() => setPhase("amount")}
        style={{ width:"100%", background: selSyms.length >= 3 ? "linear-gradient(135deg,#0055ff,#6600ff)" : dark?"rgba(255,255,255,0.07)":"rgba(0,0,80,0.07)", border:"none", borderRadius:16, padding:"17px", color: selSyms.length >= 3 ? "#fff" : T.sub, fontSize:16, fontWeight:800, cursor: selSyms.length >= 3 ? "pointer" : "not-allowed", transition:"all 0.28s", boxShadow: selSyms.length >= 3 ? "0 12px 40px rgba(0,80,255,0.35)" : "none", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
        {selSyms.length < 3 ? `Select ${3 - selSyms.length} more` : `${selSyms.length} selected — Continue`}
        <Ic n="arrow" s={18} c={selSyms.length >= 3 ? "#fff" : T.sub}/>
      </button>
    </Obshell>
  );

  if (phase === "amount") return (
    <Obshell step={3} title="Set your starting capital" sub="This is virtual money — experiment freely" dark={dark} T={T}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
        {[50000, 100000, 500000, 1000000].map(a => (
          <div key={a} className="hov-s" onClick={() => { setAmtInput(String(a)); setStartAmt(a); }}
            style={{ background: startAmt === a ? "rgba(0,115,255,0.22)" : T.inp, border:`1px solid ${startAmt===a?"rgba(0,115,255,0.5)":T.border}`, borderRadius:14, padding:"16px", textAlign:"center", cursor:"pointer", transition:"all 0.22s", boxShadow: startAmt===a?"0 0 20px rgba(0,115,255,0.25)":"none" }}>
            <div style={{ fontSize:18, fontWeight:900, color: startAmt===a ? T.text : T.sub }}>
              {a >= 100000 ? `₹${(a/100000).toFixed(a%100000===0?0:1)}L` : `₹${(a/1000).toFixed(0)}K`}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", background:T.inp, border:`1px solid ${T.border}`, borderRadius:14, padding:"0 18px", marginBottom:20 }}>
        <span style={{ color:T.sub, fontSize:18, fontWeight:700, marginRight:6 }}>₹</span>
        <input type="number" value={amtInput} onChange={e => { setAmtInput(e.target.value); const v = parseInt(e.target.value); if (v > 0) setStartAmt(v); }}
          placeholder="Custom amount"
          style={{ flex:1, background:"transparent", border:"none", padding:"16px 0", color:T.text, fontSize:17, fontWeight:700, outline:"none" }}/>
      </div>
      <button onClick={() => { setBalance(startAmt); setPhase("app"); setAKey(k => k + 1); }}
        style={{ width:"100%", background:"linear-gradient(135deg,#0055ff,#6600ff)", border:"none", borderRadius:16, padding:"17px", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 12px 40px rgba(0,80,255,0.38)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
        Launch TradeIQ <Ic n="trending" s={18} c="#fff"/>
      </button>
    </Obshell>
  );

  const TABS = [
    { l:"Portfolio", n:"portfolio" },
    { l:"Markets",   n:"markets"   },
    { l:"Trade",     n:"trade"     },
    { l:"Learn",     n:"learn"     },
    { l:"Settings",  n:"settings"  },
  ];

  return (
    <div style={{ minHeight:"100vh", background: dark ? "linear-gradient(150deg,#05080f,#0b1525,#05080f)" : "linear-gradient(150deg,#eef2ff,#e4ecff,#eef2ff)", fontFamily:"DM Sans, sans-serif", color:T.text, position:"relative", overflowX:"hidden" }}>
      <GlobalStyle />

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(0,73,255,0.09)":"rgba(0,73,255,0.04)"} 0%,transparent 70%)`, top:-180, left:-150, animation:"pulse 10s ease infinite" }}/>
        <div style={{ position:"absolute", width:450, height:450, borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(100,0,255,0.06)":"rgba(100,0,255,0.03)"} 0%,transparent 70%)`, bottom:60, right:-100, animation:"pulse 13s ease infinite 4s" }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:430, margin:"0 auto", paddingBottom:108 }}>

        <div style={{ padding:"14px 18px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:T.sub, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600 }}>Welcome back, {userName}</div>
            <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.7px", background: dark ? "linear-gradient(135deg,#fff,rgba(255,255,255,0.6))" : "none", WebkitBackgroundClip: dark?"text":"unset", WebkitTextFillColor: dark?"transparent":"unset" }}>TradeIQ</div>
          </div>
          <div style={{ ...glass(), borderRadius:14, padding:"8px 13px", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#00E676", animation:"blink 1.8s ease infinite" }}/>
            <span style={{ fontSize:11, fontWeight:800, color: totalPnL >= 0 ? "#00E676" : "#FF4458" }}>
              {totalPnL >= 0 ? "+" : ""}{fmtM(totalPnL)}
            </span>
          </div>
        </div>

        <div key={aKey} style={{ padding:"12px 12px 0", display: phase === "app" ? "block" : "none" }}>

          {tab === 0 && (
            <div className="fu">
              <div style={{ ...glass({ padding:24, marginBottom:12, background: dark ? "linear-gradient(135deg,rgba(0,73,255,0.18),rgba(100,0,255,0.13))" : "linear-gradient(135deg,rgba(0,73,255,0.08),rgba(100,0,255,0.05))", border:"1px solid rgba(0,115,255,0.2)" }) }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6, fontWeight:700 }}>Total Portfolio Value</div>
                <div style={{ fontSize:38, fontWeight:900, letterSpacing:"-1.5px", marginBottom:6 }}>{fmtM(balance + totalVal)}</div>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:16, fontWeight:800, color: totalPnL >= 0 ? "#00E676" : "#FF4458" }}>{totalPnL >= 0 ? "+" : ""}{fmtM(totalPnL)}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.07)", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>{((totalPnL / startAmt) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                {[
                  { l:"Cash Balance", v:fmtM(balance),   i:"wallet", c:"#00C9FF" },
                  { l:"Invested",     v:fmtM(totalVal),  i:"chart",  c:"#9945FF" },
                ].map((x, i) => (
                  <div key={i} style={{ ...glass({ padding:16, display:"flex", gap:12, alignItems:"center" }) }} className="hov">
                    <div style={{ width:38, height:38, borderRadius:12, background:`${x.c}1e`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n={x.i} s={18} c={x.c}/></div>
                    <div><div style={{ fontWeight:800, fontSize:15 }}>{x.v}</div><div style={{ fontSize:10, color:T.sub, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:1 }}>{x.l}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, fontWeight:800, color:T.sub, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:9, paddingLeft:3 }}>Holdings</div>
              {Object.keys(portfolio).length === 0
                ? <div style={{ ...glass({ padding:36, textAlign:"center" }) }}><div style={{ marginBottom:12, opacity:0.3 }}><Ic n="chart" s={36} c={T.text} style={{ margin:"0 auto" }}/></div><div style={{ color:T.sub, fontSize:14 }}>No positions yet</div></div>
                : Object.entries(portfolio).map(([k, q]) => {
                    const s = SYMBOLS[k]; if (!s) return null;
                    const val = q * (prices[k] || s.base);
                    const pnl = val - q * s.base;
                    return (
                      <div key={k} className="hov" onClick={() => go(k)} style={{ ...glass({ padding:"13px 15px", marginBottom:9, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }) }}>
                        <div style={{ display:"flex", gap:11, alignItems:"center" }}>
                          <div style={{ width:42, height:42, borderRadius:13, background:`${s.color}18`, border:`1px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, fontFamily:"JetBrains Mono, monospace", fontSize:13, fontWeight:800, flexShrink:0 }}>{k.slice(0,3)}</div>
                          <div><div style={{ fontWeight:800, fontSize:15 }}>{k}</div><div style={{ fontSize:11, color:T.sub }}>{q.toFixed(6)} units</div></div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontWeight:800, fontSize:15 }}>{fmtM(val)}</div>
                          <div style={{ fontSize:11, color: pnl >= 0 ? "#00E676" : "#FF4458", fontWeight:700 }}>{pnl >= 0 ? "+" : ""}{fmtM(pnl)}</div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {tab === 1 && (
            <div className="fu">
              <div style={{ display:"flex", gap:7, marginBottom:13, overflowX:"auto", paddingBottom:3 }}>
                {["all","crypto","forex","index","meme","commodity"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f ? "rgba(0,115,255,0.24)" : T.inp, border:`1px solid ${filter===f?"rgba(0,115,255,0.48)":T.border}`, borderRadius:20, padding:"6px 13px", color: filter===f ? "#fff" : T.sub, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
                ))}
              </div>
              {selSyms.filter(k => filter === "all" || SYMBOLS[k]?.type === filter).map((k, i) => {
                const s = SYMBOLS[k]; if (!s) return null;
                const p = prices[k] || s.base;
                const chg = ((p - s.base) / s.base) * 100;
                const up  = chg >= 0;
                return (
                  <div key={k} className="hov" onClick={() => go(k)} style={{ ...glass({ padding:"13px 15px", marginBottom:9, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", border:`1px solid ${dir[k]==="up"?"rgba(0,230,118,0.12)":dir[k]==="down"?"rgba(255,68,88,0.12)":T.border}`, transition:"border-color 0.5s" }), animation:`fadeUp ${0.12+i*0.05}s ease both` }}>
                    <div style={{ display:"flex", gap:11, alignItems:"center" }}>
                      <div style={{ width:44, height:44, borderRadius:14, background:`${s.color}18`, border:`1px solid ${s.color}2e`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, fontFamily:"JetBrains Mono, monospace", fontSize:13, fontWeight:800, flexShrink:0 }}>{k.slice(0,3)}</div>
                      <div><div style={{ fontWeight:800, fontSize:15 }}>{s.short}</div><div style={{ fontSize:11, color:T.sub }}>{s.name}</div></div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Spark candles={candles[k]} up={up}/>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:800, fontSize:14, fontFamily:"JetBrains Mono, monospace", color: dir[k]==="up"?"#00E676":dir[k]==="down"?"#FF4458":T.text, transition:"color 0.4s" }}>{fmtP(p)}</div>
                        <div style={{ fontSize:10, fontWeight:800, color: up?"#00E676":"#FF4458", background: up?"rgba(0,230,118,0.11)":"rgba(255,68,88,0.11)", padding:"2px 8px", borderRadius:20, marginTop:2, display:"inline-block" }}>{up?"▲":"▼"} {Math.abs(chg).toFixed(2)}%</div>
                      </div>
                      <Ic n="chevron" s={13} c={T.dim}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 2 && (
            <div className="fu">
              <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:3, marginBottom:12 }}>
                {selSyms.map(k => {
                  const s = SYMBOLS[k]; const on = sym === k;
                  return <button key={k} className="hov-s" onClick={() => { setSym(k); setAKey(a => a + 1); }} style={{ background: on ? `${s.color}28` : T.inp, border:`1px solid ${on?s.color+"55":T.border}`, borderRadius:20, padding:"7px 13px", color: on ? "#fff" : T.sub, fontSize:11, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.18s" }}>{s.short}</button>;
                })}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:26, fontWeight:900, letterSpacing:"-0.7px" }}>{sym}</div>
                  <div style={{ fontSize:12, color:T.sub }}>{curS?.name}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:28, fontWeight:900, fontFamily:"JetBrains Mono, monospace", color: dir[sym]==="up"?"#00E676":dir[sym]==="down"?"#FF4458":T.text, transition:"color 0.4s", letterSpacing:"-0.5px" }}>{fmtP(curP)}</div>
                  <div style={{ fontSize:12, fontWeight:800, color: curChgPct>=0?"#00E676":"#FF4458" }}>{curChgPct>=0?"▲":"▼"} {Math.abs(curChgPct).toFixed(3)}%</div>
                </div>
              </div>

              <div style={{ display:"flex", gap:5, overflowX:"auto", marginBottom:10 }}>
                {TIMEFRAMES.map(t => (
                  <button key={t} onClick={() => setTf(t)} style={{ background: tf===t?"rgba(0,115,255,0.26)":"transparent", border:`1px solid ${tf===t?"rgba(0,115,255,0.48)":T.border}`, borderRadius:10, padding:"5px 10px", color: tf===t?"#fff":T.sub, fontSize:11, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.18s" }}>{t}</button>
                ))}
              </div>

              <div style={{ ...glass({ padding:"14px 10px 10px", marginBottom:10, overflow:"hidden", height: 360 }) }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingLeft:4, paddingRight:6 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:20, height:2, background:"#2962FF" }}/><span style={{ fontSize:9, color:T.sub, fontWeight:700 }}>EMA 9</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:20, height:2, background:"#FF6D00" }}/><span style={{ fontSize:9, color:T.sub, fontWeight:700 }}>EMA 21</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"#00E676", animation:"blink 2s ease infinite" }}/>
                    <span style={{ fontSize:10, color:"#00E676", fontWeight:800 }}>Live Data</span>
                  </div>
                </div>
                <div style={{ height: 300, position: "relative" }}>
                  <NativeChart candles={curCands} theme={theme} overlays={chartOverlays} />
                </div>
              </div>

              <div style={{ ...glass({ padding:"13px 16px", marginBottom:10 }) }}>
                <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Price Levels</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[
                    { l:"All-Time High", v:fmtP(ath), c:"#00E676" },
                    { l:"Current",       v:fmtP(curP), c:T.text   },
                    { l:"All-Time Low",  v:fmtP(atl),  c:"#FF4458" },
                  ].map(x => (
                    <div key={x.l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:13, fontWeight:900, color:x.c, fontFamily:"JetBrains Mono, monospace" }}>{x.v}</div>
                      <div style={{ fontSize:9, color:T.sub, marginTop:3, textTransform:"uppercase", letterSpacing:"0.07em" }}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {tech && (
                <div style={{ ...glass({ padding:16, marginBottom:10 }) }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:T.sub, textTransform:"uppercase", letterSpacing:"0.1em" }}>Live Technicals</div>
                    <div style={{ fontSize:13, fontWeight:900, color:tech.oc, background:`${tech.oc}18`, padding:"4px 13px", borderRadius:20, letterSpacing:"0.04em" }}>{tech.overall}</div>
                  </div>
                  <div style={{ display:"flex", height:6, borderRadius:6, overflow:"hidden", gap:2, marginBottom:10 }}>
                    <div style={{ flex:tech.sells,   background:"#FF4458", transition:"flex 0.6s", borderRadius:"6px 0 0 6px" }}/>
                    <div style={{ flex:tech.neutrals, background: dark?"rgba(255,255,255,0.13)":"rgba(0,0,0,0.1)", transition:"flex 0.6s" }}/>
                    <div style={{ flex:tech.buys,    background:"#00E676", transition:"flex 0.6s", borderRadius:"0 6px 6px 0" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:14 }}>
                    <span style={{ color:"#FF4458", fontWeight:800 }}>SELL {tech.sells}</span>
                    <span style={{ color:T.sub, fontWeight:600 }}>NEUTRAL {tech.neutrals}</span>
                    <span style={{ color:"#00E676", fontWeight:800 }}>BUY {tech.buys}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {tech.rows.map(r => (
                      <div key={r.n} style={{ background: dark?"rgba(255,255,255,0.04)":"rgba(0,0,80,0.03)", borderRadius:10, padding:"8px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:T.sub }}>{r.n}</div>
                          <div style={{ fontSize:11, fontFamily:"JetBrains Mono, monospace", fontWeight:700, marginTop:1 }}>{r.v}</div>
                        </div>
                        <div style={{ fontSize:9, fontWeight:900, color: r.sig==="BUY"?"#00E676":r.sig==="SELL"?"#FF4458":"#FFB300", background: r.sig==="BUY"?"rgba(0,230,118,0.12)":r.sig==="SELL"?"rgba(255,68,88,0.12)":"rgba(255,179,0,0.12)", padding:"2px 7px", borderRadius:7 }}>{r.sig}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ ...glass({ padding:20, marginBottom:10 }) }}>
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  {["BUY","SELL"].map(m => (
                    <button key={m} onClick={() => setTradeMode(m)} style={{ flex:1, background: tradeMode===m?(m==="BUY"?"rgba(0,230,118,0.17)":"rgba(255,68,88,0.17)"):"rgba(255,255,255,0.05)", border:`1px solid ${tradeMode===m?(m==="BUY"?"rgba(0,230,118,0.38)":"rgba(255,68,88,0.38)"):"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:"12px", color: tradeMode===m?(m==="BUY"?"#00E676":"#FF4458"):T.sub, fontSize:14, fontWeight:900, cursor:"pointer", transition:"all 0.2s", letterSpacing:"0.04em" }}>{m}</button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                  <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Quantity" style={{ flex:1, background:T.inp, border:`1px solid ${T.border}`, borderRadius:13, padding:"14px 16px", color:T.text, fontSize:16, fontFamily:"JetBrains Mono, monospace", fontWeight:700, outline:"none" }}/>
                  <div style={{ fontSize:11, color:T.sub, textAlign:"right", minWidth:72, lineHeight:1.7 }}>
                    Total<br/><span style={{ color:T.text, fontWeight:900, fontSize:13 }}>{fmtM(parseFloat(qty||0)*curP)}</span>
                  </div>
                </div>
                <button onClick={execTrade} style={{ width:"100%", background: tradeMode==="BUY" ? "linear-gradient(135deg,rgba(0,200,80,0.4),rgba(0,150,60,0.3))" : "linear-gradient(135deg,rgba(200,0,60,0.4),rgba(150,0,40,0.3))", border:`1px solid ${tradeMode==="BUY"?"rgba(0,230,118,0.32)":"rgba(255,68,88,0.32)"}`, borderRadius:16, padding:16, color: tradeMode==="BUY"?"#00E676":"#FF4458", fontSize:15, fontWeight:900, cursor:"pointer", letterSpacing:"0.04em", boxShadow: tradeMode==="BUY"?"0 0 28px rgba(0,230,118,0.1)":"0 0 28px rgba(255,68,88,0.1)" }}>
                  {tradeMode==="BUY" ? "Execute Buy" : "Execute Sell"}
                </button>
                {msg && <div className="si" style={{ marginTop:10, padding:"10px 14px", background: msg.ok?"rgba(0,230,118,0.1)":"rgba(255,68,88,0.1)", border:`1px solid ${msg.ok?"rgba(0,230,118,0.22)":"rgba(255,68,88,0.22)"}`, borderRadius:12, fontSize:13, color: msg.ok?"#00E676":"#FF4458", textAlign:"center", fontWeight:700 }}>{msg.ok ? "Confirmed — " : "Error — "}{msg.text}</div>}
                {portfolio[sym] && <div style={{ marginTop:12, padding:"9px 13px", background:"rgba(255,255,255,0.04)", borderRadius:11, display:"flex", justifyContent:"space-between", fontSize:12 }}><span style={{ color:T.sub }}>Your position</span><span style={{ fontWeight:800, fontFamily:"JetBrains Mono, monospace" }}>{portfolio[sym].toFixed(6)} · {fmtM(portfolio[sym]*curP)}</span></div>}
              </div>
            </div>
          )}

          {tab === 3 && (
            <div className="fu">
              {learnLv !== null ? (
                (() => {
                  const { lvIdx, lessonIdx } = learnLv;
                  const lesson = LEARN_LEVELS[lvIdx].lessons[lessonIdx];
                  const lv     = LEARN_LEVELS[lvIdx];
                  return (
                    <div className="fu">
                      <button onClick={() => setLearnLv(null)} style={{ display:"flex", alignItems:"center", gap:7, background:"none", border:"none", color:T.sub, cursor:"pointer", fontSize:13, fontWeight:700, marginBottom:20, padding:0 }}>
                        <Ic n="back" s={16} c={T.sub}/> Back to {lv.level}
                      </button>
                      <div style={{ fontSize:11, fontWeight:800, color:lv.color, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8 }}>{lv.level}</div>
                      <div style={{ fontSize:24, fontWeight:900, letterSpacing:"-0.6px", marginBottom:6, lineHeight:1.2 }}>{lesson.title}</div>
                      <div style={{ fontSize:11, color:T.sub, marginBottom:24 }}>{lesson.duration} read</div>
                      <div style={{ ...glass({ padding:20 }), fontSize:14, color:T.sub, lineHeight:1.82 }}>{lesson.content}</div>
                      <div style={{ display:"flex", gap:10, marginTop:14 }}>
                        {lessonIdx > 0 && <button onClick={() => setLearnLv({ lvIdx, lessonIdx: lessonIdx-1 })} style={{ flex:1, ...glass({ padding:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontSize:13, fontWeight:800, color:T.sub })}}>
                          <Ic n="back" s={14} c={T.sub}/> Previous
                        </button>}
                        {lessonIdx < LEARN_LEVELS[lvIdx].lessons.length - 1 && <button onClick={() => setLearnLv({ lvIdx, lessonIdx: lessonIdx+1 })} style={{ flex:1, background:"linear-gradient(135deg,#0055ff,#6600ff)", border:"none", borderRadius:14, padding:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontSize:13, fontWeight:800, color:"#fff" }}>
                          Next <Ic n="arrow" s={14} c="#fff"/>
                        </button>}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <>
                  <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px", marginBottom:4 }}>Learn to Trade</div>
                  <div style={{ fontSize:13, color:T.sub, marginBottom:20 }}>Structured courses from zero to advanced</div>
                  {LEARN_LEVELS.map((lv, li) => (
                    <div key={li} style={{ ...glass({ padding:0, marginBottom:12, overflow:"hidden" }), animation:`fadeUp ${0.2+li*0.1}s ease both` }}>
                      <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${T.border}`, background:`linear-gradient(135deg,${lv.color}12,transparent)` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <div>
                            <div style={{ fontSize:11, fontWeight:800, color:lv.color, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:4 }}>{lv.level}</div>
                            <div style={{ fontSize:16, fontWeight:800, marginBottom:3 }}>{lv.desc}</div>
                            <div style={{ fontSize:11, color:T.sub }}>{lv.lessons.length} lessons</div>
                          </div>
                          <div style={{ width:38, height:38, borderRadius:12, background:`${lv.color}1e`, border:`1px solid ${lv.color}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Ic n={li===0?"info":li===1?"chart":"star"} s={18} c={lv.color}/>
                          </div>
                        </div>
                      </div>
                      {lv.lessons.map((lesson, li2) => (
                        <div key={li2} className="hov" onClick={() => setLearnLv({ lvIdx:li, lessonIdx:li2 })} style={{ padding:"13px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom: li2 < lv.lessons.length-1 ? `1px solid ${T.border}` : "none", cursor:"pointer" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                            <div style={{ width:28, height:28, borderRadius:9, background:`${lv.color}14`, border:`1px solid ${lv.color}28`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              <span style={{ fontSize:11, fontWeight:900, color:lv.color }}>{li2+1}</span>
                            </div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:13 }}>{lesson.title}</div>
                              <div style={{ fontSize:10, color:T.sub, marginTop:1 }}>{lesson.duration} read</div>
                            </div>
                          </div>
                          <Ic n="chevron" s={14} c={T.dim}/>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 4 && (
            <div className="fu">
              <div style={{ ...glass({ padding:20, marginBottom:14, display:"flex", gap:14, alignItems:"center" }) }}>
                <div style={{ width:56, height:56, borderRadius:18, background:"linear-gradient(135deg,#0055ff,#6600ff)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic n="user" s={26} c="#fff"/>
                </div>
                <div><div style={{ fontWeight:900, fontSize:18 }}>{userName}</div><div style={{ fontSize:12, color:T.sub }}>Paper Trader · {selSyms.length} markets</div></div>
              </div>

              {[
                { k:"theme",   l:"Appearance",      sub2: dark?"Dark Mode":"Light Mode", ic:"sun",      c:"#FFB300" },
                { k:"amount",  l:"Starting Balance", sub2:fmtM(startAmt),                ic:"wallet",   c:"#00C9FF" },
                { k:"symbols", l:"Active Markets",   sub2:`${selSyms.length} selected`,   ic:"markets",  c:"#00E676" },
              ].map((item, i) => (
                <div key={item.k}>
                  <div className="hov" onClick={() => setSettSec(settSec===item.k ? null : item.k)}
                    style={{ ...glass({ padding:16, marginBottom:10, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }), animation:`fadeUp ${0.18+i*0.07}s ease both` }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:`${item.c}1e`, border:`1px solid ${item.c}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n={item.ic} s={18} c={item.c}/></div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:800, fontSize:15 }}>{item.l}</div><div style={{ fontSize:12, color:T.sub }}>{item.sub2}</div></div>
                    <div style={{ color:T.dim, transform: settSec===item.k?"rotate(90deg)":"none", transition:"transform 0.28s" }}><Ic n="chevron" s={14} c={T.dim}/></div>
                  </div>
                  {settSec === item.k && (
                    <div className="si" style={{ ...glass({ padding:16, marginBottom:10, marginTop:-4 }) }}>
                      {item.k === "theme" && (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                          {["dark","light"].map(t => (
                            <button key={t} onClick={() => setTheme(t)} style={{ background: theme===t?"rgba(0,115,255,0.24)":T.inp, border:`1px solid ${theme===t?"rgba(0,115,255,0.4)":T.border}`, borderRadius:14, padding:14, color: theme===t?"#fff":T.sub, fontSize:13, fontWeight:800, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all 0.2s" }}>
                              <Ic n={t==="dark"?"moon":"sun"} s={22} c={theme===t?"#fff":T.sub}/>{t.charAt(0).toUpperCase()+t.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                      {item.k === "amount" && (
                        <>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                            {[50000,100000,500000,1000000].map(a => (
                              <button key={a} onClick={() => { setStartAmt(a); setBalance(a); }} style={{ background: startAmt===a?"rgba(0,115,255,0.24)":T.inp, border:`1px solid ${startAmt===a?"rgba(0,115,255,0.4)":T.border}`, borderRadius:12, padding:"12px", color: startAmt===a?"#fff":T.sub, fontSize:14, fontWeight:800, cursor:"pointer" }}>
                                {a>=100000?`₹${(a/100000).toFixed(1)}L`:`₹${(a/1000)}K`}
                              </button>
                            ))}
                          </div>
                          <div style={{ fontSize:11, color:T.sub, textAlign:"center" }}>Resets current balance</div>
                        </>
                      )}
                      {item.k === "symbols" && (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                          {Object.entries(SYMBOLS).map(([k, s]) => {
                            const on = selSyms.includes(k);
                            return (
                              <div key={k} onClick={() => setSelSyms(p => on ? p.filter(x => x !== k) : [...p, k])} className="hov-s" style={{ background: on?`${s.color}18`:T.inp, border:`1px solid ${on?s.color+"44":T.border}`, borderRadius:11, padding:"10px 6px", cursor:"pointer", textAlign:"center", transition:"all 0.18s" }}>
                                <div style={{ fontSize:12, fontWeight:900, color:s.color, fontFamily:"JetBrains Mono, monospace" }}>{k.slice(0,3)}</div>
                                <div style={{ fontSize:9, color: on?T.text:T.sub, marginTop:2 }}>{s.short}</div>
                                {on && <div style={{ marginTop:4, display:"flex", justifyContent:"center" }}><Ic n="check" s={10} c={s.color}/></div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="hov" onClick={() => { if (confirm("Reset all positions and balance?")) { setBalance(startAmt); setPortfolio({}); setSettSec(null); } }}
                style={{ ...glass({ padding:16, marginBottom:10, display:"flex", alignItems:"center", gap:12, cursor:"pointer", border:"1px solid rgba(255,68,88,0.14)" }) }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,68,88,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n="refresh" s={18} c="#FF4458"/></div>
                <div style={{ flex:1 }}><div style={{ fontWeight:800, fontSize:15, color:"#FF4458" }}>Reset Portfolio</div><div style={{ fontSize:12, color:T.sub }}>Clear all positions and restart</div></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:18, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 24px)", maxWidth:406, background: dark?"rgba(4,6,14,0.92)":"rgba(228,236,255,0.92)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", borderRadius:32, border: dark?"1px solid rgba(255,255,255,0.09)":"1px solid rgba(0,0,100,0.08)", boxShadow: dark?"0 20px 64px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.055)":"0 12px 48px rgba(0,0,100,0.12),inset 0 1px 0 rgba(255,255,255,0.9)", padding:"10px 6px", display:"flex", justifyContent:"space-around", zIndex:100 }}>
        {TABS.map((t, i) => {
          const on = tab === i;
          return (
            <button key={t.l} className="tab-b" onClick={() => { setTab(i); setAKey(k => k + 1); }}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, background: on?"rgba(0,115,255,0.17)":"transparent", border:`1px solid ${on?"rgba(0,115,255,0.22)":"transparent"}`, borderRadius:22, padding:"8px 12px", cursor:"pointer", minWidth:60 }}>
              <Ic n={t.n} s={20} c={on ? "#4da6ff" : T.sub}/>
              <span style={{ fontSize:9, fontWeight: on?900:500, color: on?"#4da6ff":T.sub, letterSpacing:"0.03em" }}>{t.l}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}