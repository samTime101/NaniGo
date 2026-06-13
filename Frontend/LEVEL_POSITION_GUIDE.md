# Level Map Position Customization Guide 🗺️

## Two Map Systems in LevelMap.tsx

### 1️⃣ **Simple Zigzag Map** (Default for Math, Science, English)
### 2️⃣ **3D Path Map** (Nepali Words - Candy Crush style)

---

## 🎯 System 1: Simple Zigzag Map

**Location:** Lines 52-106 in `LevelMap.tsx`

### Current Behavior:
- Levels arranged vertically from bottom to top
- Zigzag left-right pattern: Even levels = left (-54px), Odd levels = right (+54px)
- Dotted line connectors between levels
- Chapter banners every 5 levels

### 📍 How to Change Positions:

#### **Horizontal Offset (Left/Right Position)**
```typescript
// LINE 82-83 - Current zigzag pattern
const offset = idx % 2 === 0 ? -54 : 54

// 💡 CUSTOMIZATION IDEAS:

// Option 1: Wider zigzag
const offset = idx % 2 === 0 ? -80 : 80

// Option 2: Straight vertical line (no zigzag)
const offset = 0

// Option 3: Three-lane system (left, center, right)
const offset = idx % 3 === 0 ? -70 : idx % 3 === 1 ? 0 : 70

// Option 4: Wave pattern
const offset = Math.sin(idx * 0.5) * 60

// Option 5: Spiral pattern
const offset = Math.cos(idx * 0.8) * (40 + idx * 2)

// Option 6: Random positions
const offset = (Math.random() - 0.5) * 100
```

#### **Vertical Spacing (Gap Between Levels)**
```typescript
// LINE 100 - Current connector height
<div className="my-1 h-8 w-1 ..." />
//             ↑ vertical margin
//                  ↑ height of connector

// 💡 CUSTOMIZATION IDEAS:

// Tighter spacing
<div className="my-0.5 h-4 w-1 ..." />

// Wider spacing
<div className="my-3 h-12 w-1 ..." />

// Variable spacing (closer at start, wider at end)
<div className={`my-${Math.floor(idx / 5) + 1} h-${(idx % 5) + 4} w-1 ...`} />
```

#### **Chapter Banner Frequency**
```typescript
// LINE 103 - Shows banner every 5 levels
const showChapter = idx % 5 === 0

// 💡 CUSTOMIZATION IDEAS:

// Every 3 levels
const showChapter = idx % 3 === 0

// Every 10 levels
const showChapter = idx % 10 === 0

// Only at specific levels (1, 5, 10, 15)
const showChapter = [0, 4, 9, 14].includes(idx)
```

#### **Custom Layout Example - Three Lanes:**
```typescript
// Replace line 82-83 with:
const lane = idx % 3  // 0, 1, 2
const offset = lane === 0 ? -70 : lane === 1 ? 0 : 70

// This creates:
//    ●           Level 3 (right)
//      ●         Level 2 (center)
//  ●             Level 1 (left)
```

---

## 🎮 System 2: 3D Path Map (Nepali Words)

**Location:** Lines 179-312 in `LevelMap.tsx`

### Current Behavior:
- Levels positioned on a background image (candy-crush style)
- Path curves from bottom-left to top-center
- Background scrolls vertically
- Sine wave for horizontal movement

### 📍 How to Change Positions:

#### **Path Formula (Lines 232-234)**
```typescript
const tt = total > 1 ? idx / (total - 1) : 0
const topPct = 92 - tt * 84          // Vertical (bottom to top)
const leftPct = 50 + 26 * Math.sin(idx * 0.95 + 0.4)  // Horizontal (wave)
```

#### **Understanding the Formula:**

**Vertical Position (topPct):**
```typescript
// Current: 92% (bottom) → 8% (top)
const topPct = 92 - tt * 84

// 💡 CUSTOMIZATION IDEAS:

// Start from very bottom
const topPct = 95 - tt * 90  // 95% → 5%

// Middle to top
const topPct = 50 - tt * 40  // 50% → 10%

// With acceleration (levels closer at top)
const topPct = 92 - Math.pow(tt, 1.5) * 84
```

**Horizontal Position (leftPct):**
```typescript
// Current: Sine wave centered at 50%
const leftPct = 50 + 26 * Math.sin(idx * 0.95 + 0.4)

// 💡 CUSTOMIZATION IDEAS:

// Wider wave (more dramatic curves)
const leftPct = 50 + 40 * Math.sin(idx * 0.95)

// Tighter wave (subtle curves)
const leftPct = 50 + 15 * Math.sin(idx * 0.95)

// S-curve (left to right)
const leftPct = 20 + tt * 60

// Zigzag
const leftPct = idx % 2 === 0 ? 30 : 70

// Spiral inward
const leftPct = 50 + (30 - tt * 25) * Math.sin(idx * 0.8)

// Follow diagonal path
const leftPct = 20 + tt * 60 + 10 * Math.sin(idx * 2)
```

#### **Custom Path Examples:**

**Example 1: Mountain Climb (Sharp Zigzag)**
```typescript
const topPct = 92 - tt * 84
const leftPct = 50 + (idx % 2 === 0 ? -35 : 35)
```

**Example 2: Spiral Staircase**
```typescript
const angle = idx * 0.6  // rotation speed
const radius = 35 - tt * 15  // spiral inward
const topPct = 92 - tt * 84
const leftPct = 50 + radius * Math.sin(angle)
```

**Example 3: Smooth S-Curve**
```typescript
const topPct = 92 - tt * 84
const leftPct = 20 + tt * 60 + 8 * Math.sin(tt * Math.PI)
```

**Example 4: Random Path (Within Bounds)**
```typescript
const topPct = 92 - tt * 84
const leftPct = 30 + Math.random() * 40  // 30% to 70%
```

---

## 🎨 Advanced Customization Ideas

### 1. **Different Paths for Different Subjects**
```typescript
function getPathPosition(idx: number, total: number, subject: string) {
  const tt = total > 1 ? idx / (total - 1) : 0
  
  switch(subject) {
    case 'math':
      return {
        topPct: 92 - tt * 84,
        leftPct: 50  // Straight line
      }
    case 'science':
      return {
        topPct: 92 - tt * 84,
        leftPct: 50 + 30 * Math.sin(idx * 0.6)  // Gentle wave
      }
    case 'nepali':
      return {
        topPct: 92 - tt * 84,
        leftPct: 50 + 26 * Math.sin(idx * 0.95 + 0.4)  // Current wave
      }
    default:
      return { topPct: 92 - tt * 84, leftPct: 50 }
  }
}
```

### 2. **Level Clusters (Group Related Levels)**
```typescript
// Group levels in clusters of 3
const clusterOffset = Math.floor(idx / 3) * 15
const withinCluster = idx % 3
const leftPct = 40 + clusterOffset + withinCluster * 5
```

### 3. **Branching Paths (Multiple Routes)**
```typescript
// Create two parallel paths
const isTopPath = idx % 4 < 2
const topPct = 92 - tt * 84
const leftPct = isTopPath ? 35 : 65
```

---

## 📝 Implementation Steps

### To Change Simple Map (Math/Science):
1. Open `src/screens/kid/LevelMap.tsx`
2. Find line ~82: `const offset = idx % 2 === 0 ? -54 : 54`
3. Replace with your custom formula
4. Save and test in browser

### To Change 3D Path Map (Nepali):
1. Open `src/screens/kid/LevelMap.tsx`
2. Find lines ~232-234 (the topPct/leftPct formulas)
3. Replace with your custom formulas
4. Save and test in browser

---

## 🧪 Testing Tips

1. **Use browser DevTools** to inspect positions
2. **Add temporary borders** to see exact positioning:
   ```typescript
   style={{ 
     top: `${topPct}%`, 
     left: `${leftPct}%`,
     border: '2px solid red'  // Debug helper
   }}
   ```
3. **Console log positions** to verify:
   ```typescript
   console.log(`Level ${seq}: top=${topPct}%, left=${leftPct}%`)
   ```
4. **Test with different numbers of levels** (5, 10, 20, etc.)

---

## 💡 Quick Recipes

**Want a straight vertical line?**
→ Set `offset = 0` (line 82)

**Want wider zigzag?**
→ Change `-54 : 54` to `-80 : 80` (line 82)

**Want 3D path to be straighter?**
→ Reduce the multiplier: `26 * Math.sin` to `10 * Math.sin` (line 234)

**Want path to go left-to-right instead?**
→ Change to: `const leftPct = 20 + tt * 60` (line 234)

**Want random positions?**
→ Use: `const offset = (Math.random() - 0.5) * 100`

---

## 📸 Visual Reference

Current 3D Path (Nepali):
```
     ●              ← Level 5 (top, center-right)
   ●                ← Level 4 (wave left)
     ●              ← Level 3 (wave right)
   ●                ← Level 2 (wave left)
     ●              ← Level 1 (bottom, center-right)
```

The path follows a sine wave from bottom to top!

---

Need help implementing a specific layout? Let me know! 🚀
