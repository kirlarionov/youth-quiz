// Data access layer. The screens above it know nothing about Firestore —
// swapping the database means rewriting firebase.js and nothing else.

import { loadSession, writeAnswers, watchSessions, deleteAllSessions } from './firebase.js';

const SESSION_KEY = 'ym_session_id';

// Private browsing and blocked cookies make localStorage throw on access, so
// every touch is guarded. The id then lives in memory only: answers still
// reach the database, they just stop being recognised after a reload.
let memoryId = null;

function readStoredId() {
	try {
		return localStorage.getItem(SESSION_KEY);
	} catch {
		return null;
	}
}

function storeId(id) {
	try {
		localStorage.setItem(SESSION_KEY, id);
	} catch {
		// Memory-only session; nothing else to do.
	}
}

/** Identifies this browser. Created once and kept for the whole event. */
export function getMySessionId() {
	let id = readStoredId() ?? memoryId;
	if (!id) {
		id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
		memoryId = id;
		storeId(id);
	}
	return id;
}

/** Answers of the current participant: { q1: 'mountains', q1_text: '', ... } */
export function loadMyAnswers() {
	return loadSession(getMySessionId());
}

/**
 * Records or replaces answers. `patch` maps field names to values, so several
 * answers given in quick succession travel as one write.
 */
export function saveAnswers(patch) {
	return writeAnswers(getMySessionId(), patch);
}

/**
 * Live feed of every session, for the operator screen.
 * Calls back with an array of answer objects. Returns an unsubscribe function.
 * `onError` fires when the feed stops: the numbers on screen are frozen from
 * that moment on.
 */
export function subscribeToSessions(callback, onError) {
	return watchSessions(callback, onError);
}

/**
 * Erases every answer of every participant, for a clean run between rehearsal
 * and the real thing. Returns how many sessions were removed.
 */
export function clearAllAnswers() {
	return deleteAllSessions();
}
