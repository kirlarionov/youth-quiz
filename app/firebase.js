// Real Firestore implementation. Only reached when store.js has MOCK = false.
//
// Paste the config from Firebase console:
//   Project settings -> Your apps -> Web app -> SDK setup and configuration.
// Publishing this config is expected and safe — access is governed by the
// security rules in firestore.rules, not by hiding the keys.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import {
	getFirestore,
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	deleteDoc,
	onSnapshot,
	serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const firebaseConfig = {
	apiKey: 'TODO',
	authDomain: 'TODO',
	projectId: 'TODO',
	storageBucket: 'TODO',
	messagingSenderId: 'TODO',
	appId: 'TODO',
};

const db = getFirestore(initializeApp(firebaseConfig));
const SESSIONS = 'sessions';

export async function loadSession(sessionId) {
	const snapshot = await getDoc(doc(db, SESSIONS, sessionId));
	if (!snapshot.exists()) return {};
	const { updatedAt, ...answers } = snapshot.data();
	return answers;
}

export async function writeAnswer(sessionId, questionId, optionId, text = '') {
	// merge:true keeps the other answers and creates the document on first write.
	await setDoc(
		doc(db, SESSIONS, sessionId),
		{ [questionId]: optionId, [`${questionId}_text`]: text, updatedAt: serverTimestamp() },
		{ merge: true },
	);
}

/** Removes every session document. Requires `allow delete` in the rules. */
export async function deleteAllSessions() {
	const snapshot = await getDocs(collection(db, SESSIONS));
	await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
	return snapshot.size;
}

export function watchSessions(callback) {
	return onSnapshot(collection(db, SESSIONS), (snapshot) => {
		callback(
			snapshot.docs.map((d) => {
				const { updatedAt, ...answers } = d.data();
				return { id: d.id, ...answers };
			}),
		);
	});
}
