import { QUESTIONS, CUSTOM_ID, CUSTOM_MAX_LENGTH, CUSTOM_TEXT_FIELD } from './questions.js';
import { loadMyAnswers, saveAnswer } from './store.js';
import { escapeHtml, sanitizeText, wireImageFallbacks } from './html.js';

const root = document.getElementById('quiz');

const START_IMAGE = './images/start-image.jpg';

let answers = {};
let index = 0;
let screen = 'start'; // 'start' | 'quiz' | 'done'
let editingCustom = false;
let customDraft = '';
// What the answer was before the free-text box was opened, so that closing it
// empty puts the previous choice back instead of leaving the question blank.
let answerBeforeCustom = null;

const CUSTOM_PLACEHOLDER = 'Свій варіант';

// Images of the next question are fetched while the current one is on screen,
// so switching does not flash empty cards on a slow connection.
function preload(questionIndex) {
	const question = QUESTIONS[questionIndex];
	if (!question) return;
	for (const option of question.options) {
		if (option.image) new Image().src = option.image;
	}
}

const hasStarted = () => QUESTIONS.some((q) => answers[q.id]);

/** Where "begin" should land: the first unanswered question, or the thank-you. */
function resumePoint() {
	const firstUnanswered = QUESTIONS.findIndex((q) => !answers[q.id]);
	if (firstUnanswered === -1) return { screen: 'done', index: QUESTIONS.length - 1 };
	return { screen: 'quiz', index: firstUnanswered };
}

function renderStart() {
	root.innerHTML = `
		<div class="start">
			<div class="start__backdrop"></div>
			<img class="start__image" src="${START_IMAGE}" alt="" />
			<button class="start__cta" data-nav="begin">
				${hasStarted() ? 'Продовжити' : 'Почати'}
			</button>
		</div>`;

	root.querySelector('.start__backdrop').style.backgroundImage = `url("${START_IMAGE}")`;
	wireImageFallbacks(root);
	preload(0);
}

function optionMarkup(option, selected) {
	// A photo when the question has them, the emoji otherwise.
	const visual = option.image
		? `<img class="option__image" src="${option.image}" alt="" loading="lazy" />`
		: `<span class="option__emoji">${option.emoji ?? ''}</span>`;
	return `
		<button class="option${selected ? ' option--selected' : ''}" data-option="${option.id}" aria-pressed="${selected}">
			${visual}
			<span class="option__label">${escapeHtml(option.label)}</span>
		</button>`;
}

// Long answers do not fit a two-column grid: they get one full-width row each.
const LONG_LABEL = 24;
const isLongForm = (question) =>
	!question.options.some((o) => o.image) && question.options.some((o) => o.label.length > LONG_LABEL);

function customMarkup(question) {
	const chosen = answers[question.id] === CUSTOM_ID;

	if (editingCustom) {
		return `
			<div class="custom custom--editing">
				<input
					class="custom__input"
					type="text"
					maxlength="${CUSTOM_MAX_LENGTH}"
					placeholder="Напиши свій варіант"
					autocomplete="off"
					enterkeyhint="done" />
				<span class="custom__counter"></span>
			</div>`;
	}

	return `
		<button class="custom custom__toggle${chosen ? ' custom--chosen' : ''}" data-custom="open">
			<span class="custom__icon">✎</span>
			<span class="custom__text"></span>
		</button>`;
}

function renderQuestion() {
	const question = QUESTIONS[index];
	const answered = answers[question.id];
	const isLast = index === QUESTIONS.length - 1;
	// While the free-text box is open, the answer is whatever is typed in it.
	const ready = editingCustom
		? customDraft.trim().length > 0 || Boolean(answerBeforeCustom?.option)
		: Boolean(answered);

	root.innerHTML = `
		<div class="quiz__progress">
			<span>${index + 1} / ${QUESTIONS.length}</span>
			<div class="quiz__bar"><span></span></div>
		</div>
		<h1 class="quiz__question">${escapeHtml(question.text)}</h1>
		<div class="options${isLongForm(question) ? ' options--list' : ''}">
			${question.options.map((o) => optionMarkup(o, o.id === answered)).join('')}
		</div>
		${customMarkup(question)}
		<div class="quiz__nav">
			<button class="nav-btn" data-nav="prev"${index === 0 ? ' disabled' : ''}>Назад</button>
			<button class="nav-btn nav-btn--primary" data-nav="next"${ready ? '' : ' disabled'}>
				${isLast ? 'Готово' : 'Далі'}
			</button>
		</div>`;

	root.querySelector('.quiz__bar span').style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;

	// User text is assigned, never interpolated: it can only ever be text.
	const customText = answers[CUSTOM_TEXT_FIELD(question.id)] || '';
	if (editingCustom) {
		const input = root.querySelector('.custom__input');
		input.value = customDraft;
		root.querySelector('.custom__counter').textContent = `${customDraft.length} / ${CUSTOM_MAX_LENGTH}`;
		input.focus();
		input.setSelectionRange(input.value.length, input.value.length);
	} else {
		root.querySelector('.custom__text').textContent =
			answered === CUSTOM_ID && customText ? customText : CUSTOM_PLACEHOLDER;
	}

	wireImageFallbacks(root);
	preload(index + 1);
}

function renderDone() {
	const answered = QUESTIONS.filter((q) => answers[q.id]).length;
	root.innerHTML = `
		<div class="done">
			<h1>Дякуємо!</h1>
			<p>Відповіді прийнято: ${answered} з ${QUESTIONS.length}.<br />Результати покажемо на екрані.</p>
			<button class="nav-btn" data-nav="back">Повернутися і змінити</button>
		</div>`;
}

function render() {
	if (screen === 'start') renderStart();
	else if (screen === 'done') renderDone();
	else renderQuestion();
}

// A card lights up the moment it is tapped, so a write that never lands would
// be invisible. Firestore does not reject an offline write — it queues it and
// the promise simply never settles — so silence is what has to be watched for.
const SAVE_TIMEOUT = 10000;

let unsaved = 0;
let saveWarning = null;

function reportSave() {
	if (unsaved > 0 && !saveWarning) {
		saveWarning = document.createElement('div');
		saveWarning.className = 'save-error';
		saveWarning.setAttribute('role', 'status');
		saveWarning.textContent = 'Відповіді не зберігаються. Перевір інтернет.';
		document.body.append(saveWarning);
		document.body.classList.add('has-save-error');
	} else if (unsaved === 0 && saveWarning) {
		saveWarning.remove();
		saveWarning = null;
		document.body.classList.remove('has-save-error');
	}
}

/** Warns when a write is neither confirmed within SAVE_TIMEOUT nor rejected. */
function trackSave(write) {
	const timer = setTimeout(() => {
		unsaved += 1;
		reportSave();
	}, SAVE_TIMEOUT);

	const settle = (failed) => {
		clearTimeout(timer);
		// Writes reach the server in order, so one confirmation means the queue
		// behind it went through as well.
		unsaved = failed ? unsaved + 1 : 0;
		reportSave();
	};
	write.then(() => settle(false), () => settle(true));
}

function record(optionId, text = '') {
	const question = QUESTIONS[index];
	answers[question.id] = optionId;
	answers[CUSTOM_TEXT_FIELD(question.id)] = text;
	trackSave(saveAnswer(question.id, optionId, text));
}

/**
 * Writes down whatever is in the free-text box and closes it. Called when the
 * person leaves the question, so there is no separate "save" button.
 * An empty box means no answer at all.
 */
function commitCustom() {
	if (!editingCustom) return;
	editingCustom = false;
	customDraft = '';

	const questionId = QUESTIONS[index].id;
	const value = sanitizeText(root.querySelector('.custom__input')?.value, CUSTOM_MAX_LENGTH);
	if (value) {
		record(CUSTOM_ID, value);
	} else {
		// Nothing was typed: restore the previous answer. A question must never
		// end up without one.
		answers[questionId] = answerBeforeCustom?.option ?? '';
		answers[CUSTOM_TEXT_FIELD(questionId)] = answerBeforeCustom?.text ?? '';
	}
	answerBeforeCustom = null;
}

root.addEventListener('click', (event) => {
	const option = event.target.closest('[data-option]');
	if (option) {
		// Picking a card drops any free text that was there before.
		const wasEditing = editingCustom;
		editingCustom = false;
		customDraft = '';
		answerBeforeCustom = null;
		record(option.dataset.option, '');

		// Closing the text field changes the markup, so that case needs a
		// full redraw. Otherwise update in place: rebuilding every card just
		// to move a highlight made the whole list blink.
		if (wasEditing) {
			render();
			return;
		}
		for (const card of root.querySelectorAll('[data-option]')) {
			card.classList.toggle('option--selected', card === option);
			card.setAttribute('aria-pressed', String(card === option));
		}
		const toggle = root.querySelector('.custom__toggle');
		toggle.classList.remove('custom--chosen');
		toggle.querySelector('.custom__text').textContent = CUSTOM_PLACEHOLDER;
		root.querySelector('[data-nav="next"]').disabled = false;
		return;
	}

	const custom = event.target.closest('[data-custom]');
	if (custom) {
		// Opening the box makes it the answer straight away, so the picture
		// cards stop showing a selection.
		const questionId = QUESTIONS[index].id;
		editingCustom = true;
		answerBeforeCustom = {
			option: answers[questionId] || '',
			text: answers[CUSTOM_TEXT_FIELD(questionId)] || '',
		};
		customDraft = answerBeforeCustom.text;
		answers[questionId] = CUSTOM_ID;
		render();
		return;
	}

	const nav = event.target.closest('[data-nav]');
	if (!nav) return;

	commitCustom();
	if (nav.dataset.nav === 'begin') ({ screen, index } = resumePoint());
	if (nav.dataset.nav === 'prev') index = Math.max(0, index - 1);
	if (nav.dataset.nav === 'next') {
		if (index === QUESTIONS.length - 1) screen = 'done';
		else index += 1;
	}
	if (nav.dataset.nav === 'back') {
		screen = 'quiz';
		index = QUESTIONS.length - 1;
	}
	window.scrollTo(0, 0);
	render();
});

// Counter and the state of "Далі" follow every keystroke, without re-rendering
// the field the person is typing in.
root.addEventListener('input', (event) => {
	if (!event.target.matches('.custom__input')) return;
	customDraft = event.target.value;
	root.querySelector('.custom__counter').textContent = `${customDraft.length} / ${CUSTOM_MAX_LENGTH}`;
	root.querySelector('[data-nav="next"]').disabled =
		customDraft.trim().length === 0 && !answerBeforeCustom?.option;
});

root.addEventListener('keydown', (event) => {
	if (!event.target.matches('.custom__input')) return;
	if (event.key === 'Enter' || event.key === 'Escape') {
		commitCustom();
		render();
	}
});

// The splash always comes first; loading previous answers only decides whether
// its button says "Почати" or "Продовжити", and where it leads. Someone who
// taps through faster than the network answers may already have picked
// something by now, and that wins over what the database returns.
loadMyAnswers()
	.then((saved) => {
		answers = { ...saved, ...answers };
		render();
	})
	.catch(() => {
		// No previous answers to restore: the quiz simply starts empty.
	});

render();
