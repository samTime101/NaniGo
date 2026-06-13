# Language Feature Implementation Guide

## Overview
The NaniGo app supports three language modes that control how content is displayed throughout the application:

### Language Modes

1. **English Mode (`lang === 'en'`)**
   - All UI text displays in English only
   - Subject titles show in English
   - Question text shows in English
   - **Exception**: Nepali Words subject content always shows both languages for learning purposes

2. **Nepali Mode (`lang === 'np'`)**
   - All UI text displays in Nepali only
   - Subject titles show in Nepali
   - Question text shows in Nepali (when available)
   - **Exception**: Question content that doesn't have Nepali translation falls back to English

3. **Both Mode (`lang === 'both'`)** - DEFAULT
   - All UI text displays in English with Nepali subtitle
   - Subject titles show English with Nepali subtitle
   - Question text shows English with Nepali subtitle
   - This is the recommended mode for bilingual learning

## Implementation Details

### Core Components

#### `lang.tsx` - Language System Core
- `useLang()` hook - Get current language and setter
- `useT()` hook - Get translation function for UI strings
- `getTitle()` helper - Get title with optional subtitle based on language mode
- `Bi` component - Bilingual text component for JSX
- `pick()` helper - Pick language string for non-JSX contexts

#### Key Functions

```typescript
// Get title based on language preference
getTitle(lang, titleEn, titleNp, isNepaliSubject)
// Returns: { main: string, subtitle?: string }

// Translation hook for UI strings
const t = useT()
t('subjects') // Returns translated string based on lang
```

### Updated Files

#### 1. `KidHome.tsx` - Subject Selection Screen
**What Changed:**
- Uses `getTitle()` to get proper titles with subtitles
- Both horizontal and vertical layouts respect language settings
- Displays subject cards with proper language based on selection

**How It Works:**
```typescript
const titleInfo = getTitle(lang, p.title, p.titleNp, p.subject === 'nepali')
// titleInfo.main - Primary title
// titleInfo.subtitle - Optional subtitle (for 'both' mode)
```

#### 2. `LevelMap.tsx` - Level Selection Screen
**What Changed:**
- Header shows pack title based on language setting
- Subtitle only appears in 'both' mode
- Both standard map and 3D PathMap respect language

**How It Works:**
```typescript
const packTitle = lang === 'np' ? pack.titleNp : pack.title
const packSubtitle = lang === 'both' ? pack.titleNp : undefined
```

#### 3. `Game.tsx` - Quiz/Game Screen
**What Changed:**
- Question text respects language settings
- Nepali subject always shows both languages
- Other subjects follow the selected language mode

**How It Works:**
```typescript
const isNepaliSubject = pack.subject === 'nepali'
const questionText = isNepaliSubject || lang === 'en' ? q.text : (q.textNp || q.text)
const showNepaliSubtitle = (isNepaliSubject || lang === 'both') && q.textNp
```

## Usage Examples

### For UI Strings
```typescript
import { useT } from '../../lib/lang'

const t = useT()
<h1>{t('subjects')}</h1>  // Auto translates based on lang
```

### For Bilingual Components
```typescript
import { Bi } from '../../lib/lang'

<Bi en="Math" np="गणित" />
// Shows: "Math" (en mode), "गणित" (np mode), or both with subtitle (both mode)
```

### For Subject Titles
```typescript
import { getTitle, useLang } from '../../lib/lang'

const { lang } = useLang()
const titleInfo = getTitle(lang, pack.title, pack.titleNp, pack.subject === 'nepali')

<div>
  <h1>{titleInfo.main}</h1>
  {titleInfo.subtitle && <h2>{titleInfo.subtitle}</h2>}
</div>
```

## Special Cases

### Nepali Words Subject
The Nepali Words subject ALWAYS shows both English and Nepali text regardless of language setting, because:
- It teaches Nepali vocabulary to English speakers
- Students need to see both languages to learn
- This is the core learning objective of this subject

### Question Content vs UI
- **UI elements** (buttons, labels, navigation) respect language setting strictly
- **Question content** follows language setting but falls back to English if translation missing
- **Nepali subject questions** always show both to facilitate learning

## Testing the Feature

1. **English Mode Test:**
   - Select English in settings
   - All UI should be in English only
   - Subjects show English titles only
   - Exception: Nepali Words subject shows both

2. **Nepali Mode Test:**
   - Select Nepali in settings
   - All UI should be in Nepali only
   - Subjects show Nepali titles only
   - Questions show Nepali when available

3. **Both Mode Test:**
   - Select Both in settings
   - All UI shows English with Nepali subtitle
   - Subject cards show English title + Nepali subtitle
   - Questions show both languages

## Future Enhancements

Potential improvements:
- Add more UI string translations
- Support additional languages
- Per-subject language overrides
- Voice/audio support for both languages
- Parent dashboard language settings

## Troubleshooting

**Issue:** Subjects not showing language correctly
- **Fix:** Check that pack has both `title` and `titleNp` properties

**Issue:** Subtitle not appearing in 'both' mode
- **Fix:** Verify `lang === 'both'` and `titleNp` exists

**Issue:** Question text not respecting language
- **Fix:** Ensure question has `textNp` property when needed
