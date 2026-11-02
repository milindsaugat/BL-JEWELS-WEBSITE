const cx = 240, cy = 290, rx = 210, ry = 260;
const lobes = 10;
let p = '';
for (let i = 0; i < lobes; i++) {
  const a1 = (i / lobes) * Math.PI * 2 - Math.PI / 2;
  const a2 = ((i + 1) / lobes) * Math.PI * 2 - Math.PI / 2;
  const am = (a1 + a2) / 2;
  const x1 = (cx + rx * Math.cos(a1) * 0.88).toFixed(1);
  const y1 = (cy + ry * Math.sin(a1) * 0.88).toFixed(1);
  const mx = (cx + rx * Math.cos(am) * 1.00).toFixed(1);
  const my = (cy + ry * Math.sin(am) * 1.00).toFixed(1);
  const x2 = (cx + rx * Math.cos(a2) * 0.88).toFixed(1);
  const y2 = (cy + ry * Math.sin(a2) * 0.88).toFixed(1);
  if (i === 0) p += 'M ' + x1 + ' ' + y1 + ' ';
  p += 'Q ' + mx + ' ' + my + ' ' + x2 + ' ' + y2 + ' ';
}
p += 'Z';
console.log('Path:', p);

// Also generate normalized (0 to 1) for clipPathUnits="objectBoundingBox"
let np = '';
for (let i = 0; i < lobes; i++) {
  const a1 = (i / lobes) * Math.PI * 2 - Math.PI / 2;
  const a2 = ((i + 1) / lobes) * Math.PI * 2 - Math.PI / 2;
  const am = (a1 + a2) / 2;
  const x1 = (0.5 + 0.44 * Math.cos(a1) * 0.88).toFixed(3);
  const y1 = (0.5 + 0.46 * Math.sin(a1) * 0.88).toFixed(3);
  const mx = (0.5 + 0.44 * Math.cos(am) * 1.00).toFixed(3);
  const my = (0.5 + 0.46 * Math.sin(am) * 1.00).toFixed(3);
  const x2 = (0.5 + 0.44 * Math.cos(a2) * 0.88).toFixed(3);
  const y2 = (0.5 + 0.46 * Math.sin(a2) * 0.88).toFixed(3);
  if (i === 0) np += 'M ' + x1 + ' ' + y1 + ' ';
  np += 'Q ' + mx + ' ' + my + ' ' + x2 + ' ' + y2 + ' ';
}
np += 'Z';
console.log('Normalized Path:', np);

