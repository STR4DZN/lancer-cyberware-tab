import {makeShot, paintNeuralScope, SCENES, shotFrame} from './signal-rendering.js';
import {chooseQuestions, cipherQuestion, narrativePhase} from './neural-narrative.js';

const SVG = 'http://www.w3.org/2000/svg';
const FRAME_MS = 1000 / 36;
const SOURCES = [
  '.lcy-header', '.lcy-status', '.lcy-telemetry', '.lcy-section-title', '.lcy-cat',
  '.lcy-workbench-head', '.lcy-equipped-row', '.lcy-socket', '.lcy-item-card', '.lcy-detail'
].join(', ');

function svgNode(tag, attributes = {}) {
  const node = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

function layer(className) {
  const node = document.createElement('div');
  node.className = className;
  return node;
}

function place(node, {x, y, width, height}) {
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  node.style.width = width + 'px';
  node.style.height = height + 'px';
}

function visibleFrame(shell) {
  const bounds = shell.getBoundingClientRect();
  let left = Math.max(0, bounds.left);
  let top = Math.max(0, bounds.top);
  let right = Math.min(window.innerWidth, bounds.right);
  let bottom = Math.min(window.innerHeight, bounds.bottom);
  for (let el = shell.parentElement; el && el !== document.documentElement; el = el.parentElement) {
    const {overflowX, overflowY} = getComputedStyle(el);
    if (overflowX === 'visible' && overflowY === 'visible') continue;
    const area = el.getBoundingClientRect();
    if (overflowX !== 'visible') {
      const scale = area.width / el.offsetWidth || 1;
      const origin = area.left + el.clientLeft * scale;
      left = Math.max(left, origin);
      right = Math.min(right, origin + el.clientWidth * scale);
    }
    if (overflowY !== 'visible') {
      const scale = area.height / el.offsetHeight || 1;
      const origin = area.top + el.clientTop * scale;
      top = Math.max(top, origin);
      bottom = Math.min(bottom, origin + el.clientHeight * scale);
    }
  }
  const sx = bounds.width / shell.offsetWidth || 1;
  const sy = bounds.height / shell.offsetHeight || 1;
  return {
    left, top, right, bottom, sx, sy,
    x: (left - bounds.left) / sx - shell.clientLeft + shell.scrollLeft,
    y: (top - bounds.top) / sy - shell.clientTop + shell.scrollTop,
    width: Math.max(0, (right - left) / sx), height: Math.max(0, (bottom - top) / sy)
  };
}

function fromViewport(rect, frame) {
  return {x: (rect.left - frame.left) / frame.sx, y: (rect.top - frame.top) / frame.sy,
    width: rect.width / frame.sx, height: rect.height / frame.sy};
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function collectSurfaces(shell, frame) {
  return [...shell.querySelectorAll(SOURCES)]
    .map(node => ({node, ...fromViewport(node.getBoundingClientRect(), frame)}))
    .filter(surface => overlaps(surface, {x: 0, y: 0, width: frame.width, height: frame.height}));
}

function copySurface(surface) {
  const copy = surface.cloneNode(true);
  const traits = ['id', 'for', 'name', 'aria-controls', 'aria-labelledby', 'data-cyber-action', 'data-drag-id', 'data-drop-region', 'draggable'];
  const query = traits.map(name => '[' + name + ']').join(',');
  const focusable = 'button, input, select, textarea, a[href], [tabindex]';
  if (copy.matches(focusable)) copy.tabIndex = -1;
  for (const control of copy.querySelectorAll(focusable)) control.tabIndex = -1;
  for (const node of [copy, ...copy.querySelectorAll(query)]) {
    for (const name of traits) node.removeAttribute(name);
  }
  const originals = [...surface.querySelectorAll('canvas,img')];
  [...copy.querySelectorAll('canvas,img')].forEach((node, index) => {
    const original = originals[index];
    const image = original instanceof HTMLImageElement;
    if (image && (!original.complete || !original.naturalWidth)) {
      node.remove();
      return;
    }
    const bitmap = document.createElement('canvas');
    const width = image ? original.naturalWidth : original.width;
    const height = image ? original.naturalHeight : original.height;
    const displaySize = Math.max(original.clientWidth, original.clientHeight, 48);
    const limit = image ? Math.min(512, displaySize * 1.65) : 960;
    const scale = Math.min(1, limit / Math.max(width, height));
    bitmap.width = Math.max(1, Math.round(width * scale));
    bitmap.height = Math.max(1, Math.round(height * scale));
    bitmap.className = node.className;
    bitmap.style.cssText = node.style.cssText;
    if (image) bitmap.classList.add('lcy-fx-image');
    if (width && height) bitmap.getContext('2d')?.drawImage(original, 0, 0, bitmap.width, bitmap.height);
    node.replaceWith(bitmap);
  });
  return copy;
}

function populate(texture, area, sources) {
  for (const surface of sources) {
    if (!overlaps(area, surface)) continue;
    const copy = copySurface(surface.node);
    copy.classList.add('lcy-fx-copy');
    place(copy, {...surface, x: surface.x - area.x, y: surface.y - area.y});
    texture.append(copy);
  }
}

function makeColorFilter(root, id) {
  const svg = svgNode('svg', {class: 'lcy-fx-filter', width: 0, height: 0});
  const filter = svgNode('filter', {id, x: '-20%', width: '140%', y: '-12%', height: '124%', 'color-interpolation-filters': 'sRGB'});
  const red = svgNode('feOffset', {in: 'red', dx: -4, dy: 1, result: 'r'});
  const cyan = svgNode('feOffset', {in: 'cyan', dx: 4, dy: -1, result: 'c'});
  filter.append(
    svgNode('feColorMatrix', {in: 'SourceGraphic', type: 'matrix',
      values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'red'}),
    svgNode('feColorMatrix', {in: 'SourceGraphic', type: 'matrix',
      values: '0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0', result: 'cyan'}),
    red, cyan,
    svgNode('feBlend', {in: 'r', in2: 'c', mode: 'screen'})
  );
  const defs = svgNode('defs');
  defs.append(filter);
  svg.append(defs);
  root.append(svg);
  return {red, cyan};
}

function makeBand(band, sources, filterId) {
  const node = layer('lcy-fx-band');
  place(node, band);
  node.dataset.channel = band.color;
  const crop = layer('lcy-fx-band-crop');
  crop.dataset.cut = String(Math.round(band.height) % 3);
  const texture = layer('lcy-fx-texture');
  texture.style.filter = 'url("#' + filterId + '")';
  populate(texture, band, sources);
  crop.append(texture, layer('lcy-fx-raster'));
  node.append(crop);
  return node;
}

function bevel(plate) {
  const body = svgNode('svg', {class: 'lcy-fx-bevel', viewBox: '0 0 ' + plate.width + ' ' + plate.height});
  const viewBox = '0 0 ' + plate.width + ' ' + plate.height;
  const rim = svgNode('svg', {class: 'lcy-fx-rim', viewBox});
  const cracks = svgNode('svg', {class: 'lcy-fx-cracks', viewBox});
  const offset = plate.rank >= 8 ? [4.5, 6] : [4, 5.5];
  const p = plate.polygon;
  for (let index = 0; index < p.length; index++) {
    const a = p[index];
    const b = p[(index + 1) % p.length];
    const facing = (b[0] - a[0]) * .58 - (b[1] - a[1]) * .42;
    const tint = plate.color === 'cyan' ? '#82f9e6' : '#ff91b5';
    body.append(svgNode('polygon', {
      points: [a, b, [b[0] + offset[0], b[1] + offset[1]], [a[0] + offset[0], a[1] + offset[1]]]
        .map(point => point.join(',')).join(' '),
      fill: facing > 0 ? '#52253e' : '#180e21',
      stroke: facing > 0 ? '#a44569' : '#351d35', 'stroke-width': .65
    }));
    rim.append(svgNode('line', {x1: a[0], y1: a[1], x2: b[0], y2: b[1],
      stroke: facing > 0 ? tint : '#67516a', opacity: facing > 0 ? .82 : .55, 'stroke-width': facing > 0 ? 1.6 : .85}));
  }
  const midpoint = p.reduce(([x,y], [nx,ny]) => [x + nx / p.length, y + ny / p.length], [0,0]);
  // The finer cracks start on a fractured edge and terminate inside its own plate.
  for (const index of [0, Math.floor(p.length / 2)]) {
    const a = p[index], b = p[(index + 1) % p.length];
    const edge = [a[0] * .59 + b[0] * .41, a[1] * .59 + b[1] * .41];
    const inward = (distance, turn) => [edge[0] + (midpoint[0] - edge[0]) * distance + turn,
      edge[1] + (midpoint[1] - edge[1]) * distance - turn];
    const points = [edge, inward(.20, 0), inward(.36, 3), inward(.63, -2)];
    cracks.append(svgNode('polyline', {points: points.map(point => point.join(',')).join(' '), fill: 'none',
      stroke: plate.color === 'cyan' ? '#9affed' : '#f6a2c3', 'stroke-opacity': .36, 'stroke-width': .7}));
  }
  return {body, rim, cracks};
}

function makePlate(plate, sources) {
  const node = layer('lcy-fx-plate');
  const front = layer('lcy-fx-front');
  const texture = layer('lcy-fx-texture');
  const reflection = layer('lcy-fx-reflection');
  const {body, rim, cracks} = bevel(plate);
  place(node, plate);
  node.dataset.channel = plate.color;
  node.style.zIndex = String(8 + Math.round((plate.z + 50) / 8));
  front.style.clipPath = 'polygon(' + plate.polygon.map(([x,y]) => x + 'px ' + y + 'px').join(',') + ')';
  populate(texture, plate, sources);
  front.append(texture, reflection, cracks);
  node.append(body, front, rim);
  return {node, reflection};
}

function bindLabels(scene, shell) {
  const enabled = new Set(scene.labels.filter(label => label.enabled).map(label => label.node));
  scene.labels = [...shell.querySelectorAll('.lcy-neural-label')].flatMap(node => {
    if (node.closest('.lcy-fx-stage')) return [];
    const question = scene.questions.systems.get(node.dataset.neuralRegion);
    const local = node.hasAttribute('data-neural-local');
    if (!question && !local) return [];
    return [{node, question: question ?? scene.questions.local, local, enabled: !local || enabled.has(node)}];
  });
}

function keepQuestionInView(scene, frame) {
  const viewport = {x: 0, y: 0, width: frame.width, height: frame.height};
  let fallback;
  for (const label of scene.labels) {
    const area = fromViewport(label.node.getBoundingClientRect(), frame);
    if (!overlaps(viewport, area)) continue;
    const visibleHeight = Math.min(viewport.height, area.y + area.height) - Math.max(0, area.y);
    if (visibleHeight < area.height * .65) continue;
    if (label.enabled) return;
    if (label.local) fallback ??= label;
  }
  if (fallback) fallback.enabled = true;
}

function paintQuestions(scene, phase) {
  scene.phase = phase;
  for (const label of scene.labels) {
    const {node, question} = label;
    const next = label.enabled ? phase : 'normal';
    if ((node.dataset.neuralPhase ?? 'normal') === next) continue;
    const output = node.querySelector('.lcy-neural-question');
    if (next === 'normal') {
      delete node.dataset.neuralPhase;
      output.textContent = '';
    } else {
      output.textContent = next === 'hold' ? question : cipherQuestion(question, next === 'decode');
      node.dataset.neuralPhase = next;
    }
  }
}

function buildStage(shell, frame, stage, panelId, take) {
  const root = layer('lcy-fx-stage');
  root.setAttribute('aria-hidden', 'true');
  root.inert = true;
  root.dataset.shot = stage;
  place(root, frame);
  const questions = chooseQuestions(stage, take);
  const sources = collectSurfaces(shell, frame);
  const anchors = sources.filter(({node}) => node.matches('.lcy-telemetry'));
  anchors.push(...sources.filter(({node}) => node.matches('.lcy-cat') && questions.systems.has(node.dataset.region)));
  anchors.push(...sources.filter(({node}) => node.matches('.lcy-workbench-head, .lcy-equipped-row')));
  anchors.push(...sources.filter(source => !anchors.includes(source)));
  const geometry = makeShot(stage, frame.width, frame.height, take, anchors);
  const filterId = panelId + '-screen-split';
  const channels = makeColorFilter(root, filterId);
  const backing = layer('lcy-fx-backing');
  root.append(backing);
  const bands = geometry.bands.map(band => makeBand(band, [band.source], filterId));
  const plates = geometry.plates.map(plate => makePlate(plate, sources));
  const chips = geometry.chips.map(chip => {
    const node = layer('lcy-fx-chip');
    node.dataset.channel = chip.color;
    node.style.width = chip.size + 'px';
    node.style.height = chip.size * 1.8 + 'px';
    return node;
  });
  root.append(...plates.map(plate => plate.node), ...bands, ...chips);
  shell.append(root);
  const scene = {root, backing, bands, plates, chips, channels, geometry, questions,
    labels: [], phase: 'normal', started: performance.now(), frozen: null};
  if (questions.systems.size) bindLabels(scene, shell);
  return scene;
}

function setSceneFrame(scene, shot, stage, shell) {
  const ink = shot.ink;
  shell.style.setProperty('--lcy-ink-power', ink.opacity.toFixed(3));
  shell.style.setProperty('--lcy-ink-shift', ink.shift.toFixed(2) + 'px');
  shell.style.setProperty('--lcy-ink-top', ink.slice + '%');
  shell.style.setProperty('--lcy-ink-bottom', 83 - ink.slice + '%');
  const intensity = SCENES[stage].force;
  const separation = (2 + 8 * shot.disruption * intensity).toFixed(1);
  scene.channels.red.setAttribute('dx', '-' + separation);
  scene.channels.cyan.setAttribute('dx', separation);
  scene.chips.forEach((node, index) => {
    const chip = shot.chips[index];
    node.style.transform = 'translate3d(' + chip.x.toFixed(2) + 'px,' + chip.y.toFixed(2) + 'px,0) rotate(' + chip.angle.toFixed(2) + 'deg)';
    node.style.opacity = chip.opacity.toFixed(3);
  });
  scene.backing.style.opacity = String(shot.backing);
  scene.bands.forEach((node, index) => {
    const band = shot.bands[index];
    node.style.opacity = String(band.opacity);
    node.style.transform = 'translate3d(' + band.x + 'px,' + band.y + 'px,0)';
    node.style.setProperty('--lcy-raster-offset', Math.round(band.x * .47) + 'px');
  });
  scene.plates.forEach(({node,reflection}, index) => {
    const plate = shot.plates[index];
    node.style.opacity = String(plate.opacity);
    node.style.transform = 'perspective(760px) translate3d(' + plate.x + 'px,' + plate.y + 'px,' + plate.z + 'px)'
      + ' rotateX(' + plate.rx + 'deg) rotateY(' + plate.ry + 'deg) rotateZ(' + plate.rz + 'deg)';
    reflection.style.opacity = String(shot.light * (.48 + index % 4 * .12));
    reflection.style.transform = 'translateX(' + (shot.light * 35 - 12) + '%)';
    node.style.setProperty('--lcy-fracture-glow', (shot.light * .47).toFixed(3));
  });
}

export class NeuralMotion {
  constructor(panel) {
    this.panel = panel;
    this.preference = matchMedia('(prefers-reduced-motion: reduce)');
    this.clock = performance.now();
    this.take = 0;
    this.measure = this.measure.bind(this);
    this.tick = this.tick.bind(this);
    this.invalidate = this.invalidate.bind(this);
  }

  update(shell, active, quiet) {
    const previous = this.stage;
    if (shell !== this.shell) {
      if (this.shell) this.resize?.unobserve(this.shell);
      this.removeShot();
      this.shell = shell;
      this.canvas = shell?.querySelector('.lcy-scope-canvas');
      this.context = this.canvas?.getContext('2d') ?? null;
    }
    this.stage = shell?.dataset.riskStage;
    this.risk = Number(shell?.dataset.riskScore) || 0;
    this.quiet = quiet;
    if (!active || !this.canvas || !this.panel.isConnected) {
      this.stop();
      if (active === false && this.panel.classList.contains('active')) this.paintScope(performance.now(), false);
      return;
    }
    if (this.stage !== previous) this.nextShot = performance.now() + 520;
    if (!this.events) this.connect();
    this.resize.observe(shell);
    this.measure();
  }

  connect() {
    this.events = new AbortController();
    const {signal} = this.events;
    window.addEventListener('scroll', this.invalidate, {capture: true, passive: true, signal});
    window.addEventListener('resize', this.invalidate, {passive: true, signal});
    document.addEventListener('visibilitychange', this.measure, {signal});
    this.preference.addEventListener('change', this.measure, {signal});
    this.resize = new ResizeObserver(this.invalidate);
    this.intersection = new IntersectionObserver(this.measure, {threshold: [0, .15, .5, 1]});
    this.intersection.observe(this.panel);
  }

  invalidate() {
    if (!this.events) return;
    this.layoutFrame ??= requestAnimationFrame(() => {
      this.layoutFrame = null;
      this.measure();
    });
  }

  rebindLabels() {
    const {scene} = this;
    if (scene?.questions.systems.size) {
      bindLabels(scene, this.shell);
      paintQuestions(scene, scene.phase);
    }
    this.invalidate();
  }

  get allowed() {
    return Boolean(this.events && this.panel.isConnected && !document.hidden && !this.preference.matches && !this.quiet
      && this.visible?.width > 92 && this.visible.height > 60);
  }

  measure() {
    if (!this.events) return;
    if (!this.panel.isConnected) {
      this.stop();
      return;
    }
    this.visible = visibleFrame(this.shell);
    const scope = fromViewport(this.canvas.getBoundingClientRect(), this.visible);
    this.scopeVisible = overlaps(scope, {x: 0, y: 0, width: this.visible.width, height: this.visible.height});
    if (!this.allowed) {
      this.pause();
      if (this.scopeVisible && !document.hidden) this.paintScope(performance.now(), false);
      return;
    }
    if (this.scene?.phase && this.scene.phase !== 'normal') {
      keepQuestionInView(this.scene, this.visible);
      paintQuestions(this.scene, this.scene.phase);
    }
    this.armShot();
    this.wake();
  }

  armShot() {
    clearTimeout(this.timer);
    const config = SCENES[this.stage];
    if (!config || !this.allowed || this.scene) return;
    const delay = Math.max(260, (this.nextShot ?? performance.now() + 750) - performance.now());
    this.timer = setTimeout(() => {
      const active = document.activeElement;
      const editing = this.shell.contains(active) && active?.matches('input,textarea,select,[contenteditable="true"]');
      if (editing || this.panel.classList.contains('lcy-dragging')) {
        this.nextShot = performance.now() + 1800;
        this.armShot();
        return;
      }
      if (this.allowed) this.startShot();
    }, delay);
  }

  startShot(frozen = null) {
    if (!this.allowed || !SCENES[this.stage]) return false;
    this.removeShot();
    clearTimeout(this.timer);
    const frame = visibleFrame(this.shell);
    if (frame.width < 92 || frame.height < 60) return false;
    if (this.scopeVisible) this.paintScope(performance.now());
    this.scene = buildStage(this.shell, frame, this.stage, this.panel.id, this.take++);
    this.scene.frozen = frozen;
    this.paintShot(frozen ?? 0);
    this.wake();
    return true;
  }

  inspectFrame(position) {
    if (!this.allowed || !SCENES[this.stage]) return false;
    if (!this.scene || this.scene.frozen === null) return this.startShot(position);
    this.scene.frozen = position;
    this.paintShot(position);
    return true;
  }

  paintShot(progress) {
    const scene = this.scene;
    const config = SCENES[this.stage];
    const elapsed = progress * config.duration;
    const optics = Math.min(1, elapsed / config.optics);
    if (optics < 1 || !scene.root.hidden) {
      const shot = shotFrame(this.stage, this.risk, optics, scene.geometry);
      this.disruption = optics < 1 ? shot.disruption : 0;
      setSceneFrame(scene, shot, this.stage, this.shell);
      scene.root.hidden = optics >= 1;
    }
    const phase = narrativePhase(config, elapsed);
    if (phase !== scene.phase) {
      if (phase !== 'normal') keepQuestionInView(scene, this.visible);
      paintQuestions(scene, phase);
    }
  }

  paintScope(now, moving = true) {
    if (!this.context || !this.canvas.isConnected) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(1.6, devicePixelRatio || 1);
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.context.setTransform(w / width, 0, 0, h / height, 0, 0);
    }
    paintNeuralScope(this.context, width, height, this.stage, this.risk,
      (now - this.clock) / 1000, this.disruption || 0, moving);
  }

  wake() {
    if (this.scopeVisible || this.scene?.frozen === null) this.frame ??= requestAnimationFrame(this.tick);
  }

  tick(now) {
    this.frame = null;
    if (!this.allowed) {
      if (!this.panel.isConnected) this.stop();
      else this.pause();
      return;
    }
    if (!this.lastFrame || now - this.lastFrame >= FRAME_MS) {
      if (this.scene?.frozen === null) {
        const settings = SCENES[this.stage];
        const progress = (now - this.scene.started) / settings.duration;
        if (progress >= 1) {
          this.removeShot();
          const [early, late] = settings.interval;
          const ratio = .36 + (this.take % 4) * .16;
          this.nextShot = now + early + (late - early) * ratio - this.risk * 5;
          this.armShot();
        } else this.paintShot(progress);
      }
      if (this.scopeVisible) this.paintScope(now);
      this.lastFrame = now;
    }
    this.wake();
  }

  removeShot() {
    if (this.scene) {
      paintQuestions(this.scene, 'normal');
      this.scene.root.remove();
      for (const property of ['power', 'shift', 'top', 'bottom']) {
        this.shell?.style.removeProperty('--lcy-ink-' + property);
      }
    }
    this.scene = null;
    this.disruption = 0;
  }

  pause() {
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    this.frame = null;
    this.removeShot();
  }

  stop() {
    this.pause();
    cancelAnimationFrame(this.layoutFrame);
    this.layoutFrame = null;
    this.events?.abort();
    this.events = null;
    this.resize?.disconnect();
    this.intersection?.disconnect();
  }
}
