import { QUESTIONS, CUSTOM_ID, CUSTOM_TEXT_FIELD } from './questions.js';
import { subscribeToSessions, clearAllAnswers } from './store.js';
import { escapeHtml, wireImageFallbacks } from './html.js';

const panel = document.getElementById('panel');
const stage = document.getElementById('stage');

let sessions = [];
let stageOpen = false;
let index = 0;
// Set when the live feed drops: the numbers on screen stop being current and
// the operator has to be told, because nothing else would change.
let liveError = false;

// --- counting ---------------------------------------------------------------

/**
 * Tally for one question. `total` counts only the votes behind the bars;
 * free-text answers are collected separately and stay out of the percentages.
 */
function tally(question) {
	const counts = new Map(question.options.map((o) => [o.id, 0]));
	let total = 0;
	const custom = [];

	for (const session of sessions) {
		const choice = session[question.id];
		if (choice === CUSTOM_ID) {
			const text = session[CUSTOM_TEXT_FIELD(question.id)];
			if (text) custom.push(text);
			continue;
		}
		if (choice === undefined || !counts.has(choice)) continue;
		counts.set(choice, counts.get(choice) + 1);
		total += 1;
	}

	const rows = question.options
		.map((option) => ({ option, count: counts.get(option.id) }))
		.sort((a, b) => b.count - a.count);
	return { rows, total, custom };
}

const answeredCount = () => sessions.filter((s) => QUESTIONS.some((q) => s[q.id])).length;

// --- panel ------------------------------------------------------------------

function renderPanel() {
	const rows = QUESTIONS.map((question, i) => {
		const { total, custom } = tally(question);
		return `
			<button class="panel__row" data-open="${i}">
				<span>${i + 1}</span>
				<span>${escapeHtml(question.text)}</span>
				<span>${total + custom.length}</span>
			</button>`;
	}).join('');

	panel.innerHTML = `
		<h1>Екран ведучого</h1>
		${liveError ? '<div class="panel__error">Зв’язок із базою втрачено — цифри більше не оновлюються. Онови сторінку.</div>' : ''}
		<p class="panel__hint">У слайдері: стрілки — гортати, F — на весь екран, Esc — закрити.</p>
		<div class="panel__stat"><b>${answeredCount()}</b> учасників відповіли</div>
		<div class="panel__actions">
			<button class="nav-btn nav-btn--primary" data-action="open">Показати результати</button>
		</div>
		<div class="panel__list">${rows}</div>
		<button class="panel__danger" data-action="clear">Очистити результати</button>`;
}

// --- clearing ---------------------------------------------------------------

function renderConfirm() {
	// A second click on the button while the dialog is up must not stack another.
	if (document.querySelector('.modal')) return;

	const dialog = document.createElement('div');
	dialog.className = 'modal';
	dialog.innerHTML = `
		<div class="modal__box" role="dialog" aria-modal="true">
			<h2 class="modal__title">Очистити результати?</h2>
			<p class="modal__text">
				Будуть видалені відповіді всіх ${answeredCount()} учасників. Дію не можна скасувати.
			</p>
			<div class="modal__actions">
				<button class="nav-btn" data-confirm="no">Скасувати</button>
				<button class="nav-btn nav-btn--danger" data-confirm="yes">Очистити</button>
			</div>
		</div>`;

	const close = () => {
		dialog.remove();
		document.removeEventListener('keydown', onEscape);
	};

	dialog.addEventListener('click', async (event) => {
		if (event.target === dialog || event.target.closest('[data-confirm="no"]')) {
			close();
			return;
		}
		const yes = event.target.closest('[data-confirm="yes"]');
		if (!yes) return;

		yes.disabled = true;
		yes.textContent = 'Очищаю…';
		try {
			await clearAllAnswers();
			close();
		} catch (error) {
			yes.disabled = false;
			yes.textContent = 'Очистити';
			dialog.querySelector('.modal__text').textContent =
				'Не вдалося очистити: ' + (error?.message ?? 'невідома помилка');
		}
	});

	function onEscape(event) {
		if (event.key === 'Escape') close();
	}
	document.addEventListener('keydown', onEscape);

	document.body.append(dialog);
}

// --- results slider ---------------------------------------------------------

function renderStage() {
	// The panel behind keeps its own scrollbar unless it is locked while the
	// slide is up.
	document.documentElement.classList.toggle('stage-open', stageOpen);
	document.body.classList.toggle('stage-open', stageOpen);

	if (!stageOpen) {
		stage.hidden = true;
		stage.innerHTML = '';
		return;
	}

	const question = QUESTIONS[index];

	// Rows are laid out in the order the options are declared and ranked with
	// CSS `order`, so incoming answers only move numbers, never nodes.
	const items = question.options
		.map(
			(option) => `
				<div class="result" data-result="${option.id}">
					${option.image ? `<img src="${option.image}" alt="" />` : `<span class="result__emoji">${option.emoji ?? ''}</span>`}
					<div class="result__track">
						<div class="result__fill"></div>
						<div class="result__label">${escapeHtml(option.label)}</div>
					</div>
					<div class="result__value"><span></span><small></small></div>
				</div>`,
		)
		.join('');

	stage.hidden = false;
	stage.innerHTML = `
		<div class="stage__top">
			<span class="stage__count"></span>
			<button class="stage__icon" data-stage="fullscreen" title="На весь екран (F)" aria-label="На весь екран">
				${document.fullscreenElement ? '⤡' : '⤢'}
			</button>
			<button class="stage__icon" data-stage="close" title="Закрити (Esc)" aria-label="Закрити">✕</button>
		</div>
		<div class="stage__body">
			<button class="stage__arrow" data-stage="prev"${index === 0 ? ' disabled' : ''} title="Назад">‹</button>
			<div class="stage__content">
				<h2 class="stage__question">${escapeHtml(question.text)}</h2>
				<div class="results">${items}</div>
				<div class="own" hidden>
					<div class="own__title"></div>
					<div class="own__list"></div>
				</div>
			</div>
			<button class="stage__arrow" data-stage="next"${index === QUESTIONS.length - 1 ? ' disabled' : ''} title="Вперед">›</button>
		</div>`;

	wireImageFallbacks(stage);
	// Bars start collapsed and grow once painted, so each slide animates in.
	requestAnimationFrame(updateStage);
}

/**
 * Puts fresh counts into the slide already on screen. Rebuilding it instead
 * restarted every bar animation on each answer that came in.
 */
function updateStage() {
	if (!stageOpen) return;

	const question = QUESTIONS[index];
	const { rows, total, custom } = tally(question);
	const max = rows[0]?.count ?? 0;

	rows.forEach(({ option, count }, rank) => {
		const row = stage.querySelector(`[data-result="${option.id}"]`);
		if (!row) return;
		const percent = total ? Math.round((count / total) * 100) : 0;
		row.style.order = String(rank);
		row.classList.toggle('result--top', count > 0 && count === max);
		row.querySelector('.result__fill').style.width = `${max ? (count / max) * 100 : 0}%`;
		row.querySelector('.result__value span').textContent = String(count);
		row.querySelector('.result__value small').textContent = `${percent}%`;
	});

	stage.querySelector('.stage__count').textContent =
		`${index + 1} з ${QUESTIONS.length} · відповіли ${total + custom.length}` +
		(liveError ? ' · зв’язок втрачено' : '');

	// These strings were typed by participants, so they are assigned as text
	// and never interpolated into markup.
	const own = stage.querySelector('.own');
	own.hidden = custom.length === 0;
	own.querySelector('.own__title').textContent = `Свої варіанти · ${custom.length} · поза статистикою`;
	const list = own.querySelector('.own__list');
	list.textContent = '';
	for (const text of custom) {
		const item = document.createElement('span');
		item.className = 'own__item';
		item.textContent = text;
		list.append(item);
	}
}

// --- events -----------------------------------------------------------------

/** Full screen is what the projector wants; the icon follows the state. */
function toggleFullscreen() {
	const done = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
	Promise.resolve(done)
		.catch(() => {})
		.then(renderStage);
}

function openStage(at) {
	stageOpen = true;
	index = at;
	renderStage();
}

panel.addEventListener('click', (event) => {
	if (event.target.closest('[data-action="open"]')) return openStage(0);
	if (event.target.closest('[data-action="clear"]')) return renderConfirm();

	const row = event.target.closest('[data-open]');
	if (row) openStage(Number(row.dataset.open));
});

stage.addEventListener('click', (event) => {
	const button = event.target.closest('[data-stage]');
	if (!button) return;
	if (button.dataset.stage === 'fullscreen') return toggleFullscreen();
	if (button.dataset.stage === 'close') stageOpen = false;
	if (button.dataset.stage === 'prev') index = Math.max(0, index - 1);
	if (button.dataset.stage === 'next') index = Math.min(QUESTIONS.length - 1, index + 1);
	renderStage();
});

// Swipe between slides when the results are shown from a phone or tablet.
let touchStartX = null;
stage.addEventListener('touchstart', (event) => {
	touchStartX = event.changedTouches[0].clientX;
});
stage.addEventListener('touchend', (event) => {
	if (touchStartX === null) return;
	const delta = event.changedTouches[0].clientX - touchStartX;
	touchStartX = null;
	if (Math.abs(delta) < 60) return;
	index = delta < 0 ? Math.min(QUESTIONS.length - 1, index + 1) : Math.max(0, index - 1);
	renderStage();
});

document.addEventListener('keydown', (event) => {
	// The confirmation dialog has its own Escape and owns the keyboard while up.
	if (!stageOpen || document.querySelector('.modal')) return;
	const key = event.key.toLowerCase();

	if (event.key === 'Escape') stageOpen = false;
	else if (event.key === 'ArrowLeft') index = Math.max(0, index - 1);
	else if (event.key === 'ArrowRight' || event.key === ' ') index = Math.min(QUESTIONS.length - 1, index + 1);
	else if (key === 'f' || key === 'а') return toggleFullscreen();
	else return;

	event.preventDefault();
	renderStage();
});

subscribeToSessions(
	(next) => {
		sessions = next;
		liveError = false;
		renderPanel();
		updateStage();
	},
	() => {
		liveError = true;
		renderPanel();
		updateStage();
	},
);

renderPanel();
