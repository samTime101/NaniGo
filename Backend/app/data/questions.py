"""Seed question bank used for the default (non-personalized) packs.

Each subject has 25 age-appropriate questions, sliced into 5 levels of 5.
"""

_counter = {"n": 0}


def _q(text, options, correct, explanation, text_np=None, figure=None):
    _counter["n"] += 1
    return {
        "id": f"q{_counter['n']}",
        "kind": "mcq",
        "text": text,
        "text_np": text_np,
        "options": options,
        "correct_index": correct,
        "explanation": explanation,
        "figure": figure,
    }


MATH_QUESTIONS = [
    _q("What is 2 + 3?", ["4", "5", "6", "7"], 1, "Two and three more makes five!", "२ + ३ कति हुन्छ?"),
    _q("How many sides does a rectangle have?", ["3", "4", "5", "6"], 1, "A rectangle has 4 sides.", "आयतका कति भुजा?", "rectangle"),
    _q("What is 10 - 4?", ["5", "6", "7", "8"], 1, "Ten take away four leaves six.", "१० - ४ कति हुन्छ?"),
    _q("Which number comes after 7?", ["6", "8", "9", "5"], 1, "After seven comes eight.", "७ पछि कुन?"),
    _q("How many sides does a triangle have?", ["2", "3", "4", "5"], 1, "A triangle has 3 sides.", "त्रिभुजका कति भुजा?", "triangle"),
    _q("What is 5 + 5?", ["9", "10", "11", "12"], 1, "Five and five make ten."),
    _q("What is 3 x 2?", ["5", "6", "7", "8"], 1, "Three groups of two is six."),
    _q("Which is the biggest number?", ["12", "21", "9", "19"], 1, "Twenty-one is the largest."),
    _q("How many corners does a square have?", ["3", "4", "5", "6"], 1, "A square has 4 corners.", None, "square"),
    _q("What is 8 + 1?", ["7", "8", "9", "10"], 2, "Eight and one more is nine."),
    _q("What is half of 10?", ["2", "5", "8", "10"], 1, "Half of ten is five."),
    _q("How many days in a week?", ["5", "6", "7", "8"], 2, "There are seven days in a week."),
    _q("What is 6 - 2?", ["3", "4", "5", "6"], 1, "Six take away two is four."),
    _q("A circle has how many corners?", ["0", "1", "2", "4"], 0, "A circle has no corners!", None, "circle"),
    _q("What is 4 + 4?", ["6", "7", "8", "9"], 2, "Four and four make eight."),
    _q("Which number is even?", ["3", "5", "6", "7"], 2, "Six can be shared into two equal groups."),
    _q("What is 9 + 0?", ["0", "8", "9", "10"], 2, "Anything plus zero stays the same."),
    _q("How many points does a star have?", ["3", "4", "5", "6"], 2, "A classic star has 5 points.", None, "star"),
    _q("What is 7 + 2?", ["8", "9", "10", "11"], 1, "Seven and two more is nine."),
    _q("Which comes before 1?", ["0", "2", "3", "5"], 0, "Zero comes before one."),
    _q("What is 12 - 2?", ["8", "9", "10", "11"], 2, "Twelve take away two is ten."),
    _q("What is 2 x 5?", ["7", "10", "12", "15"], 1, "Two groups of five make ten."),
    _q("How many ears do you have?", ["1", "2", "3", "4"], 1, "You have two ears."),
    _q("What is 3 + 6?", ["8", "9", "10", "11"], 1, "Three and six make nine."),
    _q("Which is smallest?", ["8", "3", "5", "2"], 3, "Two is the smallest here."),
]

NEPALI_QUESTIONS = [
    _q("Which is the first letter of Nepali alphabet?", ["क", "ख", "अ", "ग"], 2, "अ is the first vowel.", "पहिलो अक्षर कुन?"),
    _q('What does "आमा" mean?', ["Father", "Mother", "Sister", "Brother"], 1, "आमा means Mother.", '"आमा" को अर्थ?'),
    _q('What does "पानी" mean?', ["Fire", "Water", "Air", "Earth"], 1, "पानी means Water.", '"पानी" को अर्थ?'),
    _q('Which word means "Dog"?', ["कुकुर", "बिरालो", "गाई", "हात्ती"], 0, "कुकुर means Dog."),
    _q('What does "घर" mean?', ["School", "House", "Tree", "Road"], 1, "घर means House."),
    _q("Which is a vowel (स्वर)?", ["क", "इ", "त", "प"], 1, "इ is a vowel."),
    _q('What does "सूर्य" mean?', ["Moon", "Star", "Sun", "Sky"], 2, "सूर्य means Sun."),
    _q('Which word means "Book"?', ["कलम", "किताब", "झोला", "कापी"], 1, "किताब means Book."),
    _q('What does "रातो" mean?', ["Blue", "Green", "Red", "Yellow"], 2, "रातो means Red."),
    _q('What does "ठूलो" mean?', ["Small", "Big", "Fast", "Slow"], 1, "ठूलो means Big."),
    _q('Which means "Friend"?', ["साथी", "शिक्षक", "राजा", "डाक्टर"], 0, "साथी means Friend."),
    _q('What does "फूल" mean?', ["Leaf", "Flower", "Root", "Seed"], 1, "फूल means Flower."),
    _q('Which letter makes the "ka" sound?', ["क", "ख", "ग", "घ"], 0, "क makes the ka sound."),
    _q('What does "रुख" mean?', ["Tree", "River", "Hill", "Cloud"], 0, "रुख means Tree."),
    _q('Which means "School"?', ["विद्यालय", "अस्पताल", "बजार", "मन्दिर"], 0, "विद्यालय means School."),
    _q('What does "सानो" mean?', ["Big", "Tall", "Small", "Wide"], 2, "सानो means Small."),
    _q('Which means "Bird"?', ["चरा", "माछा", "सर्प", "भ्यागुता"], 0, "चरा means Bird."),
    _q('What does "दिन" mean?', ["Night", "Day", "Week", "Month"], 1, "दिन means Day."),
    _q('Which means "Eye"?', ["नाक", "कान", "आँखा", "मुख"], 2, "आँखा means Eye."),
    _q('What does "हरियो" mean?', ["Green", "Red", "Black", "White"], 0, "हरियो means Green."),
    _q('Which means "Hand"?', ["खुट्टा", "हात", "टाउको", "पेट"], 1, "हात means Hand."),
    _q('What does "रात" mean?', ["Morning", "Noon", "Night", "Evening"], 2, "रात means Night."),
    _q('Which means "Cow"?', ["गाई", "बाख्रा", "कुखुरा", "घोडा"], 0, "गाई means Cow."),
    _q('What does "मीठो" mean?', ["Sour", "Bitter", "Sweet", "Salty"], 2, "मीठो means Sweet."),
    _q('Which means "Water buffalo"?', ["भैंसी", "बाघ", "हात्ती", "बाँदर"], 0, "भैंसी means Water buffalo."),
]

SCIENCE_QUESTIONS = [
    _q("Which animal is the national animal of Nepal?", ["Tiger", "Cow", "Elephant", "Yak"], 1, "The cow is Nepal's national animal.", "राष्ट्रिय जनावर कुन?"),
    _q("What do plants need to grow?", ["Only soil", "Sunlight and water", "Only air", "Only rocks"], 1, "Plants need sunlight and water.", "बिरुवालाई के चाहिन्छ?"),
    _q("How many legs does a spider have?", ["6", "8", "10", "4"], 1, "Spiders have 8 legs."),
    _q("What gives us light in the day?", ["Moon", "Stars", "Sun", "Lamp"], 2, "The Sun lights up our day."),
    _q("Which part of the body helps us see?", ["Ears", "Eyes", "Nose", "Hands"], 1, "We see with our eyes."),
    _q("What do bees make?", ["Milk", "Honey", "Silk", "Wax only"], 1, "Bees make honey."),
    _q("Which is a fruit?", ["Carrot", "Apple", "Potato", "Onion"], 1, "An apple is a fruit."),
    _q("What do we breathe in to live?", ["Water", "Oxygen", "Smoke", "Sand"], 1, "We breathe in oxygen."),
    _q("Which animal can fly?", ["Dog", "Fish", "Bird", "Cow"], 2, "Birds can fly."),
    _q("What is the tallest mountain in the world?", ["Everest", "Annapurna", "Lhotse", "Makalu"], 0, "Mount Everest is the tallest, in Nepal!"),
    _q("Where do fish live?", ["Trees", "Water", "Sky", "Sand"], 1, "Fish live in water."),
    _q("What season is the coldest?", ["Summer", "Spring", "Winter", "Autumn"], 2, "Winter is the coldest season."),
    _q("What is a baby dog called?", ["Kitten", "Puppy", "Calf", "Chick"], 1, "A baby dog is a puppy."),
    _q("What do we use to smell?", ["Eyes", "Nose", "Ears", "Tongue"], 1, "We smell with our nose."),
    _q("Which one is a living thing?", ["Rock", "Tree", "Chair", "Spoon"], 1, "A tree is alive and grows."),
    _q("What falls from clouds as rain?", ["Sand", "Water", "Snowballs", "Leaves"], 1, "Rain is water from clouds."),
    _q("How many colors are in a rainbow?", ["5", "6", "7", "8"], 2, "A rainbow has 7 colors."),
    _q('Which animal says "moo"?', ["Cat", "Cow", "Dog", "Duck"], 1, "A cow says moo."),
    _q("What do we use to hear?", ["Eyes", "Ears", "Hands", "Feet"], 1, "We hear with our ears."),
    _q("Which is a vegetable?", ["Mango", "Spinach", "Banana", "Grape"], 1, "Spinach is a leafy vegetable."),
    _q("What helps a plant drink water?", ["Leaves", "Roots", "Flowers", "Petals"], 1, "Roots soak up water."),
    _q("Which is the largest land animal?", ["Tiger", "Elephant", "Horse", "Cow"], 1, "The elephant is the largest land animal."),
    _q("What do caterpillars turn into?", ["Birds", "Butterflies", "Bees", "Frogs"], 1, "Caterpillars become butterflies."),
    _q("Which is hot?", ["Ice", "Snow", "Fire", "Rain"], 2, "Fire is hot."),
    _q("What do we plant to grow rice?", ["Seeds", "Stones", "Plastic", "Glass"], 0, "We plant seeds to grow rice."),
]

SUBJECT_BANK = {
    "math": MATH_QUESTIONS,
    "nepali": NEPALI_QUESTIONS,
    "science": SCIENCE_QUESTIONS,
}


def _match(text, pairs, explanation, text_np=None):
    _counter["n"] += 1
    return {
        "id": f"q{_counter['n']}",
        "kind": "match",
        "text": text,
        "text_np": text_np,
        "options": [],
        "correct_index": 0,
        "explanation": explanation,
        "figure": None,
        "pairs": [{"left": l, "right": r} for l, r in pairs],
        "sequence": None,
    }


def _order(text, sequence, explanation, text_np=None):
    _counter["n"] += 1
    return {
        "id": f"q{_counter['n']}",
        "kind": "order",
        "text": text,
        "text_np": text_np,
        "options": [],
        "correct_index": 0,
        "explanation": explanation,
        "figure": None,
        "pairs": None,
        "sequence": sequence,
    }


def _mcq(*args, **kwargs):
    q = _q(*args, **kwargs)
    q["kind"] = "mcq"
    return q


def _speak(text, answer, accept, explanation, text_np=None):
    """Voice-answer question: the child hears it and says the answer aloud."""
    _counter["n"] += 1
    return {
        "id": f"q{_counter['n']}",
        "kind": "speak",
        "text": text,
        "text_np": text_np,
        "options": [],
        "correct_index": 0,
        "explanation": explanation,
        "figure": None,
        "pairs": None,
        "sequence": None,
        "answer": answer,
        "accept": accept,
    }


# A mixed "Fun Puzzles" pack showcasing match + order + mcq interactions.
PUZZLE_QUESTIONS = [
    _order("Order the numbers from smallest to biggest", ["1", "2", "3", "4"], "1 is smallest, 4 is biggest."),
    _match("Match the shape to its number of sides", [("Triangle", "3"), ("Square", "4"), ("Pentagon", "5"), ("Circle", "0")], "Each shape has its own sides!"),
    _mcq("Which number is the biggest?", ["18", "81", "8", "1"], 1, "Eighty-one is the biggest."),
    _order("Order these from lightest to heaviest", ["Feather", "Apple", "Cat", "Elephant"], "A feather is lightest, an elephant heaviest."),
    _match("Match the animal to its baby", [("Dog", "Puppy"), ("Cat", "Kitten"), ("Cow", "Calf"), ("Hen", "Chick")], "Every animal has a special baby name."),
    _order("Order the days of the week", ["Sunday", "Monday", "Tuesday", "Wednesday"], "Days go in order through the week."),
    _match("Match the color to the fruit", [("Banana", "Yellow"), ("Apple", "Red"), ("Leaf", "Green"), ("Grape", "Purple")], "Fruits come in many colors."),
    _mcq("What comes next: 2, 4, 6, __?", ["7", "8", "9", "10"], 1, "Count by twos: 8 comes next."),
    _order("Order the sizes from small to big", ["Ant", "Mouse", "Dog", "Horse"], "From tiniest ant to big horse."),
    _match("Match the number to its name", [("1", "One"), ("2", "Two"), ("3", "Three"), ("4", "Four")], "Numbers have names too!"),
    _order("Put the morning routine in order", ["Wake up", "Brush teeth", "Eat breakfast", "Go to school"], "First wake up, then off to school."),
    _match("Match the country to its capital", [("Nepal", "Kathmandu"), ("India", "Delhi"), ("China", "Beijing"), ("Japan", "Tokyo")], "Each country has a capital city."),
    _mcq("How many sides does a pentagon have?", ["3", "4", "5", "6"], 2, "A pentagon has 5 sides."),
    _order("Order the seasons starting from spring", ["Spring", "Summer", "Autumn", "Winter"], "Seasons cycle through the year."),
    _match("Match the body part to its use", [("Eyes", "See"), ("Ears", "Hear"), ("Nose", "Smell"), ("Tongue", "Taste")], "Each body part has a job."),
    _speak("Say the answer out loud: What is two plus two?", "four", ["4", "four", "char", "चार"], "Two and two make four."),
    _speak("Say it out loud: What color is the sky on a sunny day?", "blue", ["blue", "nilo", "निलो"], "The sky is blue on a clear day."),
]


# ---------- Subject-specific puzzles (mixed into the category packs) ----------
MATH_PUZZLES = [
    _order("Order from smallest to biggest", ["5", "10", "15", "20"], "Smallest is 5, biggest is 20."),
    _match("Match the shape to its sides", [("Triangle", "3"), ("Square", "4"), ("Pentagon", "5"), ("Hexagon", "6")], "Count the sides of each shape."),
    _order("Order these numbers", ["2", "4", "6", "8"], "Counting by twos."),
    _match("Match the number to its double", [("2", "4"), ("3", "6"), ("4", "8"), ("5", "10")], "Double means add it to itself."),
    _order("Arrange from lightest to heaviest", ["Feather", "Apple", "Brick", "Car"], "A feather is lightest of all."),
    _speak("Say the answer out loud: What is five plus five?", "ten", ["10", "ten", "das", "दश"], "Five and five make ten."),
]

NEPALI_PUZZLES = [
    _match("Match the Nepali word to its meaning", [("आमा", "Mother"), ("पानी", "Water"), ("घर", "House"), ("रुख", "Tree")], "Common Nepali words."),
    _order("Order the Nepali vowels", ["अ", "आ", "इ", "ई"], "The first vowels of the alphabet."),
    _match("Match the color word", [("रातो", "Red"), ("हरियो", "Green"), ("निलो", "Blue"), ("पहेंलो", "Yellow")], "Colors in Nepali."),
    _order("Order the numbers in Nepali", ["एक", "दुई", "तीन", "चार"], "One, two, three, four."),
    _match("Match the body part", [("हात", "Hand"), ("आँखा", "Eye"), ("कान", "Ear"), ("नाक", "Nose")], "Body parts in Nepali."),
    _speak("Say it out loud: What is the Nepali word for water?", "पानी", ["pani", "paani", "पानी", "water"], "पानी means water."),
]

SCIENCE_PUZZLES = [
    _match("Match the animal to its baby", [("Dog", "Puppy"), ("Cat", "Kitten"), ("Cow", "Calf"), ("Hen", "Chick")], "Baby animal names."),
    _order("Order the butterfly life cycle", ["Egg", "Caterpillar", "Cocoon", "Butterfly"], "How a butterfly grows."),
    _match("Match the body part to its sense", [("Eyes", "See"), ("Ears", "Hear"), ("Nose", "Smell"), ("Tongue", "Taste")], "Each sense organ has a job."),
    _order("Order the planets from the Sun", ["Mercury", "Venus", "Earth", "Mars"], "Closest to farthest from the Sun."),
    _match("Match the animal to its home", [("Bird", "Nest"), ("Bee", "Hive"), ("Dog", "Kennel"), ("Fish", "Water")], "Where animals live."),
    _speak("Say the answer out loud: What do bees make?", "honey", ["honey", "maha", "मह"], "Bees make sweet honey."),
]


def _interleave(mcqs: list, puzzles: list) -> list:
    """Spread puzzle questions through the MCQ list for variety per level."""
    out: list = []
    pi = 0
    for i, q in enumerate(mcqs):
        out.append(q)
        if (i + 1) % 4 == 0 and pi < len(puzzles):
            out.append(puzzles[pi])
            pi += 1
    while pi < len(puzzles):
        out.append(puzzles[pi])
        pi += 1
    return out


# Mixed category packs: existing MCQs + interleaved match/order puzzles.
SUBJECT_PACK_MIXED = {
    "math": _interleave(MATH_QUESTIONS, MATH_PUZZLES),
    "nepali": _interleave(NEPALI_QUESTIONS, NEPALI_PUZZLES),
    "science": _interleave(SCIENCE_QUESTIONS, SCIENCE_PUZZLES),
}
