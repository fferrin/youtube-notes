const createNoteButton = document.createElement('button');

createNoteButton.addEventListener('click', function () {alert("Para crear una nota de este video, pulsa Ctrl+Y")})

createNoteButton.className = 'ytp-size-button ytp-button';
createNoteButton.setAttribute('aria-keyshortcuts', 't');
createNoteButton.setAttribute('data-priority', '7');
createNoteButton.setAttribute('data-title-no-tooltip', 'Crear nota');
createNoteButton.setAttribute('aria-label', 'Crear nota combinación de teclas (Ctrl-Y)');
createNoteButton.setAttribute('title', 'Crear nota (Ctrl-Y)');

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('height', '100%');
svg.setAttribute('version', '1.1');
svg.setAttribute('viewBox', '0 0 36 36');
svg.setAttribute('width', '100%');

const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
useElement.setAttribute('class', 'ytp-svg-shadow');
useElement.setAttribute('xlink:href', '#ytp-id-36');

const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
pathElement.setAttribute('d', 'M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4zM17 11h-4v4h-2v-4H7V9h4V5h2v4h4z');
pathElement.setAttribute('fill', '#fff');
pathElement.setAttribute('fill-rule', 'evenodd');

svg.appendChild(useElement);
svg.appendChild(pathElement);

createNoteButton.appendChild(svg);

// Insert the new button before the first button
const controlButtons = document.querySelector('div.ytp-right-controls')
const firstButton = controlButtons.firstChild;
controlButtons.insertBefore(createNoteButton, firstButton);
