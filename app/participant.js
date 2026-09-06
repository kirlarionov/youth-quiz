import { QUESTIONS, CUSTOM_ID, CUSTOM_MAX_LENGTH, CUSTOM_TEXT_FIELD } from './questions.js';
import { loadMyAnswers, saveAnswer } from './store.js';
import { sanitizeText, wireImageFallbacks } from './html.js';

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
	const image = option.image
		? `<img class="option__image" src="${option.image}" alt="" loading="lazy" />`
		: '';
	return `
		<button class="option${selected ? ' option--selected' : ''}" data-option="${option.id}">
			${image}
			<span class="option__label">${option.label}</span>
		</button>`;
}

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
		<h1 class="quiz__question">${question.text}</h1>
		<div class="options">${question.options.map((o) => optionMarkup(o, o.id === answered)).join('')}</div>
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
			answered === CUSTOM_ID && customText ? customText : 'Свій варіант';
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

function record(optionId, text = '') {
	const question = QUESTIONS[index];
	answers[question.id] = optionId;
	answers[CUSTOM_TEXT_FIELD(question.id)] = text;
	// Fire-and-forget: the UI already reflects the choice, and a failed write
	// is retried by Firestore's own offline queue.
	saveAnswer(question.id, optionId, text);
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
		// Picking a picture card drops any free text that was there before.
		editingCustom = false;
		customDraft = '';
		answerBeforeCustom = null;
		record(option.dataset.option, '');
		render();
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
// its button says "Почати" or "Продовжити", and where it leads.
loadMyAnswers().then((saved) => {
	answers = saved;
	if (screen === 'start') render();
});

render();
