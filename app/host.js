import { QUESTIONS, CUSTOM_ID, CUSTOM_TEXT_FIELD } from './questions.js';
import { subscribeToSessions, clearAllAnswers } from './store.js';
import { wireImageFallbacks } from './html.js';

const panel = document.getElementById('panel');
const stage = document.getElementById('stage');

let sessions = [];
let stageOpen = false;
let index = 0;

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
				<span>${question.text}</span>
				<span>${total + custom.length}</span>
			</button>`;
	}).join('');

	panel.innerHTML = `
		<h1>Екран ведучого</h1>
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

	dialog.addEventListener('click', async (event) => {
		if (event.target === dialog || event.target.closest('[data-confirm="no"]')) {
			dialog.remove();
			return;
		}
		const yes = event.target.closest('[data-confirm="yes"]');
		if (!yes) return;

		yes.disabled = true;
		yes.textContent = 'Очищаю…';
		try {
			await clearAllAnswers();
			dialog.remove();
		} catch (error) {
			yes.disabled = false;
			yes.textContent = 'Очистити';
			dialog.querySelector('.modal__text').textContent =
				'Не вдалося очистити: ' + (error?.message ?? 'невідома помилка');
		}
	});

	document.body.append(dialog);
}

// --- results slider ---------------------------------------------------------

function renderStage() {
	if (!stageOpen) {
		stage.hidden = true;
		stage.innerHTML = '';
		return;
	}

	const question = QUESTIONS[index];
	const { rows, total, custom } = tally(question);
	const max = rows[0]?.count ?? 0;

	const items = rows
		.map(({ option, count }) => {
			const percent = total ? Math.round((count / total) * 100) : 0;
			const width = max ? (count / max) * 100 : 0;
			return `
				<div class="result${count === max && count > 0 ? ' result--top' : ''}">
					${option.image ? `<img src="${option.image}" alt="" />` : '<div></div>'}
					<div class="result__track">
						<div class="result__fill" data-width="${width}"></div>
						<div class="result__label">${option.label}</div>
					</div>
					<div class="result__value">${count}<small>${percent}%</small></div>
				</div>`;
		})
		.join('');

	// The list itself is filled from the DOM below, never interpolated here:
	// these strings were typed by participants.
	const customBlock = custom.length
		? `<div class="own">
				<div class="own__title">Свої варіанти · ${custom.length} · поза статистикою</div>
				<div class="own__list"></div>
			</div>`
		: '';

	stage.hidden = false;
	stage.innerHTML = `
		<div class="stage__top">
			<span>${index + 1} з ${QUESTIONS.length} · відповіли ${total + custom.length}</span>
			<button class="stage__close" data-stage="close" title="Закрити (Esc)">✕</button>
		</div>
		<div class="stage__body">
			<button class="stage__arrow" data-stage="prev"${index === 0 ? ' disabled' : ''} title="Назад">‹</button>
			<div class="stage__content">
				<h2 class="stage__question">${question.text}</h2>
				<div class="results">${items}</div>
				${customBlock}
			</div>
			<button class="stage__arrow" data-stage="next"${index === QUESTIONS.length - 1 ? ' disabled' : ''} title="Вперед">›</button>
		</div>`;

	const list = stage.querySelector('.own__list');
	for (const text of custom) {
		const item = document.createElement('span');
		item.className = 'own__item';
		item.textContent = text;
		list.append(item);
	}

	wireImageFallbacks(stage);

	// Bars start collapsed and grow once painted, so each slide animates in.
	requestAnimationFrame(() => {
		stage.querySelectorAll('.result__fill').forEach((el) => {
			el.style.width = `${el.dataset.width}%`;
		});
	});
}

// --- events -----------------------------------------------------------------

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
	if (!stageOpen) return;
	const key = event.key.toLowerCase();

	if (event.key === 'Escape') stageOpen = false;
	else if (event.key === 'ArrowLeft') index = Math.max(0, index - 1);
	else if (event.key === 'ArrowRight' || event.key === ' ') index = Math.min(QUESTIONS.length - 1, index + 1);
	else if (key === 'f' || key === 'а') {
		if (document.fullscreenElement) document.exitFullscreen();
		else document.documentElement.requestFullscreen();
		return;
	} else return;

	event.preventDefault();
	renderStage();
});

subscribeToSessions((next) => {
	sessions = next;
	renderPanel();
	if (stageOpen) renderStage();
});

renderPanel();
