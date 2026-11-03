import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Render without fetching rates: opening either screen must work before the API responds.
globalThis.localStorage = { getItem: () => null };
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { LiveRateModal } = await server.ssrLoadModule('/src/components/common/LiveRateModal.jsx');
  const { LiveRatePage } = await server.ssrLoadModule('/src/pages/LiveRatePage.jsx');
  const { useUIStore } = await server.ssrLoadModule('/src/store/uiStore.js');
  const render = (Component) => renderToString(
    React.createElement(MemoryRouter, null, React.createElement(Component)),
  );

  assert.equal(render(LiveRateModal), '');
  useUIStore.getState().openLiveRate();
  assert.equal(useUIStore.getState().isLiveRateOpen, true);
  // React's server renderer reads Zustand's initial snapshot, not its client snapshot.
  useUIStore.getInitialState().isLiveRateOpen = true;
  const popup = render(LiveRateModal);
  assert.match(popup, /BL JEWELS LIVE BULLION MATRIX/);
  assert.match(popup, /Unavailable/);
  assert.match(popup, /tel:07454986610/);
  useUIStore.getState().closeLiveRate();
  assert.equal(useUIStore.getState().isLiveRateOpen, false);
  useUIStore.getInitialState().isLiveRateOpen = false;
  assert.equal(render(LiveRateModal), '');

  const page = render(LiveRatePage);
  assert.match(page, /LIVE BULLION RATES/);
  assert.match(page, /Unavailable/);
  assert.match(page, /tel:07454986610/);
  console.log('PASS: live-rate popup opens/closes and page renders without API data.');
} finally {
  await server.close();
}
