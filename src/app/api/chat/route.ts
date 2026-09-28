import { NextRequest, NextResponse } from 'next/server';
import { 
  ROOM_DATA, 
  PERIOD_TIMINGS, 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  RoomSchedule,
  getConsecutiveFreePeriods, 
  getNextFreePeriodIndex, 
  getTotalFreePeriods, 
  getCurrentPeriodFromTime, 
  getCurrentDayOfWeek 
} from '@/data/roomData';

interface ChatRequestBody {
  message?: string;
  prompt?: string;
  query?: string;
  day?: string;
  period?: number;
}

function isTanglishQuery(query: string): boolean {
  const q = query.toLowerCase();
  const tanglishKeywords = [
    'pathi', 'pathhi', 'solla', 'sollu', 'solanm', 'sollanum', 'solunga',
    'edutha', 'edukalama', 'eduthaal', 'eduka', 'poren', 'porenu', 'korayum',
    'koraum', 'koraiyum', 'korayuma', 'ethana', 'ithana', 'evlo', 'evvalavu',
    'naal', 'naalu', 'enna', 'aagum', 'mudiyuma', 'kooduma', 'yerum', 'eruma',
    'iruka', 'kudathu', 'koodathu', 'panna', 'pannalama', 'venum', 'venuma',
    'enga', 'polam', 'ukkaralaam', 'ukkaralama', 'padikka', 'padika',
    'inum', 'neram', 'kazhithu', 'kazhichu', 'mani', 'iruken', 'katamatikithu',
    'solunga', 'theriyuma', 'keta', 'ippo', 'inniku', 'naalaiku'
  ];
  return tanglishKeywords.some(kw => q.includes(kw));
}

/**
 * Extracts numeric count of rooms requested (e.g. "2 ac room" -> 2, "3 rooms" -> 3, "rendu" -> 2)
 */
function extractRoomCount(query: string): number {
  const q = query.toLowerCase();

  const digitMatch = q.match(/(\d+)\s*(?:ac\s*)?(?:room|rooms|class|classes|vakuppu)/i);
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10);
    if (!isNaN(n) && n > 0 && n <= 10) return n;
  }

  if (/\b(two|rendu|irandu|2)\b/i.test(q)) return 2;
  if (/\b(three|moonu|moondru|3)\b/i.test(q)) return 3;
  if (/\b(four|naalu|nangu|4)\b/i.test(q)) return 4;
  if (/\b(five|anju|aindhu|5)\b/i.test(q)) return 5;
  if (/\b(one|oru|or|1)\b/i.test(q)) return 1;

  return 1;
}

/**
 * Extracts requested duration or future offset in hours (e.g. "2 hours" -> 2, "3 hours" -> 3)
 */
function extractHours(query: string): number {
  const q = query.toLowerCase();

  const match = q.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs|mani|manineram)/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0 && val <= 10) return val;
  }

  if (/\b(two|rendu|irandu)\s*(?:hour|hours|hr|hrs|mani)/i.test(q)) return 2;
  if (/\b(three|moonu|moondru)\s*(?:hour|hours|hr|hrs|mani)/i.test(q)) return 3;
  if (/\b(four|naalu|nangu)\s*(?:hour|hours|hr|hrs|mani)/i.test(q)) return 4;
  if (/\b(one|oru)\s*(?:hour|hours|hr|hrs|mani)/i.test(q)) return 1;

  return 0;
}

/**
 * Finds the period corresponding to a specific clock time or time offset
 */
function getPeriodForTimeMinutes(totalMinutes: number): number {
  const periodMinuteBounds = [
    { period: 1, start: 8 * 60 + 30, end: 9 * 60 + 20 },
    { period: 2, start: 9 * 60 + 20, end: 10 * 60 + 10 },
    { period: 3, start: 10 * 60 + 25, end: 11 * 60 + 15 },
    { period: 4, start: 11 * 60 + 15, end: 12 * 60 + 5 },
    { period: 5, start: 12 * 60 + 5, end: 12 * 60 + 55 },
    { period: 6, start: 13 * 60 + 40, end: 14 * 60 + 30 },
    { period: 7, start: 14 * 60 + 30, end: 15 * 60 + 20 },
    { period: 8, start: 15 * 60 + 25, end: 16 * 60 + 15 },
    { period: 9, start: 16 * 60 + 15, end: 17 * 60 + 5 },
  ];

  for (const p of periodMinuteBounds) {
    if (totalMinutes >= p.start && totalMinutes < p.end) {
      return p.period;
    }
  }

  if (totalMinutes < periodMinuteBounds[0].start) return 1;
  if (totalMinutes >= periodMinuteBounds[periodMinuteBounds.length - 1].end) return 9;

  for (let i = 0; i < periodMinuteBounds.length - 1; i++) {
    if (totalMinutes >= periodMinuteBounds[i].end && totalMinutes < periodMinuteBounds[i + 1].start) {
      return periodMinuteBounds[i + 1].period;
    }
  }

  return 1;
}

/**
 * Real-Time Campus Room Schedule & Vacancy Intelligence Engine
 * Comprehensive multi-period, present time, and future forecast analysis
 */
function handleAdvancedRoomLocatorAIResponse(
  query: string,
  providedDay?: string,
  providedPeriod?: number
): string {
  const q = query.toLowerCase();
  const isTanglish = isTanglishQuery(query);

  // 1. Live Actual System Clock Time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const realLivePeriod = getCurrentPeriodFromTime(now);
  const realLiveDay = getCurrentDayOfWeek(now);
  const realTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 2. Day of Week Resolution
  let targetDay: DayOfWeek = (providedDay as DayOfWeek) || realLiveDay;
  if (q.includes('monday') || q.includes('thingal') || q.includes('somavaaram')) targetDay = 'Monday';
  else if (q.includes('tuesday') || q.includes('sevva') || q.includes('sevvai')) targetDay = 'Tuesday';
  else if (q.includes('wednesday') || q.includes('buthan') || q.includes('budhan')) targetDay = 'Wednesday';
  else if (q.includes('thursday') || q.includes('viyazh') || q.includes('guru')) targetDay = 'Thursday';
  else if (q.includes('friday') || q.includes('velli')) targetDay = 'Friday';
  else if (q.includes('today') || q.includes('inniku') || q.includes('indru')) targetDay = realLiveDay;
  else if (q.includes('tomorrow') || q.includes('naalaiku') || q.includes('naalai')) {
    const dayOrder: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const curIdx = dayOrder.indexOf(realLiveDay);
    targetDay = dayOrder[(curIdx + 1) % 5];
  }

  // 3. User Parameters Extraction
  const roomCountNeeded = extractRoomCount(query);
  const requestedHours = extractHours(query);
  const wantsAC = /ac|air\s*condition|cool|kulir/i.test(q);
  const wantsLab = /lab|practical|computer/i.test(q);
  const isFutureOffset = /inum|after|later|kazhithu|kazhichu|in\s*\d+\s*hour/i.test(q);

  // 4. UI Selected Period vs Live Current Period
  const uiPeriod = providedPeriod || realLivePeriod;

  // Explicit period in text (e.g. "period 1", "period 3")
  const periodMatch = q.match(/(?:period|p|vakuppu)\s*([1-9])/i) || q.match(/([1-9])(?:st|nd|rd|th)?\s*(?:period|p\b)/i);
  let explicitPeriod = 0;
  if (periodMatch) {
    explicitPeriod = parseInt(periodMatch[1], 10);
  }

  // Calculate target future time point if "in 2 hours" is requested
  const offsetMinutes = requestedHours > 0 ? Math.round(requestedHours * 60) : 120;
  const futureClockMinutes = currentMinutes + offsetMinutes;
  const periodInFutureFromNow = getPeriodForTimeMinutes(futureClockMinutes);

  // Period in future from UI period (each period is approx 50 mins + break)
  const periodsToSkip = Math.max(1, Math.round(offsetMinutes / 55));
  const periodInFutureFromUI = Math.min(9, uiPeriod + periodsToSkip);

  // Floor matching
  const floorMatch = q.match(/(ground|2nd|4th|5th|6th|7th|second|fourth|fifth|sixth|seventh)\s*(?:floor|thalam)?/i);
  let targetFloor = '';
  if (floorMatch) {
    const fStr = floorMatch[1].toLowerCase();
    if (fStr.includes('ground')) targetFloor = 'Ground Floor';
    else if (fStr.includes('2') || fStr.includes('second')) targetFloor = '2nd Floor';
    else if (fStr.includes('4') || fStr.includes('fourth')) targetFloor = '4th Floor';
    else if (fStr.includes('5') || fStr.includes('fifth')) targetFloor = '5th Floor';
    else if (fStr.includes('6') || fStr.includes('sixth')) targetFloor = '6th Floor';
    else if (fStr.includes('7') || fStr.includes('seventh')) targetFloor = '7th Floor';
  }

  // Target specific room
  const specificRoom = ROOM_DATA.find(r => {
    const rLower = r.room.toLowerCase();
    if (q.includes(rLower)) return true;
    const numMatch = r.room.match(/\d+/);
    if (numMatch && q.includes(numMatch[0])) return true;
    if (q.includes('lab') && r.room.toLowerCase().includes('lab')) return true;
    return false;
  });

  // =========================================================================
  // SCENARIO 1: SPECIFIC ROOM LOOKUP (e.g. "IST 227 eppo free?", "IST 108 Lab status")
  // =========================================================================
  if (specificRoom) {
    const pIdx = Math.min(8, Math.max(0, (explicitPeriod || uiPeriod) - 1));
    const schedule = specificRoom.occupied[targetDay] || [];
    const isFreeAtP = schedule[pIdx] === 0;
    const isFreeNow = schedule[realLivePeriod - 1] === 0;
    const consecutiveNow = isFreeNow ? getConsecutiveFreePeriods(specificRoom, targetDay, realLivePeriod - 1) : 0;
    const totalFree = getTotalFreePeriods(specificRoom, targetDay);

    const freeList = schedule
      .map((s, i) => s === 0 ? `Period ${i + 1} (${PERIOD_TIMINGS[i].startTime} - ${PERIOD_TIMINGS[i].endTime})` : null)
      .filter(Boolean);

    return `🏛️ **Room Status Analysis &bull; ${specificRoom.room} (${specificRoom.floor})**

📍 **அமைவிடம்:** ${specificRoom.floor} &bull; ${specificRoom.isAC ? '❄️ Air Conditioned (AC)' : '💨 Non-AC'}
⏰ **தற்போதைய நேரம் (Live Clock):** **${realTimeStr} &bull; Period ${realLivePeriod} (${PERIOD_TIMINGS[realLivePeriod - 1].timeRange})**
📌 **UI-ல் நீங்கள் பார்த்த பீரியட்:** Period ${uiPeriod}

📊 **நேரலை இருப்பு நிலை (Live Availability Status):**
• ${isFreeNow 
    ? `🟢 **தற்போது இந்த அறை காலியாக உள்ளது (FREE RIGHT NOW)!**
  - **தொடர் இலவச நேரம்:** அடுத்த **${consecutiveNow} பீரியட்களுக்கு (Periods ${realLivePeriod} முதல் ${realLivePeriod + consecutiveNow - 1} வரை)** தொடர்ச்சியாகக் காலியாக இருக்கும்!
  - **முடிவு நேரம்:** **${PERIOD_TIMINGS[Math.min(realLivePeriod + consecutiveNow - 2, 8)].endTime} வரை** நீங்கள் தாராளமாக அமரலாம்.`
    : `🔴 **தற்போது வகுப்பு நடைபெறுகிறது (Class Active Right Now).**
  - ${getNextFreePeriodIndex(specificRoom, targetDay, realLivePeriod - 1) !== -1 ? `அடுத்ததாக **Period ${getNextFreePeriodIndex(specificRoom, targetDay, realLivePeriod - 1) + 1} (${PERIOD_TIMINGS[getNextFreePeriodIndex(specificRoom, targetDay, realLivePeriod - 1)].startTime})**-ல் காலியாகும்.` : 'இன்று மீதி நேரம் முழுவதும் வகுப்பு உள்ளது.'}`}

📅 **${targetDay} அன்று இந்த வகுப்பறை காலியாக இருக்கும் நேரங்கள் (${totalFree} of 9 பீரியட்கள்):**
${freeList.length > 0 ? freeList.map(s => `  • ✅ ${s}`).join('\n') : '  • ❌ இன்று எந்த பீரியடும் காலியாக இல்லை.'}

💡 **வசதிகள்:** ${specificRoom.isAC ? '❄️ High Cooling AC' : '💨 Natural Air'}, Campus 5G Wi-Fi, Digital Smartboard, Wall Power Sockets for Laptops.`;
  }

  // =========================================================================
  // SCENARIO 2: COMPLEX "2 AC ROOMS IN 2 HOURS" / MULTI-ROOM / MULTI-PERIOD QUERY
  // =========================================================================
  // Analysis A: Rooms free starting NOW for at least 2 consecutive periods
  const activePeriod = realLivePeriod;
  const pIdxNow = activePeriod - 1;

  let candidatesNow = ROOM_DATA.filter(r => (r.occupied[targetDay]?.[pIdxNow] ?? 1) === 0);
  if (wantsAC) candidatesNow = candidatesNow.filter(r => r.isAC);
  if (targetFloor) candidatesNow = candidatesNow.filter(r => r.floor === targetFloor);

  const rankedNow = candidatesNow.map(r => {
    const consecutive = getConsecutiveFreePeriods(r, targetDay, pIdxNow);
    const score = (r.isAC ? 100 : 20) + consecutive * 25;
    return { room: r, consecutive, score };
  }).sort((a, b) => b.score - a.score);

  // Analysis B: Rooms free in 2 hours from now (Period periodInFutureFromNow)
  const pIdxFuture = Math.min(8, Math.max(0, periodInFutureFromNow - 1));
  let candidatesFuture = ROOM_DATA.filter(r => (r.occupied[targetDay]?.[pIdxFuture] ?? 1) === 0);
  if (wantsAC) candidatesFuture = candidatesFuture.filter(r => r.isAC);
  if (targetFloor) candidatesFuture = candidatesFuture.filter(r => r.floor === targetFloor);

  // Analysis C: Rooms free from UI Period (e.g. Period 1)
  const pIdxUI = Math.min(8, Math.max(0, uiPeriod - 1));
  let candidatesUI = ROOM_DATA.filter(r => (r.occupied[targetDay]?.[pIdxUI] ?? 1) === 0);
  if (wantsAC) candidatesUI = candidatesUI.filter(r => r.isAC);

  // If user requested specifically "2 AC rooms in 2 hours"
  if (roomCountNeeded >= 2 || isFutureOffset || requestedHours > 0) {
    const targetRoomCount = Math.max(2, roomCountNeeded);
    const selectedMatchesNow = rankedNow.slice(0, targetRoomCount);
    const selectedMatchesFuture = candidatesFuture.slice(0, targetRoomCount);

    return `🏛️ **VibeCraft Campus AI Scout &bull; Multi-Period Availability Analysis**

📅 **அட்டவணை நாள்:** **${targetDay}**
⏰ **கல்லூரி நேரலை நேரம் (Live Clock):** **${realTimeStr} &bull; Period ${realLivePeriod} (${PERIOD_TIMINGS[realLivePeriod - 1].timeRange})**
📌 **UI-ல் நீங்கள் தற்போது தேர்வு செய்துள்ள பீரியட்:** Period ${uiPeriod}

---

### 🏆 **1. உங்களுக்கான ${targetRoomCount} AC வகுப்பறைகள் (Direct Match):**
${selectedMatchesNow.length >= targetRoomCount ? (
  `தற்போது நேரலை நேரத்தில் (**${realTimeStr} - Period ${realLivePeriod}**) அடுத்த **${requestedHours || 2} மணி நேரத்திற்கு (Periods ${realLivePeriod} முதல் 9 வரை)** தொடர்ந்து காலியாக உள்ள ${targetRoomCount} சிறந்த AC வகுப்பறைகள்:\n\n` +
  selectedMatchesNow.map((m, idx) => {
    const endP = pIdxNow + m.consecutive - 1;
    const endT = PERIOD_TIMINGS[Math.min(endP, 8)];
    return `✅ **அறை ${idx + 1}: ${m.room.room}** (${m.room.floor})
   • **குளிர்சாதன வசதி:** ❄️ Air Conditioned (High Cooling)
   • **காலியாய் இருக்கும் நேரம்:** **${PERIOD_TIMINGS[pIdxNow].startTime} முதல் ${endT.endTime} வரை** (தொடர்ந்து **${m.consecutive} பீரியட்கள்** Free!)
   • **அமைவிடம் & வசதிகள்:** ${m.room.floor} &bull; Wi-Fi 5G &bull; லேப்டாப் சார்ஜிங் சாக்கெட் &bull; ப்ராஜெக்டர் உள்ளது.`;
  }).join('\n\n')
) : (
  `தற்போது நேரலை நேரத்தில் ${selectedMatchesNow.length} AC அறைகள் கிடைக்கின்றன:\n` +
  selectedMatchesNow.map(m => `• **${m.room.room}** (${m.room.floor}) - ${m.consecutive} பீரியட்கள் Free`).join('\n')
)}

---

### ⏳ **2. இன்னும் 2 மணி நேரம் கழித்து (In 2 Hours &bull; Period ${periodInFutureFromNow} - ${PERIOD_TIMINGS[pIdxFuture].timeRange}):**
இன்னும் 2 மணி நேரம் கழித்து நீங்கள் செல்ல விரும்பினால், அப்போது காலியாக இருக்கும் ${wantsAC ? 'AC ' : ''}வகுப்பறைகள்:
${candidatesFuture.length > 0 ? (
  candidatesFuture.slice(0, 4).map(r => {
    const cons = getConsecutiveFreePeriods(r, targetDay, pIdxFuture);
    return `• 🟢 **${r.room}** (${r.floor}) ${r.isAC ? '❄️ [AC]' : '[Non-AC]'}: Period ${periodInFutureFromNow} முதல் காலியாக இருக்கும்!`;
  }).join('\n')
) : '• ⚠️ அந்த நேரத்தில் வகுப்புகள் முழுவீச்சில் நடைபெறுகின்றன.'}

---

### 🔍 **3. UI Selected Period (Period ${uiPeriod} - ${PERIOD_TIMINGS[pIdxUI].timeRange}) அடிப்படையில்:**
நீங்கள் திரையில் Period ${uiPeriod}-ல் இருந்தாலும், அந்த குறிப்பிட்ட பீரியடில் காலியாக உள்ள வகுப்பறைகள்:
${candidatesUI.length > 0 ? (
  candidatesUI.slice(0, 3).map(r => {
    const cons = getConsecutiveFreePeriods(r, targetDay, pIdxUI);
    return `• **${r.room}** (${r.floor}) ${r.isAC ? '❄️ [AC]' : '[Non-AC]'}: ${cons} பீரியட்கள் Free`;
  }).join('\n')
) : '• Period ' + uiPeriod + '-ல் AC வகுப்பறைகள் எதுவும் காலியாக இல்லை.'}

💡 **Campus Hack:**
${targetDay === 'Monday' 
  ? 'திங்கட்கிழமை மதியத்திற்குப் பிறகு **2nd Floor (IST 227, IST 225)** மற்றும் **4th Floor (IST 416)** ஆகிய மூன்றுமே தொடர்ந்து காலியாக இருக்கும். நீங்கள் 2 முதல் 3 குழுக்களாகப் பிரிந்து கூட அமர்ந்து ப்ராஜெக்ட் வேலைகளைச் செய்யலாம்!'
  : 'அதிக நேரம் uninterrupted-ஆக உட்கார 2nd Floor IST 225 அல்லது 4th Floor IST 416 மிகவும் சிறந்தது!'}`;
  }

  // =========================================================================
  // SCENARIO 3: GENERAL ROOM INQUIRY (Any question, any language)
  // =========================================================================
  const allFreeNow = ROOM_DATA.filter(r => (r.occupied[targetDay]?.[pIdxNow] ?? 1) === 0);
  const acFreeNow = allFreeNow.filter(r => r.isAC);
  const occupiedNow = ROOM_DATA.filter(r => (r.occupied[targetDay]?.[pIdxNow] ?? 1) === 1);

  const topPick = rankedNow[0] || { room: allFreeNow[0], consecutive: 1 };
  const topEndIdx = pIdxNow + topPick.consecutive - 1;
  const topEndTiming = PERIOD_TIMINGS[Math.min(topEndIdx, 8)];

  return `🏫 **VibeCraft Campus AI Scout &bull; Live Room Availability Report**

📅 **அட்டவணை நாள்:** **${targetDay}**
⏰ **கல்லூரி நேரலை நேரம் (Live Clock):** **${realTimeStr} &bull; Period ${realLivePeriod} (${PERIOD_TIMINGS[realLivePeriod - 1].timeRange})**
📌 **UI Selected Period:** Period ${uiPeriod}

${isTanglish 
  ? `தற்போது கல்லூரியில் மொத்தம் **${allFreeNow.length} வகுப்பறைகள் காலியாக (FREE)** உள்ளன! அதில் **${acFreeNow.length} AC அறைகள்** அடங்கும்:\n` 
  : `Currently **${allFreeNow.length} out of 10 rooms** are FREE right now (including **${acFreeNow.length} AC rooms**):\n`}
⭐ **AI பரிந்துரைக்கும் சிறந்த இடம் (Top Pick):**
┌────────────────────────────────────────────────────────┐
│ 🏆 **${topPick.room.room}** &bull; **${topPick.room.floor}** ${topPick.room.isAC ? '(❄️ AC Room)' : ''}
│ 🟢 **Free for ${topPick.consecutive} consecutive periods** (${PERIOD_TIMINGS[pIdxNow].startTime} to ${topEndTiming.endTime})
│ ⚡ அமைதியான சூழல் &bull; சார்ஜிங் சாக்கெட் &bull; ப்ராஜெக்டர் & Wi-Fi வசதி உள்ளது!
└────────────────────────────────────────────────────────┘

📋 **தற்போது காலியாக உள்ள அனைத்து வகுப்பறைகள் (Vacant Rooms):**
${(wantsAC ? acFreeNow : allFreeNow).map(r => {
  const cons = getConsecutiveFreePeriods(r, targetDay, pIdxNow);
  const endT = PERIOD_TIMINGS[Math.min(pIdxNow + cons - 1, 8)];
  return `• 🟢 **${r.room}** (${r.floor}) ${r.isAC ? '❄️ [AC]' : '[Non-AC]'}: **${cons} பீரியட்கள் Free** (${PERIOD_TIMINGS[pIdxNow].startTime} முதல் ${endT.endTime} வரை)`;
}).join('\n')}

🚫 **தற்போது வகுப்பு நடைபெறும் அறைகள் (Occupied Rooms):**
${occupiedNow.slice(0, 4).map(r => {
  const nxt = getNextFreePeriodIndex(r, targetDay, pIdxNow);
  return `• 🔴 **${r.room}** (${r.floor}): ${nxt !== -1 ? `அடுத்ததாக Period ${nxt + 1}-ல் காலியாகும் (${PERIOD_TIMINGS[nxt].startTime})` : 'இன்று மீதி நேரம் முழுவதும் Occupied'}`;
}).join('\n')}${occupiedNow.length > 4 ? `\n• *... மற்றும் ${occupiedNow.length - 4} அறைகள் பிஸியாக உள்ளன.*` : ''}

💡 **Campus Pro-Tip:**
உங்களுக்கு 2 அல்லது அதற்கு மேற்பட்ட AC அறைகள் தேவைப்பட்டால் அல்லது 2 மணி நேரத்திற்கு மேல் அமர விரும்பினால் *"enaku 2 ac room venum inum 2 hours la"* என்று கேளுங்கள்!`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const userMessage = body.message || body.prompt || body.query;

    if (!userMessage) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Process every query through the advanced Room & Timetable AI Scout Engine
    const reply = handleAdvancedRoomLocatorAIResponse(userMessage, body.day, body.period);
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error processing campus room query';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
