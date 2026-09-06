// Data access layer. Everything above this file is unaware of where answers live.
//
// Flip MOCK to false once the Firebase config is filled in — nothing else
// in the codebase needs to change.

import { QUESTIONS, CUSTOM_ID, CUSTOM_TEXT_FIELD } from './questions.js';

const MOCK = false;

const SESSION_KEY = 'ym_session_id';
const MY_ANSWERS_KEY = 'ym_mock_my_answers';
const CROWD_KEY = 'ym_mock_crowd_v2';
const MOCK_CROWD_SIZE = 27;

// Sample free-text answers, so the results slide has something to show there.
const MOCK_CUSTOM_TEXTS = [
	'Залежить від настрою',
	'Все одразу, чому ні?',
	'Жодного з перелічених',
	'Вдома з книжкою',
	'Ще не визначився',
	'З друзями будь-де',
];

// --- session id -------------------------------------------------------------

export function getMySessionId() {
	let id = localStorage.getItem(SESSION_KEY);
	if (!id) {
		id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
		localStorage.setItem(SESSION_KEY, id);
	}
	return id;
}

// --- mock implementation ----------------------------------------------------

const listeners = new Set();

function readJson(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key)) ?? fallback;
	} catch {
		return fallback;
	}
}

// A stable fake audience so the results slider has something to show.
// Answers are skewed rather than uniform, otherwise every bar looks the same.
function mockCrowd() {
	const existing = readJson(CROWD_KEY, null);
	if (existing) return existing;

	const crowd = [];
	for (let i = 0; i < MOCK_CROWD_SIZE; i++) {
		const answers = {};
		for (const question of QUESTIONS) {
			// Skip a few answers so the answered count is not always the full crowd.
			if (Math.random() < 0.12) continue;

			if (Math.random() < 0.08) {
				answers[question.id] = CUSTOM_ID;
				answers[CUSTOM_TEXT_FIELD(question.id)] =
					MOCK_CUSTOM_TEXTS[Math.floor(Math.random() * MOCK_CUSTOM_TEXTS.length)];
				continue;
			}
			const weights = question.options.map((_, index) => 1 / (index + 1));
			const total = weights.reduce((a, b) => a + b, 0);
			let roll = Math.random() * total;
			let picked = question.options[0].id;
			for (let k = 0; k < question.options.length; k++) {
				roll -= weights[k];
				if (roll <= 0) {
					picked = question.options[k].id;
					break;
				}
			}
			answers[question.id] = picked;
		}
		crowd.push({ id: `mock-${i}`, ...answers });
	}
	localStorage.setItem(CROWD_KEY, JSON.stringify(crowd));
	return crowd;
}

function mockSessions() {
	return [...mockCrowd(), { id: getMySessionId(), ...readJson(MY_ANSWERS_KEY, {}) }];
}

function notifyMock() {
	const sessions = mockSessions();
	listeners.forEach((cb) => cb(sessions));
}

// --- firebase implementation ------------------------------------------------

// Imported lazily so mock mode never touches the network and an empty config
// never breaks local development.
let firebasePromise = null;
const firebase = () => (firebasePromise ??= import('./firebase.js'));

// --- public api -------------------------------------------------------------

/** Answers of the current participant: { q1: 'mountains', ... } */
export async function loadMyAnswers() {
	if (MOCK) return readJson(MY_ANSWERS_KEY, {});
	const { loadSession } = await firebase();
	return loadSession(getMySessionId());
}

/**
 * Records or replaces one answer. Safe to call repeatedly.
 * `text` carries the free-text answer; pass '' to clear a previous one.
 */
export async function saveAnswer(questionId, optionId, text = '') {
	if (MOCK) {
		const answers = readJson(MY_ANSWERS_KEY, {});
		answers[questionId] = optionId;
		answers[CUSTOM_TEXT_FIELD(questionId)] = text;
		localStorage.setItem(MY_ANSWERS_KEY, JSON.stringify(answers));
		notifyMock();
		return;
	}
	const { writeAnswer } = await firebase();
	await writeAnswer(getMySessionId(), questionId, optionId, text);
}

/**
 * Live feed of every session, for the operator screen.
 * Calls back with an array of answer objects. Returns an unsubscribe function.
 */
export function subscribeToSessions(callback) {
	if (MOCK) {
		listeners.add(callback);
		callback(mockSessions());
		return () => listeners.delete(callback);
	}
	let unsubscribe = () => {};
	let cancelled = false;
	firebase().then(({ watchSessions }) => {
		if (cancelled) return;
		unsubscribe = watchSessions(callback);
	});
	return () => {
		cancelled = true;
		unsubscribe();
	};
}

/**
 * Erases every answer of every participant. Used by the operator between runs.
 * Returns how many sessions were removed.
 */
export async function clearAllAnswers() {
	if (MOCK) {
		const removed = mockSessions().length;
		localStorage.removeItem(MY_ANSWERS_KEY);
		// An empty array, not a removed key: otherwise the fake audience would
		// be generated again on the next read and the screen would not clear.
		localStorage.setItem(CROWD_KEY, '[]');
		notifyMock();
		return removed;
	}
	const { deleteAllSessions } = await firebase();
	return deleteAllSessions();
}

/** Wipes local state. Mock mode only — used while designing the screens. */
export function resetLocal() {
	localStorage.removeItem(MY_ANSWERS_KEY);
	localStorage.removeItem(CROWD_KEY);
	localStorage.removeItem(SESSION_KEY);
}

export const isMock = MOCK;
