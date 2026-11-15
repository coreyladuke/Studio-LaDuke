'use strict';

const closet = document.getElementById('closet');
const light = document.getElementById('light');
const actions = document.getElementById('shelf-actions');

light.addEventListener('click', () => {
  const dark = closet.classList.toggle('dark');
  light.setAttribute('aria-pressed', String(!dark));
});

for (const box of actions.querySelectorAll('[data-case]')) {
  const view = document.getElementById(box.dataset.case);
  box.addEventListener('click', () => {
    if (!view.open) view.showModal();
  });
  view.addEventListener('close', () => box.focus({ preventScroll: true }));
}

actions.hidden = false;

if (location.hash === '#shark-quest' || location.hash === '#folders') {
  actions.querySelector('[data-case="shark"]').click();
}

const tag = document.getElementById('read-tag');
const story = document.getElementById('tag-story');
tag.addEventListener('click', () => {
  story.hidden = !story.hidden;
  document.getElementById('tag-hint').hidden = !story.hidden;
  tag.setAttribute('aria-expanded', String(!story.hidden));
  if (!story.hidden) story.focus();
});
