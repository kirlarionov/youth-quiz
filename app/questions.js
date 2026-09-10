// The only content file. Edit questions, options and images here.
//
// Option `id` is what gets stored in Firestore — keep it stable even if you
// rewrite the label. `label`, `emoji` and `image` can change freely.
//
// An option shows a photo when `image` is set, and its emoji otherwise. Mixing
// the two inside one question looks uneven — give a question either photos for
// every option or none at all. Photos: 800-1000px wide, WebP, under 100KB.

// Every question also offers a free-text answer. It is stored under this id,
// with the text itself in a companion field (see CUSTOM_TEXT_FIELD).
export const CUSTOM_ID = 'other';
export const CUSTOM_MAX_LENGTH = 100;
export const CUSTOM_TEXT_FIELD = (questionId) => `${questionId}_text`;

export const QUESTIONS = [
	{
		id: 'q1',
		text: 'Який відпочинок тобі найближчий?',
		options: [
			{ id: 'mountains', emoji: '🏔️', label: 'Гори', image: './images/q1-mountains.webp' },
			{ id: 'sea', emoji: '🌊', label: 'Море', image: './images/q1-sea.webp' },
			{ id: 'forest', emoji: '🌲', label: 'Ліс', image: './images/q1-forest.webp' },
			{ id: 'city', emoji: '🏙️', label: 'Велике місто', image: './images/q1-city.webp' },
			{ id: 'cottage', emoji: '🏡', label: 'Будиночок десь у тиші', image: './images/q1-cottage.webp' },
			{ id: 'travel', emoji: '✈️', label: 'Подорож у нове місце', image: './images/q1-travel.webp' },
		],
	},
	{
		id: 'q2',
		text: 'Який вид спорту або активності тобі подобається найбільше?',
		options: [
			{ id: 'football', emoji: '⚽', label: 'Футбол', image: './images/q2-football.webp' },
			{ id: 'volleyball', emoji: '🏐', label: 'Волейбол', image: './images/q2-volleyball.webp' },
			{ id: 'basketball', emoji: '🏀', label: 'Баскетбол', image: './images/q2-basketball.webp' },
			{ id: 'motorsport', emoji: '🏎️', label: 'Формула-1 / автоспорт', image: './images/q2-motorsport.webp' },
			{ id: 'esports', emoji: '🎮', label: 'Кіберспорт', image: './images/q2-esports.webp' },
			{ id: 'cycling', emoji: '🚴', label: 'Велосипед', image: './images/q2-cycling.webp' },
			{ id: 'running', emoji: '🏃', label: 'Біг', image: './images/q2-running.webp' },
			{ id: 'gym', emoji: '🏋️', label: 'Тренажерний зал', image: './images/q2-gym.webp' },
			{ id: 'workout', emoji: '🤸', label: 'Турніки / воркаут', image: './images/q2-workout.webp' },
			{ id: 'tabletennis', emoji: '🏓', label: 'Настільний теніс', image: './images/q2-tabletennis.webp' },
			{ id: 'no_sport', emoji: '😌', label: 'Спорт — не моє', image: './images/q2-no_sport.webp' },
		],
	},
	{
		id: 'q3',
		text: 'Як виглядає твій ідеальний вечір?',
		options: [
			{ id: 'friends', emoji: '🍕', label: 'Компанія друзів' , image: './images/q3-friends.webp' },
			{ id: 'one_on_one', emoji: '☕', label: 'Розмова один на один' , image: './images/q3-one_on_one.webp' },
			{ id: 'movie', emoji: '🎬', label: 'Фільм або серіал' , image: './images/q3-movie.webp' },
			{ id: 'games', emoji: '🎮', label: 'Ігри' , image: './images/q3-games.webp' },
			{ id: 'book', emoji: '📖', label: 'Книга / спокій удома' , image: './images/q3-book.webp' },
			{ id: 'walk', emoji: '🚶', label: 'Прогулянка' , image: './images/q3-walk.webp' },
			{ id: 'hobby', emoji: '🎨', label: 'Моє хобі' , image: './images/q3-hobby.webp' },
		],
	},
	{
		id: 'q4',
		text: 'Що ти обереш у подорожі?',
		options: [
			{ id: 'many_places', emoji: '🗺️', label: 'Побачити якомога більше місць', image: './images/q4-many_places.webp' },
			{ id: 'relax', emoji: '🏖️', label: 'Просто відпочити', image: './images/q4-relax.webp' },
			{ id: 'food', emoji: '🍜', label: 'Спробувати місцеву їжу', image: './images/q4-food.webp' },
			{ id: 'history', emoji: '🏛️', label: 'Історичні місця та музеї', image: './images/q4-history.webp' },
			{ id: 'adventure', emoji: '🥾', label: 'Пригоди й активності', image: './images/q4-adventure.webp' },
			{ id: 'photos', emoji: '📸', label: 'Красиві місця та фото', image: './images/q4-photos.webp' },
		],
	},
	{
		id: 'q5',
		text: 'Що тобі ближче?',
		options: [
			{ id: 'morning', emoji: '🌅', label: 'Ранок', image: './images/q5-morning.webp' },
			{ id: 'night', emoji: '🌙', label: 'Ніч', image: './images/q5-night.webp' },
			{ id: 'both', emoji: '😄', label: 'Я нормально функціоную і там, і там', image: './images/q5-both.webp' },
			{ id: 'neither', emoji: '🫠', label: 'Я взагалі не люблю прокидатися', image: './images/q5-neither.webp' },
		],
	},
	{
		id: 'q6',
		text: 'Який формат зустрічі з друзями ти обереш?',
		options: [
			{ id: 'home', emoji: '🏠', label: 'Посиденьки вдома' , image: './images/q6-home.webp' },
			{ id: 'cafe', emoji: '🍔', label: 'Кафе / ресторан' , image: './images/q6-cafe.webp' },
			{ id: 'bowling', emoji: '🎳', label: 'Боулінг / активності' , image: './images/q6-bowling.webp' },
			{ id: 'nature', emoji: '🌳', label: 'Природа' , image: './images/q6-nature.webp' },
			{ id: 'citywalk', emoji: '🌆', label: 'Гуляти містом' , image: './images/q6-citywalk.webp' },
			{ id: 'boardgames', emoji: '🎲', label: 'Настільні ігри' , image: './images/q6-boardgames.webp' },
			{ id: 'trip', emoji: '🚗', label: 'Кудись поїхати' , image: './images/q6-trip.webp' },
			{ id: 'party', emoji: '🎉', label: 'Велика тусовка' , image: './images/q6-party.webp' },
		],
	},
	{
		id: 'q7',
		text: 'Що ти швидше ввімкнеш у машині?',
		options: [
			{ id: 'pop', emoji: '🎤', label: 'Поп', image: './images/q7-pop.webp' },
			{ id: 'worship', emoji: '🙌', label: 'Worship', image: './images/q7-worship.webp' },
			{ id: 'rock', emoji: '🎸', label: 'Рок', image: './images/q7-rock.webp' },
			{ id: 'electronic', emoji: '🎧', label: 'Електронну музику', image: './images/q7-electronic.webp' },
			{ id: 'calm', emoji: '🎹', label: 'Спокійну музику', image: './images/q7-calm.webp' },
			{ id: 'podcast', emoji: '🎙️', label: 'Подкаст', image: './images/q7-podcast.webp' },
			{ id: 'silence', emoji: '🤫', label: 'Нічого — люблю тишу', image: './images/q7-silence.webp' },
			{ id: 'other_music', emoji: '🎵', label: 'Інше', image: './images/q7-other_music.webp' },
		],
	},
	{
		id: 'q8',
		text: 'Що б ти зробив, якби тобі подарували повністю вільний понеділок?',
		options: [
			{ id: 'sleep', emoji: '😴', label: 'Виспався' , image: './images/q8-sleep.webp' },
			{ id: 'friends', emoji: '👥', label: 'Зустрівся з друзями' , image: './images/q8-friends.webp' },
			{ id: 'trip', emoji: '🚗', label: 'Кудись поїхав' , image: './images/q8-trip.webp' },
			{ id: 'home', emoji: '🏠', label: 'Провів день удома' , image: './images/q8-home.webp' },
			{ id: 'todo', emoji: '🛠️', label: 'Нарешті зробив те, що давно відкладаю' , image: './images/q8-todo.webp' },
			{ id: 'hobby', emoji: '🎯', label: 'Зайнявся своїм хобі' , image: './images/q8-hobby.webp' },
			{ id: 'spontaneous', emoji: '🌊', label: 'Вирішив би все спонтанно' , image: './images/q8-spontaneous.webp' },
		],
	},
	{
		id: 'q9',
		text: 'Що тобі цікавіше дивитися?',
		options: [
			{ id: 'comedy', emoji: '😂', label: 'Комедії' , image: './images/q9-comedy.webp' },
			{ id: 'detective', emoji: '🔍', label: 'Детективи' , image: './images/q9-detective.webp' },
			{ id: 'scifi', emoji: '🚀', label: 'Фантастику' , image: './images/q9-scifi.webp' },
			{ id: 'action', emoji: '💥', label: 'Бойовики' , image: './images/q9-action.webp' },
			{ id: 'drama', emoji: '❤️', label: 'Романтику / драми' , image: './images/q9-drama.webp' },
			{ id: 'historical', emoji: '🏰', label: 'Історичні фільми' , image: './images/q9-historical.webp' },
			{ id: 'documentary', emoji: '📚', label: 'Документальні фільми' , image: './images/q9-documentary.webp' },
			{ id: 'nothing', emoji: '👀', label: 'Майже нічого не дивлюся' , image: './images/q9-nothing.webp' },
		],
	},
	{
		id: 'q10',
		text: 'Що обереш на вечерю?',
		options: [
			{ id: 'pizza', emoji: '🍕', label: 'Піцу', image: './images/q10-pizza.webp' },
			{ id: 'sushi', emoji: '🍣', label: 'Суші', image: './images/q10-sushi.webp' },
			{ id: 'burger', emoji: '🍔', label: 'Бургер', image: './images/q10-burger.webp' },
			{ id: 'homemade', emoji: '🍲', label: 'Щось домашнє', image: './images/q10-homemade.webp' },
			{ id: 'shawarma', emoji: '🌯', label: 'Шаурму', image: './images/q10-shawarma.webp' },
			{ id: 'light', emoji: '🥗', label: 'Щось легке', image: './images/q10-light.webp' },
		],
	},
	{
		id: 'q11',
		text: 'Як ти дієш, якщо компанія не може вирішити, куди піти?',
		options: [
			{ id: 'propose', emoji: '📣', label: 'Пропоную свій варіант' },
			{ id: 'mediate', emoji: '🤝', label: 'Допомагаю всім домовитися' },
			{ id: 'easygoing', emoji: '😌', label: 'Мені майже все одно, піду з усіма' },
			{ id: 'wait', emoji: '👀', label: 'Чекаю, що вирішать інші' },
			{ id: 'weird', emoji: '😂', label: 'Починаю пропонувати максимально дивні варіанти' },
		],
	},
	{
		id: 'q12',
		text: 'Наскільки ти любиш спонтанні плани?',
		options: [
			{ id: 'already_going', emoji: '🚀', label: '«Я вже збираюсь!»' },
			{ id: 'love', emoji: '😄', label: 'Дуже люблю' },
			{ id: 'sometimes', emoji: '👍', label: 'Іноді — із задоволенням' },
			{ id: 'plan_ahead', emoji: '🗓️', label: 'Краще попередьте заздалегідь' },
			{ id: 'dislike', emoji: '😬', label: 'Не люблю, коли плани різко змінюються' },
		],
	},
	{
		id: 'q13',
		text: 'Як ти зазвичай поводишся у великій компанії?',
		options: [
			{ id: 'loud', emoji: '🎤', label: 'Багато говорю і створюю двіж' },
			{ id: 'social', emoji: '😄', label: 'Легко спілкуюся з усіма' },
			{ id: 'small_group', emoji: '☕', label: 'Знаходжу 1–2 людей і зависаю з ними' },
			{ id: 'listen', emoji: '👀', label: 'Більше слухаю та спостерігаю' },
			{ id: 'recharge', emoji: '🔋', label: 'Через деякий час мені потрібно побути самому' },
		],
	},
	{
		id: 'q14',
		text: 'Які розмови тобі найбільше подобаються?',
		options: [
			{ id: 'funny', emoji: '😂', label: 'Смішні історії та жарти' },
			{ id: 'travel', emoji: '🌍', label: 'Подорожі, події, враження' },
			{ id: 'dreams', emoji: '🚀', label: 'Мрії та плани' },
			{ id: 'people', emoji: '❤️', label: 'Люди та стосунки' },
			{ id: 'ideas', emoji: '🧠', label: 'Ідеї та цікаві теми' },
			{ id: 'faith', emoji: '✝️', label: 'Віра та сенс життя' },
			{ id: 'who_not_what', emoji: '🎲', label: 'Мені важливіше з ким говорити, ніж про що' },
		],
	},
	{
		id: 'q15',
		text: 'Що ти найбільше цінуєш у близьких друзях?',
		options: [
			{ id: 'fun', emoji: '😂', label: 'З ними легко й весело' },
			{ id: 'open', emoji: '💬', label: 'Можна говорити про все' },
			{ id: 'reliable', emoji: '🤝', label: 'На них можна покластися' },
			{ id: 'accepting', emoji: '❤️', label: 'Вони приймають мене таким, як я є' },
			{ id: 'motivating', emoji: '🚀', label: 'Вони мотивують мене рости' },
			{ id: 'values', emoji: '🧭', label: 'Ми схоже дивимося на важливі речі' },
		],
	},
	{
		id: 'q16',
		text: 'Як ти найчастіше показуєш людині, що вона тобі важлива?',
		options: [
			{ id: 'time', emoji: '⏰', label: 'Проводжу з нею час' },
			{ id: 'message', emoji: '💬', label: 'Пишу / телефоную' },
			{ id: 'gifts', emoji: '🎁', label: 'Роблю маленькі сюрпризи' },
			{ id: 'help', emoji: '🛠️', label: 'Допомагаю справами' },
			{ id: 'warmth', emoji: '🤗', label: 'Обіймаю та проявляю тепло' },
			{ id: 'listen', emoji: '👂', label: 'Уважно слухаю' },
			{ id: 'pray', emoji: '🙏', label: 'Молюся за неї' },
		],
	},
	{
		id: 'q17',
		text: 'Що з цього ти найбільше хотів би мати у своєму житті через 10 років?',
		options: [
			{ id: 'family', emoji: '❤️', label: 'Міцну сім’ю' },
			{ id: 'career', emoji: '💼', label: 'Улюблену справу / професію' },
			{ id: 'money', emoji: '💰', label: 'Фінансову стабільність' },
			{ id: 'freedom', emoji: '🌍', label: 'Свободу подорожувати й бачити світ' },
			{ id: 'circle', emoji: '👥', label: 'Сильне коло близьких людей' },
			{ id: 'growth', emoji: '🌱', label: 'Відчуття, що я розвиваюсь і не стою на місці' },
			{ id: 'impact', emoji: '🤲', label: 'Відчуття, що моє життя приносить користь іншим' },
		],
	},
	{
		id: 'q18',
		text: 'Що найчастіше може об’єднати дуже різних людей?',
		options: [
			{ id: 'humor', emoji: '😂', label: 'Спільний гумор' },
			{ id: 'cause', emoji: '🎯', label: 'Спільна справа' },
			{ id: 'care', emoji: '❤️', label: 'Турбота одне про одного' },
			{ id: 'interests', emoji: '🎨', label: 'Спільні інтереси' },
			{ id: 'values', emoji: '🧭', label: 'Спільні цінності' },
			{ id: 'faith', emoji: '✝️', label: 'Спільна віра' },
			{ id: 'shared_past', emoji: '🕰️', label: 'Багато пережитого разом' },
		],
	},
	{
		id: 'q19',
		text: 'У чому для тебе особливо важливо бути «на одній хвилі» з людиною, з якою будуєш серйозні стосунки?',
		options: [
			{ id: 'communication', emoji: '💬', label: 'У спілкуванні та гуморі' },
			{ id: 'family', emoji: '🏡', label: 'У поглядах на сім’ю' },
			{ id: 'money', emoji: '💰', label: 'У ставленні до грошей' },
			{ id: 'goals', emoji: '🎯', label: 'У життєвих цілях' },
			{ id: 'faith', emoji: '✝️', label: 'У вірі' },
			{ id: 'people', emoji: '👥', label: 'У ставленні до людей' },
			{ id: 'lifestyle', emoji: '🌍', label: 'У способі життя' },
		],
	},
	{
		id: 'q20',
		text: 'Уяви: двом людям дуже добре разом, але вони хочуть від життя зовсім різного. Як ти думаєш?',
		options: [
			{ id: 'love_enough', emoji: '❤️', label: 'Якщо вони люблять одне одного — цього може бути достатньо' },
			{ id: 'negotiate', emoji: '🤝', label: 'Головне — вміти домовлятися' },
			{ id: 'converge', emoji: '🔄', label: 'З часом їхні цілі можуть стати ближчими' },
			{ id: 'problem', emoji: '🧭', label: 'Різний напрямок рано чи пізно стане проблемою' },
			{ id: 'depends', emoji: '🤔', label: 'Залежить від того, наскільки важливі ці відмінності' },
		],
	},
];
