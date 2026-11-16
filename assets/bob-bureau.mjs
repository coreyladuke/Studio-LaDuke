const cases = {
  plans: {
    subject: 'Regarding the plans you made while feeling unusually hopeful',
    opinions: [
      'Canceling plans is a plan. Put on your good pajamas so it feels official.',
      'You may go home early. The chair you leave behind is qualified to cover your shift.',
      'The group chat can survive one fewer thumbs-up. Some ecosystems thrive after a disturbance.',
      'Tell them you have a prior commitment. The prior commitment is to sitting down.',
      'A rain check is a perfectly respectable piece of weather paperwork.',
      'If you agreed before you checked the calendar, blame the calendar for keeping secrets.',
      'Your absence has been approved. Your extremely detailed explanation has been returned unread.',
      'If you say “next time,” leave the next time somewhere it can breathe.'
    ]
  },
  laundry: {
    subject: 'Regarding the laundry that has become load-bearing',
    opinions: [
      'The chair is now a closet. Please update your floor plan accordingly.',
      'Start with one sock. Its partner will file a missing-person report and the process will move along.',
      'A pile with a lamp beside it is an installation. Leave the gallery before anyone asks what it means.',
      'Put the clothes in the machine. Folding is a separate department and currently at lunch.',
      'One clean towel will change your outlook. The rest of the towels can hear about it later.',
      'You have every right to choose a laundry day. The socks request that you choose one that exists.',
      'The dryer has been advised that stealing socks is embarrassing behavior for an appliance.',
      'Sort by color if you must. “Good enough to wear tomorrow” is also a color.'
    ]
  },
  project: {
    subject: 'Regarding the project you’ve been about to start',
    opinions: [
      'Make the first version five minutes long. You can give it a name once it earns one.',
      'Take one tool out. If it’s the wrong tool, congratulations, you’ve already made a decision.',
      'Put the ugly first draft where you can see it. It is entitled to daylight.',
      'You have my permission to start in the middle. The beginning can catch up on its own time.',
      'Write the next actual move down. “Become brilliant” is a wish and an unworkable instruction.',
      'Finish the little part with the least drama. The rest of the project hates being shown up.',
      'Leave a rough edge so tomorrow you know where to hold it.',
      'The empty page has had its chance. Give it one line and see how it handles the responsibility.'
    ]
  },
  meeting: {
    subject: 'Regarding the meeting that could have been an email',
    opinions: [
      'Release everyone early. They’ll assume you had something important to do and remember you fondly.',
      'If the agenda says “align,” water the plant while they figure out what goes where.',
      'Send the email. Anyone who demands a meeting about it has volunteered to take the minutes.',
      'A meeting with no decision is a weather event. Look out the window and let it pass.',
      'If you hear “circle back,” check whether the door can be reached in a straight line.',
      'Put the question in the first sentence. There are people growing old in paragraph three.',
      'The meeting may continue once someone can say what they came in to accomplish.',
      'Please remove “quick” from the title. It has done nothing to deserve this association.'
    ]
  }
};

export function readVerdict(hash) {
  const match = /^#case=([a-z]+)-(\d)$/.exec(hash);
  if (!match || !Object.hasOwn(cases, match[1])) return null;
  const [, topic, index] = match;
  return cases[topic].opinions[index] ? { topic, index: Number(index) } : null;
}

export function describeVerdict({ topic, index }) {
  const { subject, opinions } = cases[topic];
  return { number: `${topic.toUpperCase()}-${String(index + 1).padStart(2, '0')}`, subject, text: opinions[index] };
}

function chooseVerdict(topic, previous, random = Math.random) {
  const count = cases[topic].opinions.length;
  const otherIndex = previous?.topic === topic ? previous.index : -1;
  let index = Math.floor(random() * (count - Number(otherIndex >= 0)));
  if (otherIndex >= 0 && index >= otherIndex) index += 1;
  return { topic, index };
}

function writeWrapped(ctx, message, width, y, lineHeight) {
  const lines = [];
  let line = '';
  for (const word of message.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  lines.forEach((text, index) => ctx.fillText(text, 600, y + index * lineHeight));
  return lines.length;
}

function makeCertificate(doc, verdict, art) {
  const canvas = doc.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 950;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f6e6c5';
  ctx.fillRect(0, 0, 1200, 950);
  const paper = ctx.createRadialGradient(560, 380, 130, 600, 480, 720);
  paper.addColorStop(0, '#fff6dd');
  paper.addColorStop(1, '#c39b6299');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, 1200, 950);
  ctx.strokeStyle = '#696047';
  ctx.lineWidth = 3;
  ctx.strokeRect(29, 29, 1142, 892);
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 870);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#465031';
  ctx.font = '24px monospace';
  ctx.fillText(`BOB’S BUREAU OF UNSOLICITED OPINIONS  /  ${verdict.number}`, 600, 96);
  if (art.complete && art.naturalWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(600, 229, 107, 100, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(art, 616, 211, 456, 436, 492, 127, 216, 204);
    ctx.restore();
  }
  ctx.fillStyle = '#24271b';
  ctx.font = 'bold 60px Georgia, serif';
  ctx.fillText('Certificate of Unwanted Advice', 600, 407);
  ctx.fillStyle = '#465031';
  ctx.font = '27px Georgia, serif';
  writeWrapped(ctx, verdict.subject, 960, 470, 35);
  ctx.fillStyle = '#24271b';
  ctx.font = 'italic 48px Georgia, serif';
  const lines = writeWrapped(ctx, `“${verdict.text}”`, 910, 552, 58);
  const signedAt = Math.max(753, 552 + lines * 58 + 19);
  ctx.fillStyle = '#842d24';
  ctx.font = 'bold 27px Georgia, serif';
  ctx.fillText('Bob, acting without permission', 600, signedAt);
  ctx.font = '23px Georgia, serif';
  ctx.fillText('Studio LaDuke · Ketchikan, Alaska · studioladuke.com', 600, 878);
  return canvas;
}

function openBureau(doc, win) {
  const form = doc.getElementById('caseFile');
  const result = doc.getElementById('result');
  const heading = doc.getElementById('resultTitle');
  const notice = doc.getElementById('notice');
  const fallback = doc.getElementById('shareFallback');
  const shareLink = doc.getElementById('shareLink');
  const art = doc.getElementById('bobInk');
  const save = doc.getElementById('save');
  let current = null;
  let previous = null;

  function show(next, focus = true) {
    current = next;
    form.hidden = Boolean(current);
    result.hidden = !current;
    fallback.hidden = true;
    notice.textContent = '';
    if (current) {
      previous = current;
      const verdict = describeVerdict(current);
      doc.getElementById('caseNumber').textContent = `Case No. ${verdict.number}`;
      doc.getElementById('subject').textContent = verdict.subject;
      doc.getElementById('verdict').textContent = `“${verdict.text}”`;
      if (focus) heading.focus();
    } else if (focus) {
      form.querySelector('input:checked, input[type="radio"]').focus();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const topic = new win.FormData(form).get('topic');
    if (!Object.hasOwn(cases, topic)) return;
    const next = chooseVerdict(topic, previous);
    showVerdict(next);
  });
  win.addEventListener('hashchange', () => {
    const next = readVerdict(win.location.hash);
    if (next?.topic !== current?.topic || next?.index !== current?.index) show(next);
  });
  function showVerdict(next) {
    win.location.hash = `case=${next.topic}-${next.index}`;
    show(next);
  }

  doc.getElementById('again').addEventListener('click', () => {
    if (current) showVerdict(chooseVerdict(current.topic, current));
  });
  doc.getElementById('change-topic').addEventListener('click', () => {
    win.location.hash = '';
    show(null);
  });

  doc.getElementById('share').addEventListener('click', async () => {
    const verdict = describeVerdict(current);
    const url = win.location.href;
    if (win.navigator.share) {
      try {
        await win.navigator.share({ title: 'Certificate of Unwanted Advice', text: verdict.text, url });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    try {
      await win.navigator.clipboard.writeText(url);
      notice.textContent = 'Verdict link copied.';
    } catch {
      shareLink.value = url;
      fallback.hidden = false;
      shareLink.select();
    }
  });

  save.addEventListener('click', async () => {
    const verdict = describeVerdict(current);
    save.disabled = true;
    notice.textContent = '';
    try {
      const canvas = makeCertificate(doc, verdict, art);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG unavailable');
      const file = new win.File([blob], `bobs-bureau-${verdict.number.toLowerCase()}.png`, { type: 'image/png' });
      const url = win.URL.createObjectURL(file);
      const download = doc.createElement('a');
      download.href = url;
      download.download = file.name;
      doc.body.append(download);
      download.click();
      download.remove();
      win.setTimeout(() => win.URL.revokeObjectURL(url), 30_000);
      notice.textContent = 'Certificate download ready.';
    } catch {
      notice.textContent = 'The certificate download failed. You can still share the verdict link.';
    } finally {
      save.disabled = false;
    }
  });
  show(readVerdict(win.location.hash), false);
}

if (typeof document !== 'undefined') openBureau(document, window);
