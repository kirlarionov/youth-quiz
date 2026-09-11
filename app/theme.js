// Temporary switch between the two colour schemes while the team picks one.
// Delete this file, its <script> tags and the [data-theme] blocks in the CSS
// once the choice is made.

const KEY = 'ym_theme';
const THEMES = ['brown', 'slate'];
const LABELS = { brown: 'Коричнева', slate: 'Сіра' };

function stored() {
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

function apply(theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(KEY, theme);
	} catch {
		// A private window keeps the choice for this page only.
	}
}

let current = THEMES.includes(stored()) ? stored() : THEMES[0];
apply(current);

const button = document.createElement('button');
button.className = 'theme-switch';
button.type = 'button';

function label() {
	button.textContent = `Тема: ${LABELS[current]}`;
	button.setAttribute('aria-label', `Тема: ${LABELS[current]}. Перемкнути`);
}

button.addEventListener('click', () => {
	current = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
	apply(current);
	label();
});

label();
document.body.append(button);
