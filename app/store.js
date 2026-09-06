// Data access layer. The screens above it know nothing about Firestore —
// swapping the database means rewriting firebase.js and nothing else.

import { loadSession, writeAnswer, watchSessions, deleteAllSessions } from './firebase.js';

const SESSION_KEY = 'ym_session_id';

/** Identifies this browser. Created once and kept for the whole event. */
export function getMySessionId() {
	let id = localStorage.getItem(SESSION_KEY);
	if (!id) {
		id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
		localStorage.setItem(SESSION_KEY, id);
	}
	return id;
}

/** Answers of the current participant: { q1: 'mountains', q1_text: '', ... } */
export function loadMyAnswers() {
	return loadSession(getMySessionId());
}

/**
 * Records or replaces one answer. Safe to call repeatedly.
 * `text` carries the free-text answer; pass '' to clear a previous one.
 */
export function saveAnswer(questionId, optionId, text = '') {
	return writeAnswer(getMySessionId(), questionId, optionId, text);
}

/**
 * Live feed of every session, for the operator screen.
 * Calls back with an array of answer objects. Returns an unsubscribe function.
 */
export function subscribeToSessions(callback) {
	return watchSessions(callback);
}

/**
 * Erases every answer of every participant, for a clean run between rehearsal
 * and the real thing. Returns how many sessions were removed.
 */
export function clearAllAnswers() {
	return deleteAllSessions();
}
