"""Default learning content used when a parent has NOT uploaded a book.

The app ships with ``Backend/markdown.md`` — a structured export of a Grade 5
English textbook (17 units, each with learning outcomes and exercises). That
markdown is the "default thing to generate from": when there is nothing
uploaded, question generation is grounded in this content.

This module:
- loads + cleans the markdown into ``DEFAULT_BOOK_TEXT`` (used to ground the
  Gemini generator and the voice tutor), and
- provides ``DEFAULT_QUESTIONS`` — a curated, *voice-heavy* offline bank that
  mirrors the markdown's themes (greetings, question words, polite words,
  opposites, tenses, ...) so the feature works even with no API key.
"""

from __future__ import annotations

from pathlib import Path

from .questions import _match, _mcq, _order, _speak

# --------------------------------------------------------------------------
# Markdown source text (grounding for the AI + voice tutor)
# --------------------------------------------------------------------------

_FALLBACK_BOOK_TEXT = (
    "Grade 5 English. Units cover meeting people and greetings, possession, "
    "getting information with question words, requesting and apologising, "
    "thanking and congratulating, quantity, comparisons, describing location, "
    "facts, instructions and directions, past events, giving reasons, "
    "describing people and places, likes and dislikes, ability with can/could, "
    "agreeing and disagreeing, and future plans."
)


def _load_book_text() -> str:
    """Read markdown.md and keep only the clean unit content (from 'Unit 1')."""
    try:
        md_path = Path(__file__).resolve().parents[2] / "markdown.md"
        raw = md_path.read_text(encoding="utf-8")
    except Exception:
        return _FALLBACK_BOOK_TEXT

    # The export has a noisy chat header; the real content starts at the first
    # "# Unit 1" heading. Keep everything from there.
    marker = raw.find("# Unit 1")
    cleaned = raw[marker:] if marker != -1 else raw
    cleaned = cleaned.strip()
    return cleaned or _FALLBACK_BOOK_TEXT


DEFAULT_BOOK_TEXT: str = _load_book_text()


# --------------------------------------------------------------------------
# Voice-heavy default question bank (offline fallback)
# --------------------------------------------------------------------------
# Themed on the markdown units. SPEAK (voice) questions come first and there
# are deliberately MORE of them so the default experience is voice-led.

DEFAULT_SPEAK = [
    _speak(
        "Say a word you use to greet someone when you meet them.",
        "hello",
        ["hello", "hi", "namaste", "good morning", "hey"],
        "We greet people with words like hello, hi, or namaste.",
    ),
    _speak(
        "Say what you tell a friend when you leave.",
        "goodbye",
        ["goodbye", "bye", "see you", "namaste", "bye bye"],
        "We say goodbye or bye when we leave.",
    ),
    _speak(
        "Someone gives you a nice gift. Say the polite words.",
        "thank you",
        ["thank you", "thanks", "thank you very much", "thanks a lot"],
        "We say thank you when someone helps or gives us something.",
    ),
    _speak(
        "You bumped into someone by mistake. Say the word to apologise.",
        "sorry",
        ["sorry", "i am sorry", "i'm sorry", "excuse me"],
        "We say sorry when we make a mistake.",
    ),
    _speak(
        "Say the question word you use to ask about a place.",
        "where",
        ["where"],
        "We ask 'where' about a place.",
    ),
    _speak(
        "Say the question word you use to ask about a time.",
        "when",
        ["when"],
        "We ask 'when' about a time.",
    ),
    _speak(
        "Say the number that comes right after nine.",
        "ten",
        ["ten", "10"],
        "After nine comes ten.",
    ),
    _speak(
        "Say the opposite of the word 'big'.",
        "small",
        ["small", "little", "tiny"],
        "The opposite of big is small.",
    ),
    _speak(
        "Say the opposite of the word 'hot'.",
        "cold",
        ["cold", "cool"],
        "The opposite of hot is cold.",
    ),
    _speak(
        "Say the past tense of the verb 'go'.",
        "went",
        ["went"],
        "The past tense of go is went.",
    ),
    _speak(
        "Finish out loud: 'I can ...' — say one thing you are able to do.",
        "i can",
        ["i can", "can", "run", "jump", "swim", "read", "sing", "dance"],
        "We use 'I can' to talk about things we are able to do.",
    ),
    _speak(
        "Say the colour of the sky on a clear sunny day.",
        "blue",
        ["blue", "nilo"],
        "The sky looks blue on a clear day.",
    ),
]

DEFAULT_MCQ = [
    _mcq(
        "Which word is a greeting?",
        ["Hello", "Table", "Run", "Blue"],
        0,
        "Hello is a way to greet someone.",
    ),
    _mcq(
        "Which question word do we use to ask about time?",
        ["Where", "When", "Who", "Which"],
        1,
        "We use 'when' to ask about time.",
    ),
    _mcq(
        "Which is the polite word to ask for something?",
        ["Please", "Stop", "Mine", "No"],
        0,
        "We say 'please' when we ask for something.",
    ),
    _mcq(
        "Which is the past tense of 'play'?",
        ["plays", "played", "playing", "play"],
        1,
        "Add -ed: play becomes played.",
    ),
    _mcq(
        "Which sentence is correct?",
        [
            "She go to school.",
            "She goes to school.",
            "She going school.",
            "She gone school.",
        ],
        1,
        "With she/he/it we add -s: she goes.",
    ),
    _mcq(
        "What is the plural of 'book'?",
        ["book", "books", "bookes", "bookss"],
        1,
        "Add -s to make it plural: books.",
    ),
]

DEFAULT_MATCH = [
    _match(
        "Match the question word to what it asks about.",
        [("Who", "Person"), ("Where", "Place"), ("When", "Time"), ("What", "Thing")],
        "Each question word asks about something different.",
    ),
    _match(
        "Match the word to its opposite.",
        [("Big", "Small"), ("Hot", "Cold"), ("Fast", "Slow"), ("Up", "Down")],
        "These words are opposites.",
    ),
    _match(
        "Match the polite expression to the situation.",
        [
            ("Thank you", "You got a gift"),
            ("Sorry", "You made a mistake"),
            ("Please", "You ask for help"),
            ("Hello", "You meet someone"),
        ],
        "We use polite words in different situations.",
    ),
    _match(
        "Match the pronoun to the right noun.",
        [("He", "Boy"), ("She", "Girl"), ("It", "Dog"), ("They", "Children")],
        "Pronouns take the place of nouns.",
    ),
]

DEFAULT_ORDER = [
    _order(
        "Put these greetings in order from morning to night.",
        ["Good morning", "Good afternoon", "Good evening", "Good night"],
        "We greet differently through the day.",
    ),
    _order(
        "Order the numbers from smallest to biggest.",
        ["one", "two", "three", "four"],
        "One is smallest, four is biggest.",
    ),
    _order(
        "Put the morning routine in the correct order.",
        ["Wake up", "Brush teeth", "Eat breakfast", "Go to school"],
        "First we wake up, then off to school.",
    ),
    _order(
        "Arrange the words to make a sentence.",
        ["I", "am", "very", "happy"],
        "The words make: I am very happy.",
    ),
]

# Speak first so the default lessons lead with voice practice.
DEFAULT_QUESTIONS = DEFAULT_SPEAK + DEFAULT_MCQ + DEFAULT_MATCH + DEFAULT_ORDER
