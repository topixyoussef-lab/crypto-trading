import React, { useRef, useEffect, useState } from 'react';

export default function MarketTicker({ assets, prices, selectedAsset, onSelectAsset }) {
  const prevRef = useRef({});
  const [changes, setChanges] = useState({});
  const [flashes, setFlashes] = useState({});

  useEffect(() => {
    const prev = prevRef.current;
    const newChanges = {};
    const newFlashes = {};
    Object.keys(prices).forEach(key => {
      const cur = prices[key];
      const old = prev[key];
      if (cur != null && old != null) {
        newChanges[key] = ((cur - old) / old) * 100;
        if (cur !== old) {
          newFlashes[key] = cur > old ? 'green' : 'red';
        }
      } else {
        newChanges[key] = 0;
      }
    });
    setChanges(newChanges);
    if (Object.keys(newFlashes).length > 0) {
      setFlashes(newFlashes);
      setTimeout(() => setFlashes({}), 400);
    }
    prevRef.current = { ...prices };
  }, [prices]);

  return (
    <div style={{
      display: 'flex', gap: '8px', marginBottom: '12px',
      overflowX: 'auto', paddingBottom: '4px', flexShrink: 0,
    }}>
      {assets.map(asset => {
        const price = prices[asset.id];
        const change = changes[asset.id] || 0;
        const isPositive = change >= 0;
        const isSelected = selectedAsset === asset.id;
        const flash = flashes[asset.id];

        return (
          <button
            key={asset.id}
            onClick={() => onSelectAsset(asset.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 14px', borderRadius: '12px', flexShrink: 0, minWidth: '150px',
              border: isSelected ? `1px solid ${asset.color}40` : '1px solid var(--border)',
              background: isSelected ? `${asset.color}12` : 'var(--bg-card)',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
          >
            {flash && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: flash === 'green' ? 'rgba(0,200,83,0.08)' : 'rgba(255,23,68,0.08)',
                pointerEvents: 'none',
              }} />
            )}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: `${asset.color}20`, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: asset.color,
            }}>
              {asset.id[0]}
            </div>
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{asset.id}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{asset.name}</div>
            </div>
            <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                ${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
