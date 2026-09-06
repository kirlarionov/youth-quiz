// The only content file. Edit questions, options and images here.
//
// Option `id` is what gets stored in Firestore — keep it stable even if you
// rewrite the label. `label` and `image` can change freely.
//
// Questions 2-15 still use placeholder images from picsum.photos. Replace them
// with local files the way question 1 already does:
//   image: './images/q2-coffee.webp'
// Target 800-1000px wide, WebP, under 100KB each.

const placeholder = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

// Every question also offers a free-text answer. It is stored under this id,
// with the text itself in a companion field (see CUSTOM_TEXT_FIELD).
export const CUSTOM_ID = 'other';
export const CUSTOM_MAX_LENGTH = 100;
export const CUSTOM_TEXT_FIELD = (questionId) => `${questionId}_text`;

export const QUESTIONS = [
	{
		id: 'q1',
		text: 'Який відпочинок тобі ближчий?',
		options: [
			{ id: 'mountains', label: 'Гори', image: './images/q1-mountains.webp' },
			{ id: 'sea', label: 'Море', image: './images/q1-sea.webp' },
			{ id: 'forest', label: 'Ліс', image: './images/q1-forest.webp' },
			{ id: 'city', label: 'Місто', image: './images/q1-city.webp' },
		],
	},
	{
		id: 'q2',
		text: 'Що п’єш зранку?',
		options: [
			{ id: 'coffee', label: 'Каву', image: placeholder('ym-q2-a') },
			{ id: 'tea', label: 'Чай', image: placeholder('ym-q2-b') },
			{ id: 'water', label: 'Воду', image: placeholder('ym-q2-c') },
			{ id: 'nothing', label: 'Нічого', image: placeholder('ym-q2-d') },
		],
	},
	{
		id: 'q3',
		text: 'Ідеальний вечір п’ятниці?',
		options: [
			{ id: 'boardgames', label: 'Настолки', image: placeholder('ym-q3-a') },
			{ id: 'movie', label: 'Кіно', image: placeholder('ym-q3-b') },
			{ id: 'walk', label: 'Прогулянка', image: placeholder('ym-q3-c') },
			{ id: 'home', label: 'Тиша вдома', image: placeholder('ym-q3-d') },
		],
	},
	{
		id: 'q4',
		text: 'Улюблена пора року?',
		options: [
			{ id: 'spring', label: 'Весна', image: placeholder('ym-q4-a') },
			{ id: 'summer', label: 'Літо', image: placeholder('ym-q4-b') },
			{ id: 'autumn', label: 'Осінь', image: placeholder('ym-q4-c') },
			{ id: 'winter', label: 'Зима', image: placeholder('ym-q4-d') },
		],
	},
	{
		id: 'q5',
		text: 'Хто живе у тебе вдома?',
		options: [
			{ id: 'cat', label: 'Кіт', image: placeholder('ym-q5-a') },
			{ id: 'dog', label: 'Собака', image: placeholder('ym-q5-b') },
			{ id: 'someone_else', label: 'Хтось інший', image: placeholder('ym-q5-c') },
			{ id: 'none', label: 'Нікого', image: placeholder('ym-q5-d') },
		],
	},
	{
		id: 'q6',
		text: 'Як ти зазвичай пишеш у месенджері?',
		options: [
			{ id: 'voice', label: 'Голосовими', image: placeholder('ym-q6-a') },
			{ id: 'long', label: 'Довго й детально', image: placeholder('ym-q6-b') },
			{ id: 'short', label: 'Коротко', image: placeholder('ym-q6-c') },
			{ id: 'memes', label: 'Мемами', image: placeholder('ym-q6-d') },
		],
	},
	{
		id: 'q7',
		text: 'Як пересуваєшся містом?',
		options: [
			{ id: 'walk', label: 'Пішки', image: placeholder('ym-q7-a') },
			{ id: 'bike', label: 'Велосипед', image: placeholder('ym-q7-b') },
			{ id: 'car', label: 'Автівка', image: placeholder('ym-q7-c') },
			{ id: 'transit', label: 'Транспорт', image: placeholder('ym-q7-d') },
		],
	},
	{
		id: 'q8',
		text: 'Яка суперздібність потрібніша?',
		options: [
			{ id: 'fly', label: 'Політ', image: placeholder('ym-q8-a') },
			{ id: 'teleport', label: 'Телепорт', image: placeholder('ym-q8-b') },
			{ id: 'mindread', label: 'Читати думки', image: placeholder('ym-q8-c') },
			{ id: 'invisible', label: 'Невидимість', image: placeholder('ym-q8-d') },
		],
	},
	{
		id: 'q9',
		text: 'Що найважливіше у друзях?',
		options: [
			{ id: 'loyalty', label: 'Вірність', image: placeholder('ym-q9-a') },
			{ id: 'humor', label: 'Почуття гумору', image: placeholder('ym-q9-b') },
			{ id: 'honesty', label: 'Чесність', image: placeholder('ym-q9-c') },
			{ id: 'support', label: 'Надійність', image: placeholder('ym-q9-d') },
		],
	},
	{
		id: 'q10',
		text: 'Твоя роль у компанії?',
		options: [
			{ id: 'organizer', label: 'Організатор', image: placeholder('ym-q10-a') },
			{ id: 'soul', label: 'Душа компанії', image: placeholder('ym-q10-b') },
			{ id: 'listener', label: 'Слухач', image: placeholder('ym-q10-c') },
			{ id: 'observer', label: 'Спостерігач', image: placeholder('ym-q10-d') },
		],
	},
	{
		id: 'q11',
		text: 'Що береш у похід першим ділом?',
		options: [
			{ id: 'guitar', label: 'Гітару', image: placeholder('ym-q11-a') },
			{ id: 'camera', label: 'Фотоапарат', image: placeholder('ym-q11-b') },
			{ id: 'book', label: 'Книжку', image: placeholder('ym-q11-c') },
			{ id: 'food', label: 'Побільше їжі', image: placeholder('ym-q11-d') },
		],
	},
	{
		id: 'q12',
		text: 'Вільний місяць — куди його?',
		options: [
			{ id: 'travel', label: 'У подорож', image: placeholder('ym-q12-a') },
			{ id: 'study', label: 'На навчання', image: placeholder('ym-q12-b') },
			{ id: 'rest', label: 'На відпочинок удома', image: placeholder('ym-q12-c') },
			{ id: 'project', label: 'На свій проєкт', image: placeholder('ym-q12-d') },
		],
	},
	{
		id: 'q13',
		text: 'Як ти починаєш нову справу?',
		options: [
			{ id: 'plan', label: 'З плану', image: placeholder('ym-q13-a') },
			{ id: 'dive', label: 'Одразу в бій', image: placeholder('ym-q13-b') },
			{ id: 'ask', label: 'Спитаю поради', image: placeholder('ym-q13-c') },
			{ id: 'wait', label: 'Почекаю натхнення', image: placeholder('ym-q13-d') },
		],
	},
	{
		id: 'q14',
		text: 'Ранок чи ніч?',
		options: [
			{ id: 'earlybird', label: 'Встаю рано', image: placeholder('ym-q14-a') },
			{ id: 'nightowl', label: 'Сова', image: placeholder('ym-q14-b') },
			{ id: 'depends', label: 'Як вийде', image: placeholder('ym-q14-c') },
			{ id: 'always', label: 'Завжди не виспаний', image: placeholder('ym-q14-d') },
		],
	},
	{
		id: 'q15',
		text: 'Що б ти додав на наші зустрічі?',
		options: [
			{ id: 'music', label: 'Більше музики', image: placeholder('ym-q15-a') },
			{ id: 'games', label: 'Більше ігор', image: placeholder('ym-q15-b') },
			{ id: 'talks', label: 'Більше розмов', image: placeholder('ym-q15-c') },
			{ id: 'trips', label: 'Більше виїздів', image: placeholder('ym-q15-d') },
		],
	},
];

export const questionById = (id) => QUESTIONS.find((q) => q.id === id);
