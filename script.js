// Game State
let gameState = {
    score: 0,
    wins: 0,
    losses: 0,
    currentChoice: null,
    isPlaying: false,
    roundsPlayed: 0,
    chaosLevel: 0,
    lastButtonPositions: null,
    invertedControls: false,
    multipleChoiceMode: false,
    tutorialShown: false,
    consecutiveWins: 0,
    consecutiveLosses: 0,
    highScore: localStorage.getItem('highScore') || 0,
    achievements: JSON.parse(localStorage.getItem('achievements')) || [],
    themeMode: 'normal', // normal, dark, light
    totalCoinsFlipped: 0,
    perfectRounds: 0
};

// Win Conditions & Achievements
const winConditions = [
    { id: 'first_win', name: 'First Blood', description: 'Win your first round', points: 10, check: () => gameState.wins >= 1 },
    { id: 'five_wins', name: 'Getting Good', description: 'Win 5 rounds', points: 50, check: () => gameState.wins >= 5 },
    { id: 'ten_wins', name: 'Veteran', description: 'Win 10 rounds', points: 100, check: () => gameState.wins >= 10 },
    { id: 'twenty_wins', name: 'Master', description: 'Win 20 rounds', points: 200, check: () => gameState.wins >= 20 },
    { id: 'fifty_wins', name: 'Legend', description: 'Win 50 rounds', points: 500, check: () => gameState.wins >= 50 },
    
    { id: 'streak_3', name: 'Triple Threat', description: 'Win 3 times in a row', points: 30, check: () => gameState.consecutiveWins >= 3 },
    { id: 'streak_5', name: 'Unstoppable', description: 'Win 5 times in a row', points: 75, check: () => gameState.consecutiveWins >= 5 },
    { id: 'streak_10', name: 'Godlike', description: 'Win 10 times in a row', points: 150, check: () => gameState.consecutiveWins >= 10 },
    
    { id: 'score_100', name: 'Century', description: 'Reach 100 points', points: 100, check: () => gameState.score >= 100 },
    { id: 'score_500', name: 'High Roller', description: 'Reach 500 points', points: 500, check: () => gameState.score >= 500 },
    { id: 'score_1000', name: 'Millionaire', description: 'Reach 1000 points', points: 1000, check: () => gameState.score >= 1000 },
    
    { id: 'survivor', name: 'Survivor', description: 'Survive 10 rounds', points: 50, check: () => gameState.roundsPlayed >= 10 },
    { id: 'iron_will', name: 'Iron Will', description: 'Survive 25 rounds', points: 150, check: () => gameState.roundsPlayed >= 25 },
    { id: 'eternal', name: 'Eternal', description: 'Survive 50 rounds', points: 300, check: () => gameState.roundsPlayed >= 50 },
    
    { id: 'chaos_master', name: 'Chaos Master', description: 'Reach Chaos Level 5', points: 100, check: () => gameState.chaosLevel >= 5 },
    { id: 'chaos_lord', name: 'Chaos Lord', description: 'Reach Chaos Level 10', points: 250, check: () => gameState.chaosLevel >= 10 },
    
    { id: 'coin_collector', name: 'Coin Collector', description: 'Flip 100 coins', points: 50, check: () => gameState.totalCoinsFlipped >= 100 },
    { id: 'coin_master', name: 'Coin Master', description: 'Flip 500 coins', points: 200, check: () => gameState.totalCoinsFlipped >= 500 },
    
    { id: 'perfect_round', name: 'Perfect', description: 'Get a perfect prediction', points: 25, check: () => gameState.perfectRounds >= 1 },
    { id: 'comeback_kid', name: 'Comeback Kid', description: 'Win after losing 5 times in a row', points: 100, check: () => false }, // Special trigger
    
    { id: 'risk_taker', name: 'Risk Taker', description: 'Continue playing at Chaos Level 8+', points: 200, check: () => gameState.chaosLevel >= 8 && gameState.roundsPlayed >= 20 },
    { id: 'masochist', name: 'Masochist', description: 'Lose 20 times', points: 100, check: () => gameState.losses >= 20 },
];

const choices = ["NGÚP", "ỬA", "ÚP", "NGỬA"];

// Audio Context for generating sounds
let audioContext;
let masterGainNode;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        masterGainNode.gain.value = 0.3;
    }
}

// Horror sound generators
const HorrorSounds = {
    // Low rumble/drone
    ambient: function() {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(40, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 2);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 2);
    },
    
    // Heartbeat
    heartbeat: function() {
        initAudio();
        for (let i = 0; i < 2; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 60;
            
            const startTime = audioContext.currentTime + (i * 0.4);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(masterGainNode);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        }
    },
    
    // Screech/scrape
    screech: function() {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    },
    
    // Whisper/static
    static: function() {
        initAudio();
        const bufferSize = audioContext.sampleRate * 0.5;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        source.start();
        source.stop(audioContext.currentTime + 0.5);
    },
    
    // Deep boom
    boom: function() {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    },
    
    // Coin flip sound
    coinFlip: function() {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    },
    
    // Distorted jumpscare
    jumpscare: function() {
        initAudio();
        // Multiple layered sounds
        const oscillators = [];
        const frequencies = [100, 150, 200, 666, 1000];
        
        frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            osc.connect(gain);
            gain.connect(masterGainNode);
            
            osc.start();
            osc.stop(audioContext.currentTime + 0.8);
            oscillators.push(osc);
        });
        
        // Add noise
        this.static();
    },
    
    // Tung tung tung (bell/gong sound)
    tungTung: function() {
        initAudio();
        for (let i = 0; i < 3; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = 440 + (i * 100);
            
            const startTime = audioContext.currentTime + (i * 0.3);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            osc.connect(gain);
            gain.connect(masterGainNode);
            
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        }
    },
    
    // Trallalala (chaotic melody)
    trallalala: function() {
        initAudio();
        const notes = [523, 659, 784, 880, 784, 659, 523]; // C, E, G, A, G, E, C
        
        notes.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const startTime = audioContext.currentTime + (i * 0.15);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            osc.connect(gain);
            gain.connect(masterGainNode);
            
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    },
    
    // Demonic growl
    demonGrowl: function() {
        initAudio();
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(80, audioContext.currentTime);
        osc2.frequency.setValueAtTime(83, audioContext.currentTime);
        
        osc1.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 1);
        osc2.frequency.exponentialRampToValueAtTime(43, audioContext.currentTime + 1);
        
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGainNode);
        
        osc1.start();
        osc2.start();
        osc1.stop(audioContext.currentTime + 1);
        osc2.stop(audioContext.currentTime + 1);
    },
    
    // Sahur call (ascending tones)
    sahur: function() {
        initAudio();
        const tones = [200, 250, 300, 350, 400, 450, 500];
        
        tones.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = audioContext.currentTime + (i * 0.2);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.connect(gain);
            gain.connect(masterGainNode);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    },
    
    // Glitch sound
    glitchSound: function() {
        initAudio();
        const bufferSize = audioContext.sampleRate * 0.1;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (i % 100 < 50 ? 1 : 0);
        }
        
        const source = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        
        source.buffer = buffer;
        gain.gain.value = 0.2;
        
        source.connect(gain);
        gain.connect(masterGainNode);
        
        source.start();
    }
};

// Victory messages for different win scenarios - BRAINROT EDITION
const victoryMessages = [
    "May mắn lần này...",
    "Bạn thoát được rồi...",
    "Nhưng đến bao giờ may mắn hết?",
    "Tiếp tục đi... nếu dám",
    "Sự may mắn sẽ không mãi bên bạn...",
    "Hãy chơi thêm một lần nữa...",
    "Tốt lắm... nhưng đừng chủ quan",
    "Được rồi, nhưng lần sau sao?",
    // BRAINROT ADDITIONS
    "SHEEEESH! 🥶 Bạn có RIZZ đấy!",
    "W RIZZ! 💀 Nhưng L sắp đến rồi...",
    "NO CAP FR FR! 🔥 Bạn đang BÁ ĐẠO!",
    "GYATT! 😳 Slay queen! Nhưng kiểm tra sau lưng...",
    "Sigma grindset! 💪 Nhưng alpha đang chờ...",
    "You're so SKIBIDI! 🚽 Đừng flush luck đi nhé!",
    "That's BUSSIN BUSSIN! 😤 No cap detected!",
    "Main character energy! ✨ Nhưng villain đến rồi...",
    "Ohio moment! 🌽 Wait... something's wrong...",
    "Caught in 4K! 📸 Still got that W tho",
    "Living rent free! 🏠 Trong đầu ai đó...",
    "It's giving... winner vibes! 💅 Slay!",
    "Understood the assignment! 📝 But homework's not done...",
    "Touch grass? Nah! 🌱 Touch victory!",
    "Đây là era của bạn! ⭐ Nhưng season sắp kết thúc...",
    "Real main character! 🎬 But horror genre...",
    "POV: You're winning 📱 *screaming sounds*",
    "This hits different! 💯 Literally...",
    "I'M DEAD! 💀 Oh wait... you will be...",
    "Not me... you actually winning! 😭",
    "The way I... actually impressed! 🙌 Sus tho...",
    "TUNG TUNG TUNG! 🔔 Chuông thắng reo!",
    "TRALLALALA! 🎵 Nhạc thắng vang lên!",
    "SAHUR! 📢 Đánh thức may mắn!",
    "Mewing streak maintained! 🤫🧏",
    "+999 AURA POINTS! ✨ (temporary)",
    "Giga chad moment! 💪 Beta decay incoming...",
    "Negative canthal tilt? ❌ Positive outcome? ✅",
    "Mogged the coins! 😎 But they mogging back...",
    "Looksmaxxing your score! 📈 For now...",
    "Locked in! 🔒 Locking you in... wait what?",
    "We're so back! ⬆️ Or are we?",
    "It's so over! ❌ Wait no, we're back! ✅ Wait...",
    "Green flag! 🟢 But red flags approaching...",
    "No thoughts, head empty! 🧠 Lucky choice!",
    "Big yikes energy! 😬 But W outcome!",
    "That's a WHOLE vibe! 🌊 Tsunami coming tho...",
    "Serving looks AND wins! 💁 Slay period!",
    "The way you ATE that! 😋 Now run...",
    "Living your best life! 🦋 Last moments...",
    "You're doing amazing sweetie! 💖 Cope harder next round!",
    "Tell me you're lucky without telling me... ✋",
    "Gaslight, Gatekeep, GIRLBOSS! 💅 You won!",
];

// LOSS MESSAGES - BRAINROT JUMPSCARE TEXT
const lossMessages = [
    "BẠNĐÃTHUA!!!",
    "KHÔNGMAYMẮNLẦNNÀO!!!",
    "CHỜ ĐỢI... ✋ NAH I'D LOSE! 💀",
    "RATIO + L + FELL OFF! 📉",
    "CAUGHT LACKING! 😱",
    "DOWN BAD FR FR! 😭",
    "TOUCH GRASS NOW! 🌱",
    "SKILL ISSUE! ⚠️",
    "MID MOMENT! 😐",
    "IT'S SO OVER! ❌❌❌",
    "YOU COOKED! 🔥 (NOT IN A GOOD WAY)",
    "THUA RỒI BRUH! 💀",
    "NAH YOU'RE DONE! ☠️",
    "BRO FELL OFF! 📉📉📉",
    "NEGATIVE AURA! ⬇️⬇️⬇️",
    "BETA MALE DETECTED! 🚨",
    "UNFOLLOWED + BLOCKED! 🚫",
    "CRINGE COMPILATION! 🎬",
    "YOU'RE COOKED! 🍳",
    "TUNG TUNG... THUA! 🔔❌",
    "NO RIZZ DETECTED! 🚫💔",
    "L BOZO! 🤡",
    "MAIDENLESS BEHAVIOR! 👁️👄👁️",
    "GETTING MOGGED! 😭",
    "CANTHAL TILT: NEGATIVE! 📐❌",
    "MEWING STREAK: BROKEN! 😬",
    "AURA: -999999! 💥",
    "UNLOCKED IN! 🔓 TO HELL!",
];

// Random result announcement texts
const resultAnnouncements = [
    "Kết quả là...",
    "Đáp án cuối cùng...",
    "Đồng xu nói rằng...",
    "Số phận của bạn...",
    "Reality check:",
    "Plot twist:",
    "The verdict:",
    "POV: Kết quả 👇",
    "Main character moment? 🤔",
    "Aaaand the results are:",
    "TUNG TUNG TUNG! 🔔",
    "TRALLALALA! 🎵",
    "SAHUR TIME! 📢",
    "Ơ kìa! Look! 👀",
    "Bruh moment incoming...",
    "No cap, the coins say:",
    "Fr fr, đáp án:",
    "It's giving:",
    "Understand the assignment?",
    "The coins are:",
    "Reality: *checks notes*",
    "The simulation says:",
    "Multiverse results:",
    "POV: You're about to find out",
    "The prophecy states:",
    "Breaking news! 📰",
    "Update: Kết quả đã ra!",
    "Canon event:",
    "Lore accurate result:",
    "The algorithm determined:",
];

// Coin flip announcement sounds (text)
const coinFlipSounds = [
    "TUNG! TUNG! TUNG!",
    "TRALLALALA! TRALLALALA!",
    "SAHUR! SAHUR! SAHUR!",
    "TING TING TING!",
    "CLANG CLANG CLANG!",
    "DONG DONG DONG!",
    "BRRRRR!",
    "SHEEEESH!",
    "SKIBIDI DOP DOP!",
    "YES YES YES!",
    "GYATT GYATT!",
    "BUSSIN!",
    "FR FR FR!",
    "NO CAP!",
    "RIZZ MODE!",
    "AURA CHECK!",
    "MEWING ACTIVATED!",
    "SIGMA GRIND!",
    "LOCKED IN!",
    "WE'RE SO BACK!",
];

// Jumpscare image data (base64 or URLs)
const jumpscareImages = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjQwMCIgeT0iNDAwIiBmb250LXNpemU9IjEwMCIgZmlsbD0iI2ZmMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKaoDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjUwMCIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2YwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QkHhuqBOIMSQw4MgVEjhu6BBISEhPC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzFhMDAwMCIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iNDAiIGZpbGw9IiNmZjAwMDAiLz48Y2lyY2xlIGN4PSI1MDAiIGN5PSIzMDAiIHI9IjQwIiBmaWxsPSIjZmYwMDAwIi8+PHBhdGggZD0iTTI1MCA1MDAgUSA0MDAgNjAwIDU1MCA1MDAiIHN0cm9rZT0iI2ZmMDAwMCIgc3Ryb2tlLXdpZHRoPSIxMCIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjQwMCIgeT0iNzAwIiBmb250LXNpemU9IjUwIiBmaWxsPSIjZmYwMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DSMOUSeKApi4uLjwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImciPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMDAwMDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjAwMDAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LXNpemU9IjEyMCIgZmlsbD0iI2ZmMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjQwMCIgZm9udC1zaXplPSI2MCIgZmlsbD0iI2ZmNjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+S0jDk05HIE1heeG7jTwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjUwMCIgZm9udC1zaXplPSI2MCIgZmlsbD0iI2ZmNjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TOG6p04gTsOATyE8L3RleHQ+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0gMjAwIDMwMCBMIDMwMCAyMDAgTCA0MDAgMzAwIEwgMzAwIDQwMCBaIiBmaWxsPSIjZmYwMDAwIi8+PHBhdGggZD0iTSA1MDAgMzAwIEwgNjAwIDIwMCBMIDcwMCAzMDAgTCA2MDAgNDAwIFoiIGZpbGw9IiNmZjAwMDAiLz48dGV4dCB4PSI0MDAiIHk9IjYwMCIgZm9udC1zaXplPSI4MCIgZmlsbD0iI2ZmMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TkdISsG6uiBZw4ogVkjhuqBORyE8L3RleHQ+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjQwMCIgcj0iMjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iNSIvPjx0ZXh0IHg9IjQwMCIgeT0iNDIwIiBmb250LXNpemU9IjEwMCIgZmlsbD0iI2ZmMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SOG6ok0hPC90ZXh0Pjwvc3ZnPg==',
];

// Start game
function startGame() {
    document.getElementById('menu').classList.remove('active');
    document.getElementById('game').classList.add('active');
    gameState.isPlaying = true;
    
    // Initialize audio
    initAudio();
    
    // Play ambient horror sound
    HorrorSounds.ambient();
    startAmbientLoop();
    
    // Update high score display
    updateHighScore();
    
    // Show tutorial if first time
    if (!gameState.tutorialShown) {
        showTutorial();
        gameState.tutorialShown = true;
    }
    
    // Set initial theme
    updateTheme();
}

// Update theme based on game state
function updateTheme() {
    const body = document.body;
    const winRate = gameState.wins / Math.max(1, gameState.roundsPlayed);
    
    // Remove all theme classes
    body.classList.remove('theme-dark', 'theme-light', 'theme-chaos', 'theme-victory', 'theme-defeat');
    
    // Apply theme based on state
    if (gameState.consecutiveLosses >= 3) {
        body.classList.add('theme-dark');
        gameState.themeMode = 'dark';
    } else if (gameState.consecutiveWins >= 3) {
        body.classList.add('theme-light');
        gameState.themeMode = 'light';
    } else if (gameState.chaosLevel >= 7) {
        body.classList.add('theme-chaos');
        gameState.themeMode = 'chaos';
    } else {
        body.classList.add('theme-normal');
        gameState.themeMode = 'normal';
    }
}

// Check and unlock achievements
function checkAchievements() {
    const newAchievements = [];
    
    winConditions.forEach(condition => {
        if (!gameState.achievements.includes(condition.id) && condition.check()) {
            gameState.achievements.push(condition.id);
            newAchievements.push(condition);
            gameState.score += condition.points;
            
            // Save to localStorage
            localStorage.setItem('achievements', JSON.stringify(gameState.achievements));
            
            // Show achievement notification
            showAchievementNotification(condition);
        }
    });
    
    return newAchievements;
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-content">
            <div class="achievement-title">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            <div class="achievement-points">+${achievement.points} points!</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Play achievement sound
    HorrorSounds.trallalala();
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Update high score
function updateHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
        
        // Flash high score
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) {
            highScoreElement.classList.add('new-high-score');
            setTimeout(() => highScoreElement.classList.remove('new-high-score'), 1000);
        }
    }
}

// Start ambient sound loop
function startAmbientLoop() {
    setInterval(() => {
        if (Math.random() < 0.3) {
            HorrorSounds.ambient();
        }
        if (Math.random() < 0.2) {
            HorrorSounds.heartbeat();
        }
        if (Math.random() < 0.15) {
            HorrorSounds.demonGrowl();
        }
    }, 8000);
    
    // Start visual effects
    spawnDemons();
    spawnJerkingEmojis();
    startBackgroundEffects();
}

// Spawn demons darting around
function spawnDemons() {
    setInterval(() => {
        if (Math.random() < 0.4 + (gameState.chaosLevel * 0.05)) {
            createDemon();
        }
    }, 3000);
}

function createDemon() {
    const demon = document.createElement('div');
    demon.className = 'demon';
    
    const demonTypes = ['👹', '👺', '😈', '💀', '👻', '🔥', '⚡', '💥', '👁️', '🩸'];
    demon.textContent = demonTypes[Math.floor(Math.random() * demonTypes.length)];
    
    // Random starting position
    const startSide = Math.floor(Math.random() * 4);
    let startX, startY, endX, endY;
    
    switch(startSide) {
        case 0: // Left
            startX = -100;
            startY = Math.random() * window.innerHeight;
            endX = window.innerWidth + 100;
            endY = Math.random() * window.innerHeight;
            break;
        case 1: // Right
            startX = window.innerWidth + 100;
            startY = Math.random() * window.innerHeight;
            endX = -100;
            endY = Math.random() * window.innerHeight;
            break;
        case 2: // Top
            startX = Math.random() * window.innerWidth;
            startY = -100;
            endX = Math.random() * window.innerWidth;
            endY = window.innerHeight + 100;
            break;
        case 3: // Bottom
            startX = Math.random() * window.innerWidth;
            startY = window.innerHeight + 100;
            endX = Math.random() * window.innerWidth;
            endY = -100;
            break;
    }
    
    demon.style.left = startX + 'px';
    demon.style.top = startY + 'px';
    
    document.body.appendChild(demon);
    
    // Animate
    const duration = 1000 + Math.random() * 2000;
    demon.style.transition = `all ${duration}ms linear`;
    
    setTimeout(() => {
        demon.style.left = endX + 'px';
        demon.style.top = endY + 'px';
        demon.style.transform = `rotate(${Math.random() * 720 - 360}deg) scale(${Math.random() * 2 + 1})`;
    }, 10);
    
    // Play demon sound occasionally
    if (Math.random() < 0.3) {
        setTimeout(() => {
            HorrorSounds.demonGrowl();
        }, duration / 2);
    }
    
    setTimeout(() => {
        demon.remove();
    }, duration + 100);
}

// Spawn jerking emojis
function spawnJerkingEmojis() {
    setInterval(() => {
        if (Math.random() < 0.5 + (gameState.chaosLevel * 0.05)) {
            createJerkingEmoji();
        }
    }, 2000);
}

function createJerkingEmoji() {
    const emoji = document.createElement('div');
    emoji.className = 'jerking-emoji';
    
    const emojiTypes = ['😱', '😨', '😰', '🤯', '😵', '🥴', '😖', '😣', '😫', '🤪', '😜', '🤢', '🤮', '💩', '🎃', '🎭'];
    emoji.textContent = emojiTypes[Math.floor(Math.random() * emojiTypes.length)];
    
    emoji.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    emoji.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    
    document.body.appendChild(emoji);
    
    // Jerking animation
    let jerkCount = 0;
    const jerkInterval = setInterval(() => {
        emoji.style.transform = `
            translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) 
            rotate(${Math.random() * 180 - 90}deg) 
            scale(${Math.random() * 1.5 + 0.5})
        `;
        jerkCount++;
        
        if (jerkCount > 10) {
            clearInterval(jerkInterval);
            emoji.style.animation = 'explosionFade 0.5s forwards';
            setTimeout(() => emoji.remove(), 500);
        }
    }, 100);
    
    if (Math.random() < 0.2) {
        HorrorSounds.glitchSound();
    }
}

// Background effects
function startBackgroundEffects() {
    // Floating particles
    createFloatingParticles();
    
    // Screen tears
    setInterval(() => {
        if (Math.random() < 0.3 + (gameState.chaosLevel * 0.05)) {
            createScreenTear();
        }
    }, 5000);
    
    // Blood drips
    setInterval(() => {
        if (Math.random() < 0.4 + (gameState.chaosLevel * 0.05)) {
            createBloodDrip();
        }
    }, 4000);
    
    // Shadow creatures
    setInterval(() => {
        if (gameState.chaosLevel >= 3 && Math.random() < 0.3) {
            createShadowCreature();
        }
    }, 6000);
    
    // Screen distortion waves
    setInterval(() => {
        if (gameState.chaosLevel >= 2 && Math.random() < 0.4) {
            createDistortionWave();
        }
    }, 7000);
}

function createFloatingParticles() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.textContent = ['💀', '🔥', '⚡', '💥', '👁️', '🩸'][Math.floor(Math.random() * 6)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            document.body.appendChild(particle);
        }, i * 500);
    }
}

function createScreenTear() {
    const tear = document.createElement('div');
    tear.className = 'screen-tear';
    tear.style.top = Math.random() * 100 + '%';
    tear.style.height = (Math.random() * 5 + 2) + 'px';
    document.body.appendChild(tear);
    
    HorrorSounds.glitchSound();
    
    setTimeout(() => tear.remove(), 1000);
}

function createBloodDrip() {
    const drip = document.createElement('div');
    drip.className = 'blood-drip';
    drip.textContent = '🩸';
    drip.style.left = Math.random() * 100 + '%';
    document.body.appendChild(drip);
    
    setTimeout(() => drip.remove(), 3000);
}

function createShadowCreature() {
    const shadow = document.createElement('div');
    shadow.className = 'shadow-creature';
    shadow.textContent = '👤';
    shadow.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    shadow.style.bottom = '0px';
    document.body.appendChild(shadow);
    
    HorrorSounds.demonGrowl();
    
    setTimeout(() => {
        shadow.style.opacity = '0';
        setTimeout(() => shadow.remove(), 2000);
    }, 3000);
}

function createDistortionWave() {
    const wave = document.createElement('div');
    wave.className = 'distortion-wave';
    document.body.appendChild(wave);
    
    HorrorSounds.static();
    
    setTimeout(() => wave.remove(), 2000);
}

// Show tutorial
function showTutorial() {
    const tutorialOverlay = document.createElement('div');
    tutorialOverlay.className = 'tutorial-overlay active';
    tutorialOverlay.innerHTML = `
        <div class="tutorial-content">
            <h2 class="tutorial-title">📜 HƯỚNG DẪN CHƠI</h2>
            <div class="tutorial-text">
                <p><strong>🎯 MỤC TIÊU:</strong></p>
                <p>Chọn <span class="highlight">NGÚP</span> hoặc <span class="highlight">ỬA</span> và dự đoán kết quả tung xu.</p>
                
                <p><strong>🎲 LUẬT CHƠI:</strong></p>
                <ul>
                    <li>Hệ thống sẽ tung 4 đồng xu (NGÚP, ỬA, ÚP, NGỬA)</li>
                    <li>NGÚP = ỬA | NGỬA = Úp</li>
                    <li>Đúng = +10 điểm | Sai = -5 điểm</li>
                </ul>
                
                <p><strong>⚠️ CẢNH BÁO:</strong></p>
                <ul class="warning-list">
                    <li>🌀 Càng chơi lâu, game càng <span class="chaos-text">ĐIÊN RỒ</span></li>
                    <li>🎪 Nút bấm có thể <span class="chaos-text">ĐẢO NGƯỢC</span></li>
                    <li>👻 Nút <span class="chaos-text">GIẢ</span> sẽ xuất hiện</li>
                    <li>🌈 Màn hình sẽ <span class="chaos-text">BIẾN DẠNG</span></li>
                    <li>💥 Mọi thứ có thể xảy ra...</li>
                </ul>
                
                <p class="tutorial-warning">Bạn đã được cảnh báo. Hậu quả tự chịu.</p>
            </div>
            <button class="btn-tutorial" onclick="closeTutorial()">BẮT ĐẦU CHƠI</button>
        </div>
    `;
    
    document.body.appendChild(tutorialOverlay);
    HorrorSounds.static();
}

// Close tutorial
function closeTutorial() {
    const tutorialOverlay = document.querySelector('.tutorial-overlay');
    tutorialOverlay.classList.remove('active');
    setTimeout(() => {
        tutorialOverlay.remove();
    }, 300);
    HorrorSounds.boom();
}

// Make choice
function makeChoice(choice) {
    if (!gameState.isPlaying) return;
    
    // CHAOS: Inverted controls
    if (gameState.invertedControls) {
        choice = choice === "NGÚP" ? "ỬA" : "NGÚP";
        document.getElementById('message').textContent = "Điều khiển đã bị đảo ngược! Haha!";
        setTimeout(() => {
            document.getElementById('message').textContent = "Đang tung xu...";
        }, 1000);
    }
    
    gameState.currentChoice = choice;
    gameState.isPlaying = false;
    gameState.roundsPlayed++;
    
    // Increase chaos level every 2 rounds
    if (gameState.roundsPlayed % 2 === 0) {
        gameState.chaosLevel++;
    }
    
    // Disable buttons
    disableButtons();
    
    // Update message
    if (!gameState.invertedControls) {
        // BRAINROT COIN FLIP ANNOUNCEMENTS
        const flipSound = coinFlipSounds[Math.floor(Math.random() * coinFlipSounds.length)];
        document.getElementById('message').textContent = flipSound;
        
        // Show result announcement after flip sound
        setTimeout(() => {
            const announcement = resultAnnouncements[Math.floor(Math.random() * resultAnnouncements.length)];
            document.getElementById('message').textContent = announcement;
        }, 500);
    }
    
    // Play coin flip sound
    HorrorSounds.coinFlip();
    
    // Random additional sounds based on chaos
    if (gameState.chaosLevel >= 2 && Math.random() < 0.3) {
        setTimeout(() => HorrorSounds.tungTung(), 200);
    }
    if (gameState.chaosLevel >= 4 && Math.random() < 0.3) {
        setTimeout(() => HorrorSounds.trallalala(), 400);
    }
    if (gameState.chaosLevel >= 5 && Math.random() < 0.3) {
        setTimeout(() => HorrorSounds.sahur(), 600);
    }
    
    // Flip coin animation (faster with chaos)
    const coin = document.querySelector('.coin');
    coin.classList.add('flipping');
    
    // CHAOS: Variable animation speed
    const flipDuration = Math.max(300, 1000 - (gameState.chaosLevel * 100));
    coin.style.animationDuration = `${flipDuration}ms`;
    
    // Generate results after animation
    setTimeout(() => {
        coin.classList.remove('flipping');
        coin.style.animationDuration = '';
        generateResults();
    }, flipDuration);
}

// Generate random results
function generateResults() {
    // CHAOS: Variable number of coins based on chaos level
    let numCoins = 4;
    if (gameState.chaosLevel >= 3) {
        numCoins = Math.floor(Math.random() * 4) + 3; // 3-6 coins
    }
    if (gameState.chaosLevel >= 6) {
        numCoins = Math.floor(Math.random() * 6) + 4; // 4-9 coins
    }
    
    // Generate random results
    const results = [];
    for (let i = 0; i < numCoins; i++) {
        results.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    
    gameState.totalCoinsFlipped += numCoins;
    
    // CHAOS: Sometimes add completely random text
    if (gameState.chaosLevel >= 5 && Math.random() < 0.3) {
        const chaosResults = ["???", "!!!", "ERROR", "VOID", "NULL", "666"];
        results[Math.floor(Math.random() * results.length)] = chaosResults[Math.floor(Math.random() * chaosResults.length)];
    }
    
    // Count occurrences
    const ngupCount = results.filter(r => r === "NGÚP" || r === "ÚP").length;
    const uaCount = results.filter(r => r === "ỬA" || r === "NGỬA").length;
    
    // Determine outcome
    let outcome;
    if (ngupCount > uaCount) {
        outcome = "NGÚP";
    } else if (uaCount > ngupCount) {
        outcome = "ỬA";
    } else {
        // Tie - randomly choose
        outcome = Math.random() < 0.5 ? "NGÚP" : "ỬA";
    }
    
    // Check for perfect round (all same)
    const allSame = results.every(r => r === results[0]);
    if (allSame && (results[0] === "NGÚP" || results[0] === "ỬA") && results[0] === gameState.currentChoice) {
        gameState.perfectRounds++;
    }
    
    // CHAOS: Sometimes completely random outcome
    if (gameState.chaosLevel >= 4 && Math.random() < 0.2) {
        outcome = Math.random() < 0.5 ? "NGÚP" : "ỬA";
    }
    
    // Show results
    displayResults(results);
    
    // CHAOS: Variable display time
    const displayTime = gameState.chaosLevel >= 2 ? Math.random() * 1500 + 500 : 2000;
    
    // Check win/lose after showing results
    setTimeout(() => {
        checkOutcome(outcome);
    }, displayTime);
}

// Display results
function displayResults(results) {
    const resultsDisplay = document.getElementById('results');
    const resultCoins = resultsDisplay.querySelector('.result-coins');
    
    // Clear previous results
    resultCoins.innerHTML = '';
    
    // CHAOS: Create dynamic number of result coins
    results.forEach((result, index) => {
        const resultCoin = document.createElement('div');
        resultCoin.className = 'result-coin';
        resultCoin.textContent = result;
        resultCoin.style.animationDelay = `${index * 0.2}s`;
        
        // CHAOS: Random colors at high chaos levels
        if (gameState.chaosLevel >= 4 && Math.random() < 0.5) {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff'];
            resultCoin.style.borderColor = colors[Math.floor(Math.random() * colors.length)];
            resultCoin.style.color = colors[Math.floor(Math.random() * colors.length)];
            resultCoin.classList.add('chaos');
        }
        
        // CHAOS: Random rotation
        if (gameState.chaosLevel >= 3) {
            resultCoin.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        // CHAOS: Spawn demons near coins
        if (gameState.chaosLevel >= 5 && Math.random() < 0.5) {
            setTimeout(() => createDemon(), index * 200);
        }
        
        resultCoins.appendChild(resultCoin);
    });
    
    resultsDisplay.classList.add('show');
    
    // CHAOS: Variable hide time
    const hideTime = gameState.chaosLevel >= 2 ? Math.random() * 1500 + 500 : 2000;
    
    setTimeout(() => {
        resultsDisplay.classList.remove('show');
    }, hideTime);
}

// Check outcome
function checkOutcome(outcome) {
    if (outcome === gameState.currentChoice) {
        // Win!
        handleWin();
    } else {
        // Lose!
        handleLoss();
    }
}

// Handle win
function handleWin() {
    gameState.wins++;
    gameState.score += 10;
    gameState.consecutiveWins++;
    gameState.consecutiveLosses = 0;
    
    // Check for comeback achievement
    if (gameState.consecutiveWins === 1) {
        const lastLossStreak = gameState.consecutiveLosses;
        if (lastLossStreak >= 5) {
            // Trigger comeback achievement manually
            if (!gameState.achievements.includes('comeback_kid')) {
                gameState.achievements.push('comeback_kid');
                const achievement = winConditions.find(a => a.id === 'comeback_kid');
                gameState.score += achievement.points;
                showAchievementNotification(achievement);
            }
        }
    }
    
    updateScore();
    checkAchievements();
    updateHighScore();
    updateTheme();
    
    // Random victory message
    const message = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
    
    // Show victory animation
    showVictory(message);
    
    // Play victory sound (but with horror twist)
    if (gameState.chaosLevel < 3) {
        // Early game - normal sounds
        HorrorSounds.coinFlip();
    } else {
        // Later game - creepy sounds even on win
        HorrorSounds.static();
        setTimeout(() => {
            HorrorSounds.heartbeat();
        }, 300);
    }
    
    // Trigger light theme transition
    transitionToLightTheme();
}

// Handle loss
function handleLoss() {
    gameState.losses++;
    gameState.score = Math.max(0, gameState.score - 5);
    gameState.consecutiveLosses++;
    gameState.consecutiveWins = 0;
    
    updateScore();
    checkAchievements();
    updateTheme();
    
    // Show jumpscare
    showJumpscare();
    
    // Trigger dark theme transition
    transitionToDarkTheme();
}

// Transition to light theme (winning)
function transitionToLightTheme() {
    const body = document.body;
    
    if (gameState.consecutiveWins >= 3) {
        body.classList.add('theme-light');
        body.classList.remove('theme-dark', 'theme-normal');
        
        // Spawn celebratory emojis
        const celebEmojis = ['🎉', '✨', '🌟', '⭐', '💫', '🎊', '🎆', '🌈'];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'celebration-emoji';
                emoji.textContent = celebEmojis[Math.floor(Math.random() * celebEmojis.length)];
                emoji.style.left = Math.random() * 100 + '%';
                emoji.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(emoji);
                
                setTimeout(() => emoji.remove(), 3000);
            }, i * 200);
        }
        
        HorrorSounds.trallalala();
    }
}

// Transition to dark theme (losing)
function transitionToDarkTheme() {
    const body = document.body;
    
    if (gameState.consecutiveLosses >= 3) {
        body.classList.add('theme-dark');
        body.classList.remove('theme-light', 'theme-normal');
        
        // Spawn horror effects
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createShadowCreature();
                createBloodDrip();
            }, i * 300);
        }
        
        HorrorSounds.demonGrowl();
    }
}

// Show victory animation
function showVictory(message) {
    const victoryOverlay = document.getElementById('victory');
    const victoryText = document.getElementById('victory-text');
    
    victoryText.textContent = message;
    victoryOverlay.classList.add('active');
    
    // BRAINROT VICTORY EFFECTS
    // Random emoji spam on win
    if (gameState.chaosLevel >= 2 && Math.random() < 0.5) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createJerkingEmoji(), i * 100);
        }
    }
    
    // Random victory color changes
    const victoryColors = ['#00ff00', '#ffff00', '#00ffff', '#ff00ff', '#ffffff'];
    victoryText.style.color = victoryColors[Math.floor(Math.random() * victoryColors.length)];
    
    // Add text effects based on chaos
    if (gameState.chaosLevel >= 3) {
        victoryText.style.animation = 'rgbSplit 0.5s infinite';
    }
    if (gameState.chaosLevel >= 5) {
        victoryText.style.fontSize = '4rem';
        victoryText.style.animation = 'rgbSplit 0.3s infinite, spiral 2s infinite';
    }
    
    // Random creepy twist
    if (Math.random() < 0.3) {
        const creepyTwists = [
            "Nhưng điều gì sẽ xảy ra tiếp theo?",
            "Mọi thứ chỉ mới bắt đầu...",
            "Thắng? Hoặc là thua chậm?",
            "POV: You think you won 💀",
            "Main character? Nah, side quest! 😭",
            "We're so back! ...Or are we? 🤔",
            "Slay! But who's slaying who? 👀",
            "It's giving... false hope! ✨",
            "Understood? Wait... you don't! 😈",
            "Locked in? More like locked up! 🔒",
        ];
        setTimeout(() => {
            victoryText.textContent = creepyTwists[Math.floor(Math.random() * creepyTwists.length)];
            victoryText.style.color = '#ff0000';
            HorrorSounds.static();
            
            // Spawn demon on creepy twist
            createDemon();
        }, 1000);
    }
    
    // High chaos - spawn demons even on win
    if (gameState.chaosLevel >= 4 && Math.random() < 0.4) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createDemon(), i * 200);
        }
    }
    
    setTimeout(() => {
        victoryOverlay.classList.remove('active');
        victoryText.style.fontSize = '';
        victoryText.style.animation = '';
        resetRound();
    }, 2000);
}

// Show jumpscare
function showJumpscare() {
    const jumpscareOverlay = document.getElementById('jumpscare');
    const jumpscareImage = document.getElementById('jumpscare-image');
    
    // Random jumpscare image
    const randomImage = jumpscareImages[Math.floor(Math.random() * jumpscareImages.length)];
    jumpscareImage.src = randomImage;
    
    jumpscareOverlay.classList.add('active');
    
    // BRAINROT LOSS MESSAGE - show before jumpscare
    const lossMsg = lossMessages[Math.floor(Math.random() * lossMessages.length)];
    document.getElementById('message').textContent = lossMsg;
    document.getElementById('message').style.fontSize = '2rem';
    document.getElementById('message').style.animation = 'intenseGlitch 0.1s infinite';
    
    // Play jumpscare sound
    HorrorSounds.jumpscare();
    
    // Spam emojis on loss
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createJerkingEmoji(), i * 50);
    }
    
    // Spawn demons
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createDemon(), i * 100);
    }
    
    // Add screen shake
    document.body.style.animation = 'shake 0.5s';
    
    // Flash random colors
    let colorFlash = setInterval(() => {
        document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 5})`;
    }, 50);
    
    setTimeout(() => {
        clearInterval(colorFlash);
        document.body.style.filter = '';
        jumpscareOverlay.classList.remove('active');
        document.body.style.animation = '';
        document.getElementById('message').style.fontSize = '';
        document.getElementById('message').style.animation = '';
        resetRound();
    }, 1500);
}

// Reset round
function resetRound() {
    gameState.isPlaying = true;
    gameState.currentChoice = null;
    
    // CHAOS: Apply random mechanics based on chaos level
    applyChaosEffects();
    
    enableButtons();
    
    // CHAOS: Modified message - BRAINROT EDITION
    const messages = [
        "Hãy chọn NGÚP hoặc ỬA...",
        "Lựa chọn đi... nếu bạn dám...",
        "Chọn... chọn... chọn...",
        "Bạn có chắc không?",
        "Lần này sẽ khác...",
        "Mọi thứ đang thay đổi...",
        // BRAINROT ADDITIONS
        "POV: Time to choose 💀",
        "Main character arc? 🤔",
        "Choose wisely bestie! 💅",
        "Rizz or L? Your choice! 🎲",
        "Sigma move time! 💪",
        "No cap, pick one! 🔥",
        "It's giving... choices! ✨",
        "Understood the assignment? 📝",
        "Locked in moment! 🔒",
        "We're so back! ⬆️ Pick!",
        "Skibidi choice time! 🚽",
        "Gyatt make a choice! 😳",
        "Fr fr, choose now! 🗣️",
        "Bussin decision needed! 😤",
        "Aura check: Pick! ⚡",
        "Mewing paused. Choose! 🤫",
        "Ohio decision moment! 🌽",
        "Caught in 4K! Now pick! 📸",
        "Living rent free? Pick! 🏠",
        "That's a vibe! Choose! 🌊",
        "Slay or get slayed! 💀",
        "Canon event incoming! 📖",
        "Multiverse choice! 🌌",
    ];
    
    if (gameState.chaosLevel >= 2) {
        document.getElementById('message').textContent = messages[Math.floor(Math.random() * messages.length)];
    } else {
        document.getElementById('message').textContent = messages[0];
    }
    
    // CHAOS: Button position randomization
    if (gameState.chaosLevel >= 3 && Math.random() < 0.5) {
        randomizeButtonPositions();
    }
    
    // CHAOS: Inverted controls announcement
    if (gameState.invertedControls) {
        setTimeout(() => {
            document.getElementById('message').textContent = "⚠️ ĐIỀU KHIỂN BỊ ĐẢO NGƯỢC! ⚠️";
            document.getElementById('message').style.color = '#ff0000';
        }, 1000);
    }
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('wins').textContent = gameState.wins;
    document.getElementById('losses').textContent = gameState.losses;
    
    // Update high score
    const highScoreElement = document.getElementById('high-score');
    if (highScoreElement) {
        highScoreElement.textContent = gameState.highScore;
    }
    
    // Update streak display
    const streakElement = document.getElementById('streak');
    if (streakElement) {
        if (gameState.consecutiveWins > 0) {
            streakElement.textContent = `🔥 ${gameState.consecutiveWins}`;
            streakElement.style.color = '#00ff00';
        } else if (gameState.consecutiveLosses > 0) {
            streakElement.textContent = `💀 ${gameState.consecutiveLosses}`;
            streakElement.style.color = '#ff0000';
        } else {
            streakElement.textContent = '-';
            streakElement.style.color = '#fff';
        }
    }
    
    // Update achievements count
    const achievementCount = document.getElementById('achievement-count');
    if (achievementCount) {
        achievementCount.textContent = `${gameState.achievements.length}/${winConditions.length}`;
    }
}

// Disable choice buttons
function disableButtons() {
    document.getElementById('btn-ngup').disabled = true;
    document.getElementById('btn-ua').disabled = true;
}

// Enable choice buttons
function enableButtons() {
    document.getElementById('btn-ngup').disabled = false;
    document.getElementById('btn-ua').disabled = false;
}

// Add screen shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-10px, -10px); }
        20% { transform: translate(10px, 10px); }
        30% { transform: translate(-10px, 10px); }
        40% { transform: translate(10px, -10px); }
        50% { transform: translate(-10px, -10px); }
        60% { transform: translate(10px, 10px); }
        70% { transform: translate(-10px, 10px); }
        80% { transform: translate(10px, -10px); }
        90% { transform: translate(-10px, -10px); }
    }
`;
document.head.appendChild(style);

// Apply chaos effects based on chaos level
function applyChaosEffects() {
    // Reset some effects
    gameState.invertedControls = false;
    document.getElementById('message').style.color = '#ff6666';
    
    // Remove old chaos classes
    document.body.classList.remove('chaos-mode-1', 'chaos-mode-2', 'chaos-mode-3', 'chaos-mode-4', 'chaos-mode-5');
    
    // Add chaos class based on level
    if (gameState.chaosLevel >= 2) {
        document.body.classList.add('chaos-mode-1');
    }
    if (gameState.chaosLevel >= 4) {
        document.body.classList.add('chaos-mode-2');
    }
    if (gameState.chaosLevel >= 6) {
        document.body.classList.add('chaos-mode-3');
    }
    if (gameState.chaosLevel >= 7) {
        document.body.classList.add('chaos-mode-4');
    }
    if (gameState.chaosLevel >= 8) {
        document.body.classList.add('chaos-mode-5');
    }
    
    // Level 1+: Minor visual glitches
    if (gameState.chaosLevel >= 1) {
        if (Math.random() < 0.3) {
            document.body.style.filter = 'hue-rotate(' + (Math.random() * 360) + 'deg)';
            setTimeout(() => {
                document.body.style.filter = '';
            }, 200 + Math.random() * 500);
        }
        
        // Spawn extra demons
        if (Math.random() < 0.4) {
            createDemon();
        }
    }
    
    // Level 2+: Screen shake
    if (gameState.chaosLevel >= 2 && Math.random() < 0.4) {
        document.body.style.animation = 'shake 0.5s';
        HorrorSounds.boom();
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Spawn emojis
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createJerkingEmoji(), i * 100);
        }
    }
    
    // Level 3+: Inverted controls
    if (gameState.chaosLevel >= 3 && Math.random() < 0.3) {
        gameState.invertedControls = true;
        
        // Spawn shadow
        createShadowCreature();
    }
    
    // Level 4+: Button text changes
    if (gameState.chaosLevel >= 4 && Math.random() < 0.4) {
        const btnNgup = document.querySelector('#btn-ngup span');
        const btnUa = document.querySelector('#btn-ua span');
        const fakeTexts = ['???', 'CHỌN ĐI', '!!!', 'ĐÂY', 'KIA', 'KHÔNG', 'CÓ'];
        
        HorrorSounds.static();
        
        if (Math.random() < 0.5) {
            btnNgup.textContent = fakeTexts[Math.floor(Math.random() * fakeTexts.length)];
            setTimeout(() => {
                btnNgup.textContent = 'NGÚP';
            }, 1000);
        }
        if (Math.random() < 0.5) {
            btnUa.textContent = fakeTexts[Math.floor(Math.random() * fakeTexts.length)];
            setTimeout(() => {
                btnUa.textContent = 'ỬA';
            }, 1000);
        }
        
        // Screen tears
        createScreenTear();
        setTimeout(() => createScreenTear(), 300);
    }
    
    // Level 5+: Screen rotation
    if (gameState.chaosLevel >= 5 && Math.random() < 0.3) {
        const rotation = Math.random() * 10 - 5; // -5 to 5 degrees
        document.body.style.transform = `rotate(${rotation}deg)`;
        setTimeout(() => {
            document.body.style.transform = '';
        }, 2000);
        
        // Distortion wave
        createDistortionWave();
        
        // Tung tung tung sound
        HorrorSounds.tungTung();
    }
    
    // Level 6+: Multiple fake buttons
    if (gameState.chaosLevel >= 6 && Math.random() < 0.4) {
        HorrorSounds.screech();
        createFakeButtons();
        
        // Blood drips
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createBloodDrip(), i * 200);
        }
        
        // Trallalala sound
        setTimeout(() => HorrorSounds.trallalala(), 300);
    }
    
    // Level 7+: Screen flip
    if (gameState.chaosLevel >= 7 && Math.random() < 0.3) {
        document.body.style.transform = 'scaleX(-1)';
        setTimeout(() => {
            document.body.style.transform = '';
        }, 3000);
        
        // Sahur sound
        HorrorSounds.sahur();
        
        // Massive demon spam
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createDemon(), i * 150);
        }
    }
    
    // Level 8+: Complete chaos
    if (gameState.chaosLevel >= 8 && Math.random() < 0.5) {
        HorrorSounds.jumpscare();
        initiateCompleteChoas();
    }
}

// Randomize button positions
function randomizeButtonPositions() {
    const choiceButtons = document.querySelector('.choice-buttons');
    const buttons = Array.from(choiceButtons.children);
    
    // Shuffle buttons
    if (Math.random() < 0.5) {
        choiceButtons.innerHTML = '';
        buttons.reverse().forEach(btn => choiceButtons.appendChild(btn));
    }
    
    // Random positioning
    if (gameState.chaosLevel >= 5) {
        buttons.forEach(btn => {
            btn.style.position = 'relative';
            btn.style.left = (Math.random() * 100 - 50) + 'px';
            btn.style.top = (Math.random() * 100 - 50) + 'px';
            
            setTimeout(() => {
                btn.style.position = '';
                btn.style.left = '';
                btn.style.top = '';
            }, 3000);
        });
    }
}

// Create fake buttons that do nothing
function createFakeButtons() {
    const choiceButtons = document.querySelector('.choice-buttons');
    const fakeLabels = ['???', '!!!', 'FAKE', 'LỪA ĐẤY', 'KHÔNG', 'ĐÂY NÀY'];
    
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const fakeBtn = document.createElement('button');
        fakeBtn.className = 'btn-choice fake-btn';
        fakeBtn.innerHTML = `<span>${fakeLabels[Math.floor(Math.random() * fakeLabels.length)]}</span><div class="btn-glow"></div>`;
        fakeBtn.style.opacity = '0.7';
        fakeBtn.onclick = () => {
            fakeBtn.style.animation = 'shake 0.3s';
            document.getElementById('message').textContent = 'Nút giả! Haha!';
            HorrorSounds.static();
            setTimeout(() => {
                fakeBtn.remove();
            }, 500);
        };
        
        choiceButtons.appendChild(fakeBtn);
        
        setTimeout(() => {
            if (fakeBtn.parentNode) {
                fakeBtn.remove();
            }
        }, 5000);
    }
}

// Complete chaos mode
function initiateCompleteChoas() {
    const container = document.querySelector('.container');
    
    // Spam demons
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createDemon(), i * 100);
    }
    
    // Spam emojis
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createJerkingEmoji(), i * 80);
    }
    
    // Rapid color changes
    let colorInterval = setInterval(() => {
        document.body.style.filter = 'hue-rotate(' + (Math.random() * 360) + 'deg) saturate(' + (Math.random() * 3 + 1) + ')';
    }, 100);
    
    // Random rotations
    let rotationInterval = setInterval(() => {
        container.style.transform = `rotate(${Math.random() * 20 - 10}deg) scale(${0.9 + Math.random() * 0.2})`;
    }, 150);
    
    // Multiple messages
    const chaosMessages = [
        'CHAOS!!!',
        'MỌI THỨ ĐANG SAI!!!',
        'KHÔNG CÒN KIỂM SOÁT!!!',
        'HAHAHAHA!!!',
        'BẠN ĐÃ ĐI QUÁ XA!!!',
        'TUNG TUNG TUNG!!!',
        'TRALLALALA!!!',
        'SAHUR!!! SAHUR!!!',
        '👹👺😈💀👻',
        'CHAOS CHAOS CHAOS!!!'
    ];
    
    let msgIndex = 0;
    let messageInterval = setInterval(() => {
        document.getElementById('message').textContent = chaosMessages[msgIndex % chaosMessages.length];
        msgIndex++;
    }, 300);
    
    // All the sounds!
    HorrorSounds.jumpscare();
    setTimeout(() => HorrorSounds.tungTung(), 200);
    setTimeout(() => HorrorSounds.trallalala(), 400);
    setTimeout(() => HorrorSounds.sahur(), 600);
    setTimeout(() => HorrorSounds.demonGrowl(), 800);
    setTimeout(() => HorrorSounds.screech(), 1000);
    
    // Screen tears and blood
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createScreenTear(), i * 200);
        setTimeout(() => createBloodDrip(), i * 250);
    }
    
    // Stop after 3 seconds
    setTimeout(() => {
        clearInterval(colorInterval);
        clearInterval(rotationInterval);
        clearInterval(messageInterval);
        document.body.style.filter = '';
        container.style.transform = '';
        document.getElementById('message').textContent = 'Hãy chọn... nếu còn dám...';
    }, 3000);
}

// Add background effects
setInterval(() => {
    if (gameState.isPlaying) {
        // Increase glitch frequency with chaos level
        const glitchChance = 0.05 + (gameState.chaosLevel * 0.02);
        
        if (Math.random() < glitchChance) {
            // Random glitch effect
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => {
                document.body.style.filter = '';
            }, 100);
        }
    }
}, 1000);

// Creepy messages at random intervals
const creepyMessages = [
    "Bạn có nghe thấy không?",
    "Ai đó đang nhìn bạn...",
    "Đừng quay lại...",
    "Hãy tiếp tục chơi...",
    "May mắn sắp hết rồi...",
    "Càng chơi càng tệ...",
    "Mọi thứ đang thay đổi...",
    "Bạn không thể dừng được đâu...",
    "CHAOS đang đến...",
];

setInterval(() => {
    if (gameState.isPlaying) {
        // Increase creepy message frequency with chaos level
        const messageChance = 0.1 + (gameState.chaosLevel * 0.03);
        
        if (Math.random() < messageChance) {
            const originalMessage = document.getElementById('message').textContent;
            const creepyMessage = creepyMessages[Math.floor(Math.random() * creepyMessages.length)];
            document.getElementById('message').textContent = creepyMessage;
            document.getElementById('message').style.color = '#ff0000';
            
            setTimeout(() => {
                document.getElementById('message').textContent = originalMessage;
                document.getElementById('message').style.color = '#ff6666';
            }, 2000);
        }
    }
}, 10000);

// Chaos level indicator
setInterval(() => {
    if (gameState.chaosLevel > 0 && gameState.isPlaying) {
        // Show chaos level occasionally
        if (Math.random() < 0.05) {
            const scoreBoard = document.querySelector('.score-board');
            const chaosIndicator = document.createElement('div');
            chaosIndicator.className = 'score-item';
            chaosIndicator.style.borderColor = '#ff0000';
            chaosIndicator.innerHTML = `
                <span class="label">CHAOS</span>
                <span class="value" style="color: #ff0000;">${gameState.chaosLevel}</span>
            `;
            
            scoreBoard.appendChild(chaosIndicator);
            
            setTimeout(() => {
                chaosIndicator.remove();
            }, 3000);
        }
    }
}, 5000);
