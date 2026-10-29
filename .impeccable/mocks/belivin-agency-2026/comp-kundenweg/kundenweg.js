// Kundenweg: lanes carry the customer through the page. In the hero the four channel
// lanes run into the booking button, the mechanism lane passes four nodes into the
// verdict, the closing lane ends in the last button, and on desktop one spine fills
// down the page while the visitor scrolls.
(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const svgElement = (name, attributes) => {
    const element = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    return element;
  };

  const point = (rect, origin, x = 0.5, y = 0.5) => ({
    x: rect.left + rect.width * x - origin.left,
    y: rect.top + rect.height * y - origin.top,
  });

  // One lane: a path plus, unless motion is reduced, a pulse travelling along it.
  const lane = (svg, d, { seconds, delay = 0 }) => {
    svg.append(svgElement('path', { class: 'lane', d }));
    if (reduceMotion.matches) return;
    const begin = `${delay}s`;
    const pulse = svgElement('circle', { class: 'pulse', r: '4.5', opacity: '0' });
    pulse.append(
      svgElement('animateMotion', {
        path: d,
        dur: `${seconds}s`,
        begin,
        repeatCount: 'indefinite',
        calcMode: 'spline',
        keyTimes: '0;1',
        keyPoints: '0;1',
        keySplines: '0.45 0 0.25 1',
      }),
      svgElement('animate', {
        attributeName: 'opacity',
        values: '0;1;1;0',
        keyTimes: '0;0.1;0.88;1',
        dur: `${seconds}s`,
        begin,
        repeatCount: 'indefinite',
      }),
    );
    svg.append(pulse);
  };

  const prepare = (svg, box) => {
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.replaceChildren();
  };

  const drawHero = () => {
    const band = document.querySelector('[data-converge]');
    if (!band) return;
    const svg = band.querySelector('.lanes');
    const box = band.getBoundingClientRect();
    const end = point(band.querySelector('[data-converge-target]').getBoundingClientRect(), box, 0.5, 0);
    prepare(svg, box);
    band.querySelectorAll('[data-channel]').forEach((channel, index) => {
      const start = point(channel.getBoundingClientRect(), box, 0.5, 1);
      start.y -= 5;
      const bend = (end.y - start.y) * 0.58;
      const d = `M ${start.x} ${start.y} C ${start.x} ${start.y + bend}, ${end.x} ${end.y - bend}, ${end.x} ${end.y}`;
      lane(svg, d, { seconds: 3.6, delay: index * 0.9 });
    });
  };

  const drawChain = () => {
    const section = document.querySelector('[data-chain]');
    if (!section) return;
    const svg = section.querySelector('.chain-lane');
    const verdict = section.querySelector('[data-chain-end]');
    const box = section.getBoundingClientRect();
    const nodeElements = [...section.querySelectorAll('[data-chain-node]')];
    const nodes = nodeElements.map(node => point(node.getBoundingClientRect(), box));
    const last = nodes.at(-1);
    const verdictBox = verdict.getBoundingClientRect();
    const radius = 24;
    let end;
    let tail;
    if (verdictBox.left - box.left > last.x + 40) {
      // Side by side: leave the last node downwards, run beneath its line, then rise
      // between the columns into the verdict's first line, like a trace on a board.
      const heading = verdict.querySelector('h2');
      const turn = nodeElements.at(-1).parentElement.getBoundingClientRect().bottom - box.top + 22;
      end = {
        x: verdictBox.left - box.left - 24,
        y: heading.getBoundingClientRect().top - box.top + parseFloat(getComputedStyle(heading).lineHeight) / 2,
      };
      tail = ` L ${last.x} ${turn - radius} Q ${last.x} ${turn}, ${last.x + radius} ${turn}`;
      tail += end.y < turn - radius
        ? ` L ${end.x - radius} ${turn} Q ${end.x} ${turn}, ${end.x} ${turn - radius} L ${end.x} ${end.y}`
        : ` L ${end.x} ${turn}`;
      if (end.y >= turn - radius) end.y = turn;
    } else {
      // Stacked: continue straight down into the verdict.
      end = { x: last.x, y: verdictBox.top - box.top - 16 };
      tail = ` L ${end.x} ${end.y}`;
    }
    const d = `M ${nodes[0].x} ${nodes[0].y}${nodes.slice(1).map(node => ` L ${node.x} ${node.y}`).join('')}${tail}`;
    prepare(svg, box);
    lane(svg, d, { seconds: 5.2 });
    svg.append(svgElement('circle', { class: 'lane-end', cx: end.x, cy: end.y, r: '5' }));
  };

  const drawFinale = () => {
    const section = document.querySelector('[data-finale]');
    if (!section) return;
    const svg = section.querySelector('.finale-lane');
    const box = section.getBoundingClientRect();
    const end = point(section.querySelector('[data-finale-target]').getBoundingClientRect(), box, 0.5, 0);
    const spine = document.querySelector('.spine');
    const spineBox = spine && getComputedStyle(spine).display !== 'none' ? spine.getBoundingClientRect() : null;
    const startX = spineBox ? spineBox.left + spineBox.width / 2 - box.left : 6;
    const turn = end.y - 40;
    const d = `M ${startX} 0 L ${startX} ${turn} C ${startX} ${end.y - 8}, ${end.x} ${turn + 8}, ${end.x} ${end.y}`;
    prepare(svg, box);
    lane(svg, d, { seconds: 4.4 });
  };

  const drawAll = () => {
    drawHero();
    drawChain();
    drawFinale();
  };

  const path = document.querySelector('.path');
  const spineFill = document.querySelector('.spine > span');
  const barFill = document.querySelector('.progress > span');
  const nodes = [...document.querySelectorAll('[data-node]')];

  const trackPath = () => {
    const line = innerHeight * 0.55;
    if (path && spineFill) {
      const bounds = path.getBoundingClientRect();
      spineFill.style.height = `${Math.min(Math.max(line - bounds.top, 0), bounds.height)}px`;
    }
    for (const node of nodes) node.classList.toggle('is-lit', node.getBoundingClientRect().top < line);
    if (barFill) {
      const range = document.documentElement.scrollHeight - innerHeight;
      barFill.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
    }
  };

  let frame = 0;
  const schedule = task => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(task);
  };

  // Each lane redraws only when its own section changes size, so a collapsing mobile
  // address bar or a full-page capture never leaves a lane behind its nodes.
  const lanes = [
    ['[data-converge]', drawHero],
    ['[data-chain]', drawChain],
    ['[data-finale]', drawFinale],
  ];
  const watchLanes = () => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const draw = lanes.find(([selector]) => entry.target.matches(selector))?.[1];
        if (draw) requestAnimationFrame(draw);
      }
    });
    for (const [selector] of lanes) {
      const section = document.querySelector(selector);
      if (section) observer.observe(section);
    }
  };

  document.fonts.ready.then(() => {
    drawAll();
    trackPath();
    watchLanes();
    document.documentElement.classList.add('is-ready');
  });
  addEventListener('scroll', () => schedule(trackPath), { passive: true });
  addEventListener('resize', () => schedule(trackPath));
  reduceMotion.addEventListener('change', drawAll);
})();
