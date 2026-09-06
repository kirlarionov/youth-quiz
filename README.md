# Spilnyi Napryamok — audience quiz

A small quiz for a youth meeting. People answer from their phones, and the
operator puts the results on the projector at the end.

- `index.html` — the participant screen
- `host.html` — the operator screen with the results slider

No build step: plain HTML, ES modules and CSS. Answers are stored in Firebase
Firestore, one document per participant.

## Running locally

ES modules do not work over `file://`, so serve the folder:

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080/` and `http://localhost:8080/host.html`.

Until the Firebase config in `app/firebase.js` is filled in, `app/store.js`
runs with `MOCK = true`: answers stay in `localStorage` and the audience is
generated, so the results slider has something to show.

## Editing the content

Questions, options and images live in `app/questions.js` and nowhere else.
Option ids are what reaches the database — keep them stable, change only
labels and images.

## Documentation

- [docs/spec.md](docs/spec.md) — requirements and the decisions behind them
- [CLAUDE.md](CLAUDE.md) — layout and conventions
- [images/CREDITS.md](images/CREDITS.md) — image licences
