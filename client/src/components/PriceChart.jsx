import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createChart, CrosshairMode, LineStyle, CandlestickSeries } from 'lightweight-charts';

export default function PriceChart({ asset, price, history, ohlcv }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [flashColor, setFlashColor] = useState(null);
  const prevPriceRef = useRef(price);
  const [isUp, setIsUp] = useState(true);
  const [changePercent, setChangePercent] = useState(0);

  useEffect(() => {
    if (prevPriceRef.current && price) {
      if (price > prevPriceRef.current) {
        setFlashColor('rgba(0,200,83,0.15)');
        setTimeout(() => setFlashColor(null), 300);
      } else if (price < prevPriceRef.current) {
        setFlashColor('rgba(255,23,68,0.15)');
        setTimeout(() => setFlashColor(null), 300);
      }
    }
    prevPriceRef.current = price;
  }, [price]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(30,41,59,0.5)', style: LineStyle.Dashed },
        horzLines: { color: 'rgba(30,41,59,0.5)', style: LineStyle.Dashed },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#2979ff',
          width: 1,
          style: LineStyle.Dotted,
          labelBackgroundColor: '#2979ff',
        },
        horzLine: {
          color: '#2979ff',
          width: 1,
          style: LineStyle.Dotted,
          labelBackgroundColor: '#2979ff',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(30,41,59,0.8)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(30,41,59,0.8)',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time) => {
          const d = new Date(time * 1000);
          return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
        },
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: { axisPressedMouse: false },
    });

    chartRef.current = chart;

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.point) {
        const data = param.seriesData.get(seriesRef.current);
        if (data) {
          const val = typeof data.value !== 'undefined' ? data.value :
                      typeof data.close !== 'undefined' ? data.close : null;
          if (val) {
            const firstPrice = history.length > 0 ? history[0].price : price;
            const pct = firstPrice ? ((val - firstPrice) / firstPrice) * 100 : 0;
            setChangePercent(pct);
            setIsUp(pct >= 0);
          }
        }
      } else {
        if (history.length > 1) {
          const first = history[0].price;
          const last = history[history.length - 1].price;
          const pct = first ? ((last - first) / first) * 100 : 0;
          setChangePercent(pct);
          setIsUp(pct >= 0);
        }
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (seriesRef.current) {
      try { chartRef.current.removeSeries(seriesRef.current); } catch(e) {}
      seriesRef.current = null;
    }

    const candleData = ohlcv?.history || [];
    const currentCandle = ohlcv?.current;
    const chart = chartRef.current;

    if (candleData.length < 1) return;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00c853',
      downColor: '#ff1744',
      borderUpColor: '#00c853',
      borderDownColor: '#ff1744',
      wickUpColor: '#00c853',
      wickDownColor: '#ff1744',
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });
    const pts = candleData.map(c => ({
      time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
    }));
    const seen = {};
    const formatted = pts.filter(p => { const k = p.time; if (seen[k]) return false; seen[k] = true; return true; });
    series.setData(formatted);
    seriesRef.current = series;

    chart.timeScale().fitContent();
  }, [ohlcv]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    const currentCandle = ohlcv?.current;
    if (!currentCandle) return;

    const series = seriesRef.current;
    series.update({
      time: currentCandle.time,
      open: currentCandle.open,
      high: currentCandle.high,
      low: currentCandle.low,
      close: currentCandle.close,
    });

    chartRef.current.timeScale().scrollToRealTime();
  }, [ohlcv?.current]);

  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '300px',
    }}>
      {flashColor && (
        <div style={{
          position: 'absolute', inset: 0, backgroundColor: flashColor,
          transition: 'background-color 0.15s', pointerEvents: 'none', zIndex: 10,
        }} />
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 0', flexShrink: 0, position: 'relative', zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>
            ${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{
            fontSize: '14px', fontWeight: 600,
            color: isUp ? 'var(--green)' : 'var(--red)',
            background: isUp ? 'var(--green-bg)' : 'var(--red-bg)',
            padding: '2px 10px', borderRadius: '6px',
            transition: 'all 0.3s',
          }}>
            {changePercent >= 0 ? '+' : ''}{changePercent?.toFixed(2)}%
          </span>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 20px 8px', flexShrink: 0 }}>
        {asset}/USD · 1s candles · Real-time demo
      </div>

      <div ref={chartContainerRef} style={{ flex: 1, minHeight: 0 }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '8px 20px 12px',
        fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span>H: ${ohlcv?.current?.high?.toFixed(2) || '...'}</span>
        <span>L: ${ohlcv?.current?.low?.toFixed(2) || '...'}</span>
        <span>O: ${ohlcv?.current?.open?.toFixed(2) || '...'}</span>
        <span>C: ${ohlcv?.current?.close?.toFixed(2) || '...'}</span>
      </div>
    </div>
  );
}
