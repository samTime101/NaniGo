# Battle Puzzles - Interactive Multiplayer Games

## Available Puzzle Components

### 1. **WordPuzzle** (`WordPuzzle.tsx`)
**Scrambled Letter Word Building**
- Players tap scrambled letters to build the correct word
- Letters can be tapped in sequence to build the word
- Wrong attempts shake and reset
- Visual feedback with color changes
- Auto-checks when word is complete

**Usage:**
```tsx
<WordPuzzle 
  word="HELLO" 
  onCorrect={() => console.log('Solved!')} 
/>
```

---

### 2. **MissingLetterPuzzle** (`MissingLetterPuzzle.tsx`)
**Fill in the Missing Letter**
- Shows a word with one letter hidden
- Multiple letter options provided
- Players select the correct missing letter
- Visual feedback for correct/wrong attempts
- Dashed border shows the missing position

**Usage:**
```tsx
<MissingLetterPuzzle 
  word="HELLO" 
  missingIndex={1}
  options={["A", "E", "O", "I"]}
  onCorrect={() => console.log('Correct!')} 
/>
```

---

### 3. **OrderPuzzle** (`OrderPuzzle.tsx`)
**Drag and Drop Ordering**
- Items are scrambled
- Players drag to reorder items
- Tap "Check Order" button to verify
- Shows ✓ or ✗ for each item
- Uses Framer Motion's Reorder component for smooth dragging

**Usage:**
```tsx
<OrderPuzzle 
  sequence={["First", "Second", "Third"]}
  onCorrect={() => console.log('Perfect order!')} 
/>
```

---

### 4. **PicturePuzzle** (`PicturePuzzle.tsx`)
**Picture-Label Matching**
- Grid of images/emojis at top
- List of labels below
- Players tap an image, then tap its matching label
- Matched pairs are greyed out
- All pairs must be matched to complete

**Usage:**
```tsx
<PicturePuzzle 
  pairs={[
    { id: '1', image: '🐶', label: 'Dog' },
    { id: '2', image: '🐱', label: 'Cat' },
    { id: '3', image: '🐭', label: 'Mouse' }
  ]}
  onCorrect={() => console.log('All matched!')} 
/>
```

---

## Integration with Battle Mode

To use these puzzles in the battle screen (`Battle.tsx`), you can:

1. **Add puzzle types to question data:**
```typescript
type PuzzleQuestion = {
  type: 'word' | 'missing' | 'order' | 'picture'
  data: {
    word?: string
    missingIndex?: number
    options?: string[]
    sequence?: string[]
    pairs?: PicturePair[]
  }
}
```

2. **Render puzzles conditionally:**
```tsx
{q.type === 'word' && (
  <WordPuzzle word={q.data.word} onCorrect={handleCorrect} />
)}

{q.type === 'missing' && (
  <MissingLetterPuzzle 
    word={q.data.word}
    missingIndex={q.data.missingIndex}
    options={q.data.options}
    onCorrect={handleCorrect}
  />
)}

{q.type === 'order' && (
  <OrderPuzzle sequence={q.data.sequence} onCorrect={handleCorrect} />
)}

{q.type === 'picture' && (
  <PicturePuzzle pairs={q.data.pairs} onCorrect={handleCorrect} />
)}
```

3. **Scoring system:**
- Each puzzle can track completion time
- Faster completion = higher score
- Bot opponent has randomized completion times
- Multiplayer-ready architecture

---

## Features

✅ **Interactive & Fun** - Drag, tap, and build interactions
✅ **Visual Feedback** - Color changes, animations, sound cues
✅ **Kid-Friendly** - Large buttons, clear visuals, bold text
✅ **Multiplayer Ready** - Can be used in competitive battle mode
✅ **Accessible** - Touch-friendly, clear states, good contrast
✅ **Smooth Animations** - Framer Motion for polished feel

---

## Sound Cues

All puzzles use the existing sound system:
- `cue('correct')` - Success sound
- `cue('wrong')` - Error sound

---

## Styling

Puzzles match the app's kid-friendly design:
- Rounded corners (`rounded-xl`, `rounded-2xl`)
- Bold fonts (`font-extrabold`)
- Vibrant colors (teal, orange, success, heart)
- Large touch targets
- Shadow effects for depth
- Smooth transitions

---

## Next Steps

To fully integrate into battle mode:
1. Update backend to generate puzzle-type questions
2. Modify Battle.tsx to handle different puzzle types
3. Add puzzle questions to the question pool
4. Test multiplayer synchronization
5. Add puzzle-specific scoring bonuses
