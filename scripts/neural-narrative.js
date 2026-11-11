const SYSTEM_VOICES = {
  optico: ['Você viu isso mesmo?', 'Quem está vendo por você?', 'Feche os olhos. Ainda me vê?'],
  frontal: ['O que você é?', 'De onde você veio?', 'Qual dessas memórias é sua?'],
  sistema: ['Você quer mesmo fazer isso?', 'Essa decisão é sua?', 'Quem deu essa ordem?']
};

const SYSTEM_SEQUENCE = ['optico', 'frontal', 'sistema'];
const LOCAL_VOICE = ['De onde você veio?', 'Você ainda sabe quem é?', 'Foi você que decidiu?'];
const LINK_STATES = {
  stable: {frame: 'ÍNTEGRO', origin: 'PILOTO', packet: 'CRC OK'},
  watch: {frame: 'REPETIDO', origin: 'CACHE LOCAL', packet: 'RETRY'},
  warn: {frame: 'PARCIAL', origin: 'ASSINATURA DUPLA', packet: 'CRC ERRO'},
  danger: {frame: 'RESIDUAL', origin: 'ORIGEM OCULTA', packet: 'DADOS CIFRADOS'},
  collapse: {frame: 'NÃO VERIFICADO', origin: 'SEM ORIGEM', packet: 'DADOS CIFRADOS'}
};

export function neuralReadouts(stage, risk) {
  const state = LINK_STATES[stage] ?? LINK_STATES.stable;
  const sync = Math.max(.01, (1 - risk / 100) ** 1.45).toFixed(2);
  const signature = (Math.imul(1103, risk + 19) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const encrypted = stage === 'danger' || stage === 'collapse';
  return {
    sync,
    frame: state.frame,
    origin: encrypted ? signature.slice(0, 2) + '::' + signature.slice(2) + ' / Ø' : state.origin,
    packet: state.packet
  };
}

export function chooseQuestions(stage, take) {
  const count = {warn: 1, danger: 2, collapse: 3}[stage] ?? 0;
  const round = Math.floor(take / SYSTEM_SEQUENCE.length);
  const questions = SYSTEM_SEQUENCE.slice(take % 3).concat(SYSTEM_SEQUENCE.slice(0, take % 3))
    .slice(0, count).map((id, index) => ({
      id,
      text: SYSTEM_VOICES[id][(round + index) % SYSTEM_VOICES[id].length]
    }));
  return {systems: new Map(questions.map(({id, text}) => [id, text])), local: LOCAL_VOICE[take % LOCAL_VOICE.length]};
}

export function narrativePhase({latch, hold}, elapsed) {
  if (!hold || elapsed < latch - 120 || elapsed >= latch + hold + 120) return 'normal';
  if (elapsed < latch - 56) return 'broken';
  if (elapsed < latch) return 'decode';
  if (elapsed < latch + hold) return 'hold';
  return 'recover';
}

export function cipherQuestion(text, short = false) {
  const symbols = ['Ø', '1', '▓', '0', '▒', '7', '⌁'];
  return Array.from(text, (char, index) => {
    if (char === ' ' || char === '?') return char;
    if (short && index % 3 !== 1) return char;
    return symbols[(char.charCodeAt(0) + index * 3) % symbols.length];
  }).join('');
}
