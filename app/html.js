// Shared safety helpers for everything a participant types.
//
// Three independent layers keep typed text from ever becoming code:
//   1. sanitizeText() strips dangerous and invisible characters on input;
//   2. text reaches the DOM as textContent, never as markup (escapeHtml()
//      covers the few places where a string still has to be interpolated);
//   3. the Content-Security-Policy in the HTML pages forbids inline scripts,
//      so even a mistake in 1 and 2 could not execute anything.

const ESCAPES = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);

// Control characters, zero-width joiners and the bidirectional override
// characters used to disguise text. None of them belong in a one-line answer.
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

/**
 * Cleans one free-text answer: no markup, no invisible characters, no runaway
 * whitespace, never longer than `maxLength`.
 */
export function sanitizeText(value, maxLength) {
	return String(value ?? '')
		.normalize('NFC')
		.replace(INVISIBLE, '')
		// Angle brackets are the entry point for markup, and nothing legitimate
		// in an answer needs them.
		.replace(/[<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);
}

/**
 * Hides images that fail to load. Replaces inline onerror attributes, which a
 * strict Content-Security-Policy does not allow.
 */
export function wireImageFallbacks(container) {
	for (const image of container.querySelectorAll('img')) {
		image.addEventListener('error', () => {
			image.hidden = true;
		});
	}
}
