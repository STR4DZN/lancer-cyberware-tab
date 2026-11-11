const WAVE_COLORS = {
  stable:   {trace: '#a0ffd7', glow: '#54ebad', memory: '#3199a2'},
  watch:    {trace: '#b6ffff', glow: '#57eaf1', memory: '#3fa7c1'},
  warn:     {trace: '#ffe0a7', glow: '#ffb54d', memory: '#e85b8b'},
  danger:   {trace: '#ffaf99', glow: '#ff605c', memory: '#66dbe2'},
  collapse: {trace: '#ffbbd1', glow: '#ff4b85', memory: '#75f2e4'}
};

const TAU = Math.PI * 2;
const clamp01 = value => Math.max(0, Math.min(1, value));
const frac = value => value - Math.floor(value);
const gaussian = (value, width) => Math.exp(-((value / width) ** 2));

function sample(seconds, risk, disruption, channel) {
  const severity = risk / 100;
  const unstable = clamp01((risk - 29) / 71);
  const phase = seconds * (1.28 + severity * .67) + .29 * unstable * Math.sin(seconds * 1.83);
  const cycle = Math.floor(phase);
  const variance = Math.sin(cycle * 4.19) * Math.cos(cycle * 1.65);
  const time = frac(phase) - .32 - variance * unstable * .103;
  const strength = .72 + variance * (.065 + unstable * .22);
  const pulse = .17 * gaussian(time + .116, .037) - .22 * gaussian(time + .035, .017)
    + strength * gaussian(time, .019 + unstable * .007) - .48 * gaussian(time - .037, .024)
    + .19 * gaussian(time - .147, .055);
  const after = time > .075 ? Math.sin(time * (63 + 92 * unstable)) * Math.exp(-time * 12) : 0;
  const interference = Math.sin(seconds * 51.2 + channel) * Math.cos(seconds * 24.8);
  const carrier = .033 * Math.sin(seconds * 11) + .014 * Math.cos(seconds * 31);
  const echo = channel ? Math.sin(seconds * 16.1) * (.08 + unstable * .18) : 0;
  const amplitude = pulse + after * (.31 + unstable * .33) + carrier + echo
    + interference * (unstable * .21 + disruption * .18);
  const packet = Math.floor(seconds * (8 + unstable * 5));
  const lost = risk >= 40 && frac(Math.sin(packet * 6.17) * 134.53) < unstable ** 2 * .32 + disruption * .16;
  return {value: Math.max(-.95, Math.min(1.04, amplitude)), lost};
}

function drawTrace(ctx, samples, width, height, head, color, widthPx, strength) {
  const baseline = height * .54;
  const vertical = height * .43;
  const step = width / (samples.length - 1);
  ctx.lineWidth = widthPx;
  ctx.strokeStyle = color;
  let lastGroup = -1;
  let previous = -2;
  for (let i = 1; i < samples.length; i++) {
    const p = samples[i - 1];
    const q = samples[i];
    if (p.lost || q.lost || i === head + 1) continue;
    const distance = (head - i + samples.length) % samples.length;
    const group = Math.floor(distance * 8 / samples.length);
    if (group !== lastGroup) {
      if (lastGroup >= 0) ctx.stroke();
      ctx.globalAlpha = strength * (1 - .69 * group / 8);
      ctx.beginPath();
      lastGroup = group;
      previous = -2;
    }
    if (previous !== i - 1) ctx.moveTo((i - 1) * step, baseline - p.value * vertical);
    ctx.lineTo(i * step, baseline - q.value * vertical);
    previous = i;
  }
  if (lastGroup >= 0) ctx.stroke();
}

export function paintNeuralScope(ctx, width, height, stage, risk, seconds, disruption = 0, moving = true) {
  const palette = WAVE_COLORS[stage] ?? WAVE_COLORS.stable;
  const count = Math.max(72, Math.min(240, Math.round(width / 2.5)));
  const period = 3.05 - risk * .007;
  const head = moving ? Math.floor(frac(seconds / period) * count) : count - 1;
  const now = moving ? seconds : 5.35;
  const samples = [];
  const memory = [];
  for (let index = 0; index < count; index++) {
    const age = ((head - index + count) % count) * period / count;
    samples.push(sample(now - age, risk, disruption, 0));
    memory.push(sample(now - age - .085 - risk * .0014, risk, disruption * .55, 1));
  }

  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const separation = risk / 100;
  drawTrace(ctx, memory, width, height, head, palette.memory, 1, .23 + .38 * separation);
  drawTrace(ctx, samples, width, height, head, palette.glow, 5, .12 + separation * .16);
  drawTrace(ctx, samples, width, height, head, palette.trace, 1.55, .96);

  // The lower rail exposes sampling density. Gaps in the trace retain the red recovery marks.
  ctx.fillStyle = palette.memory;
  ctx.globalAlpha = .38;
  ctx.fillRect(0, height - 6, width, 1);
  const sampleWidth = width / count;
  for (let i = 0; i < count; i += 3) {
    const packet = samples[i];
    const distance = (head - i + count) % count;
    ctx.fillStyle = packet.lost ? '#ff5686' : palette.glow;
    ctx.globalAlpha = packet.lost ? .54 + .20 * disruption : .20 + .25 * (1 - distance / count);
    ctx.fillRect(i * sampleWidth, height - (packet.lost ? 9 : 4), packet.lost ? Math.max(2, sampleWidth * 1.6) : 1, packet.lost ? 7 : 2);
  }

  if (moving) {
    const cursor = head * width / (count - 1);
    const glow = ctx.createLinearGradient(Math.max(-24, cursor - 24), 0, cursor + 1, 0);
    glow.addColorStop(0, 'transparent');
    glow.addColorStop(1, palette.glow + '47');
    ctx.globalAlpha = .8;
    ctx.fillStyle = glow;
    ctx.fillRect(cursor - 24, 1, 25, height - 2);
    ctx.globalAlpha = .36;
    ctx.fillStyle = palette.glow;
    ctx.fillRect(cursor, 0, 1, height);
    ctx.globalAlpha = .45;
    ctx.fillRect(Math.max(0, cursor - 5), 1, 6, 2);
    ctx.fillRect(Math.max(0, cursor - 2), height - 4, 3, 3);
    const newest = samples[head];
    if (!newest.lost) {
      const y = height * (.54 - newest.value * .43);
      ctx.globalAlpha = .93;
      ctx.fillStyle = palette.trace;
      ctx.beginPath();
      ctx.arc(cursor, y, 2.45, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export const SCENES = {
  watch:    {duration: 520,  optics: 520,  latch: 0,    hold: 0,    interval: [9200, 13700], cuts: 1, force: .32},
  warn:     {duration: 1740, optics: 690,  latch: 590,  hold: 1000, interval: [6400, 9700],  cuts: 2, force: .57},
  danger:   {duration: 3000, optics: 1040, latch: 830,  hold: 2000, interval: [4700, 6950],  cuts: 4, force: .85},
  collapse: {duration: 4900, optics: 1880, latch: 1700, hold: 3000, interval: [6200, 8900],  cuts: 5, force: 1}
};

function anchoredCuts(anchors, count, width, height, mirror) {
  const bands = [];
  for (const anchor of anchors) {
    const index = bands.length;
    const fraction = [.34, .58, .24, .53, .42][index];
    const clipLeft = Math.max(0, anchor.x);
    const clipTop = Math.max(0, anchor.y);
    const clipRight = Math.min(width, anchor.x + anchor.width);
    const clipBottom = Math.min(height, anchor.y + anchor.height);
    const left = clipLeft + (clipRight - clipLeft) * (mirror ? .06 : .12);
    const top = clipTop + (clipBottom - clipTop) * fraction;
    const right = Math.min(clipRight - 5, left + 425);
    const bottom = Math.min(clipBottom - 2, top + Math.min(39, anchor.height * .24));
    if (right - left < 20 || bottom - top < 5) continue;
    const direction = (index % 2 === Number(mirror)) ? 1 : -1;
    bands.push({
      x: left, y: top, width: right - left, height: bottom - top,
      dx: direction * Math.min(46, 14 + (right - left) * .09),
      dy: direction * (2 + index % 3 * 2),
      lag: index * .054,
      color: direction > 0 ? 'red' : 'cyan',
      source: anchor
    });
    if (bands.length === count) break;
  }
  return bands;
}

const IMPACT = [.635, .398];
const RING = [
  [.503,.278], [.618,.225], [.725,.259], [.791,.369],
  [.741,.535], [.598,.591], [.483,.493], [.458,.365]
];
const RAYS = [
  [[.329,.201], [0,.111]],
  [[.555,.101], [.434,0]],
  [[.762,.109], [.846,0]],
  [[.902,.282], [1,.202]],
  [[.867,.609], [1,.715]],
  [[.714,.753], [.850,1]],
  [[.365,.678], [.234,1]],
  [[.232,.448], [0,.586]]
];
const CORNERS = [[[0,0]], [], [[1,0]], [], [[1,1]], [], [[0,1]], []];
const PLATES = [
  [-23,-25, 25, 13,-11,-2], [  7,-27,-29, 12,  8, 1],
  [ 32,-20, 43, -7,-15, 3], [ 36,  7,-46, 10,-18,-2],
  [ 25, 32, 33,-13,  9, 2], [  2, 35,-28, -9,-10,-1],
  [-37, 26, 37,-14, 12, 2], [-38,  3,-45,  6, 18,-3],
  [-10,-14, 62, 18, -9,-4], [ 23,-12, 83, -8, 19, 5],
  [ 17, 25, 53,-20, -9, 5], [-23, 15, 72,-13, 16,-5]
];

const SHIFT = [
  [0, 0, 0],
  [.09, 1, .93],
  [.26, 1, .93],
  [.34, -.43, .82],
  [.50, -.43, .82],
  [.58, .58, .78],
  [.72, .49, .72],
  [.87, -.13, .51],
  [1, 0, 0]
];
const BREAK = [
  [0, 0, 0],
  [.12, .045, .82],
  [.30, 1.06, 1],
  [.49, .88, 1],
  [.65, .64, .99],
  [.83, -.035, .86],
  [.92, .026, .58],
  [1, 0, 0]
];

function sampleTrack(track, progress) {
  const t = clamp01(progress);
  const end = track.findIndex(frame => frame[0] >= t);
  if (end <= 0) return track[0].slice(1);
  const [startTime, startDistance, startAlpha] = track[end - 1];
  const [endTime, endDistance, endAlpha] = track[end];
  const ratio = (t - startTime) / (endTime - startTime);
  const blend = ratio * ratio * (3 - 2 * ratio);
  return [startDistance + (endDistance - startDistance) * blend, startAlpha + (endAlpha - startAlpha) * blend];
}

function bbox(points) {
  const x = Math.min(...points.map(point => point[0]));
  const y = Math.min(...points.map(point => point[1]));
  const right = Math.max(...points.map(point => point[0]));
  const bottom = Math.max(...points.map(point => point[1]));
  return {x, y, width: right - x, height: bottom - y};
}

function buildPlate(points, motion, index, width, height, mirror) {
  const vertices = points.map(([x,y]) => [(mirror ? 1 - x : x) * width, y * height]);
  const bounds = bbox(vertices);
  const polygon = vertices.map(([x,y]) => [x - bounds.x, y - bounds.y]);
  const [dx,dy,z,rx,ry,rz] = motion;
  return {...bounds, polygon, dx: mirror ? -dx : dx, dy, z, rx, ry: mirror ? -ry : ry, rz: mirror ? -rz : rz,
    color: index % 3 === 1 ? 'cyan' : 'red', lag: (index % 4) * .036, rank: index};
}

export function makeShot(stage, width, height, take = 0, anchors = []) {
  const settings = SCENES[stage];
  if (!settings) return {bands: [], plates: [], chips: []};
  const mirror = take % 2 === 1;
  const bands = anchoredCuts(anchors, settings.cuts, width, height, mirror);
  if (stage !== 'collapse') return {bands, plates: [], chips: []};

  const plates = RING.map((point,index) => {
    const next = (index + 1) % RING.length;
    const border = [...RAYS[index], ...CORNERS[index], ...[...RAYS[next]].reverse()];
    return buildPlate([point, ...border, RING[next]], PLATES[index], index, width, height, mirror);
  });
  for (let index = 0; index < 4; index++) {
    const edge = index * 2;
    const points = [IMPACT, RING[edge], RING[edge+1], RING[(edge+2) % RING.length]];
    plates.push(buildPlate(points, PLATES[index+8], index+8, width, height, mirror));
  }
  const impact = [(mirror ? 1 - IMPACT[0] : IMPACT[0]) * width, IMPACT[1] * height];
  const chips = RING.map(([x,y], index) => {
    const base = [(mirror ? 1 - x : x) * width, y * height];
    const dx = base[0] - impact[0], dy = base[1] - impact[1];
    return {
      x: impact[0] + dx * .36, y: impact[1] + dy * .36,
      dx: dx * (.58 + (index % 3) * .14), dy: dy * (.51 + (index % 2) * .18),
      size: 4 + index % 4 * 2, turn: (index % 2 ? -1 : 1) * (31 + index * 13),
      lag: index % 3 * .035, color: index % 3 === 1 ? 'cyan' : 'red'
    };
  });
  return {bands, plates, chips};
}

export function shotFrame(stage, risk, progress, shot) {
  const strength = SCENES[stage].force * (.72 + Math.min(100, risk) * .0028);
  const glass = stage === 'collapse';
  const crossover = clamp01((progress - .33) / .18);
  const fadeBands = glass ? 1 - crossover * crossover * (3 - 2 * crossover) : 1;
  const bands = shot.bands.map(band => {
    const local = ((progress - band.lag * (glass ? .31 : 1)) / (glass ? .52 : .71));
    const [offset, opacity] = sampleTrack(SHIFT, local);
    return {x: band.dx * offset * strength, y: band.dy * offset * strength, opacity: opacity * (.55 + .42 * strength) * fadeBands};
  });
  const plates = shot.plates.map(plate => {
    const local = (progress - .15 - plate.lag * .45) / (.74 + plate.lag * .5);
    const [motion, opacity] = sampleTrack(BREAK, local);
    const amplitude = strength * motion;
    return {
      x: plate.dx * amplitude, y: plate.dy * amplitude, z: plate.z * amplitude,
      rx: plate.rx * amplitude, ry: plate.ry * amplitude, rz: plate.rz * amplitude,
      opacity: opacity * .97
    };
  });
  const split = Math.max(0, ...bands.map(band => band.opacity));
  const [breakDistance, breakAlpha] = glass ? sampleTrack(BREAK, (progress - .15) / .82) : [0, 0];
  const chips = shot.chips.map(chip => {
    const local = (progress - .22 - chip.lag) / .70;
    const [spread, opacity] = sampleTrack(BREAK, local);
    return {x: chip.x + chip.dx * spread, y: chip.y + chip.dy * spread,
      angle: chip.turn * spread, opacity: opacity * clamp01(spread * 1.25) * .84};
  });
  return {bands, plates, chips, backing: breakAlpha * .87, light: clamp01(breakDistance) * breakAlpha,
    disruption: Math.max(split * .85, breakAlpha),
    ink: {opacity: Math.max(split * .83, breakAlpha * .48),
      shift: (Math.sin(progress * 37) > 0 ? 1 : -1) * (3 + 7 * strength),
      slice: 13 + (Math.floor(progress * 28) % 4) * 10}};
}
