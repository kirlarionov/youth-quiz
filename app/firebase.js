// Firestore implementation behind store.js.
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
	apiKey: 'AIzaSyCSjg_Df5mQ_4Vt5RqFN63l0u8tMeEKMGg',
	authDomain: 'sda-3-youth-ministry.firebaseapp.com',
	projectId: 'sda-3-youth-ministry',
	storageBucket: 'sda-3-youth-ministry.firebasestorage.app',
	messagingSenderId: '78468742158',
	appId: '1:78468742158:web:d079308dc1a1f6a6d6105f',
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

export function watchSessions(callback, onError) {
	return onSnapshot(
		collection(db, SESSIONS),
		(snapshot) => {
			callback(
				snapshot.docs.map((d) => {
					const { updatedAt, ...answers } = d.data();
					return { id: d.id, ...answers };
				}),
			);
		},
		onError,
	);
}
