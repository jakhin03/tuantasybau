# Tài Xỉu - Vietnamese Horror Game

A web-based horror game inspired by Vietnamese coin toss mechanics with a dark twist.

## 🎮 Game Concept

Players choose between "NGÚP" or "ỬA" and the system randomly generates 4 results from ["NGÚP", "ỬA", "ÚP", "NGỬA"]. If the player's choice matches the outcome, they receive a special victory animation. If they lose, they experience a horror jumpscare.

## 🎨 Features

- **Polished UI/UX**: Dark horror-themed interface with glitch effects
- **Dynamic Animations**: Multiple victory and jumpscare variations
- **Progressive Horror**: Random creepy messages and visual glitches
- **Score Tracking**: Keep track of wins, losses, and total score
- **Responsive Design**: Works on both desktop and mobile devices
- **Audio Effects**: Background music, coin flip sounds, and jumpscare audio (placeholders included)

## 🚀 How to Play

1. Open `index.html` in a modern web browser
2. Click "BẮT ĐẦU" (Start) to begin
3. Choose either "NGÚP" or "ỬA"
4. Watch the coins flip and see your fate!
5. Try to survive as many rounds as possible

## 📁 Project Structure

```
tai-xiu/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── script.js           # Game logic and interactions
├── README.md           # This file
└── assets/             # (Optional) Add your own audio files
    └── audio/
        ├── bg-music.mp3
        ├── coin-flip.mp3
        ├── jumpscare.mp3
        ├── victory.mp3
        └── ambient.mp3
```

## 🎵 Adding Audio (Optional)

To enhance the horror experience, add audio files to the `assets/audio/` directory:

- `bg-music.mp3`: Background music (looping)
- `coin-flip.mp3`: Coin flip sound effect
- `jumpscare.mp3`: Jumpscare sound effect
- `victory.mp3`: Victory sound effect
- `ambient.mp3`: Ambient horror sounds

## 🎯 Game Mechanics

### Scoring System
- Win: +10 points
- Loss: -5 points (minimum 0)

### Victory Variations
The game includes multiple victory messages that appear randomly, adding psychological tension as players never know if the next "victory" will be genuine or ominous.

### Jumpscare System
- Random jumpscare images displayed on loss
- Screen shake effect
- Loud sound effect (when audio is added)
- Static noise overlay

### Progressive Horror Elements
- Random glitch effects during gameplay
- Creepy messages appearing at intervals
- Color distortion effects
- Unpredictable animation timing

## 🛠️ Customization

### Adding More Jumpscares
Edit the `jumpscareImages` array in `script.js` to add more horror images (use base64 or URLs).

### Modifying Victory Messages
Edit the `victoryMessages` array in `script.js` to customize victory text.

### Adjusting Difficulty
Modify the probability values in `script.js`:
- `Math.random() < 0.05`: Frequency of glitch effects (5%)
- `Math.random() < 0.1`: Frequency of creepy messages (10%)

## ⚠️ Warning

This game contains:
- Horror imagery
- Sudden loud sounds (when audio is enabled)
- Flashing effects
- Psychological horror elements

Not recommended for:
- People with heart conditions
- Those sensitive to flashing lights
- Players under 13 years old

## 🌐 Browser Compatibility

Tested and works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Future Enhancements

- [ ] Add difficulty levels
- [ ] Implement save system
- [ ] Add more jumpscare variations
- [ ] Include multiplayer mode
- [ ] Add story mode with progressive horror
- [ ] Implement achievement system
- [ ] Add sound toggle option

## 🤝 Contributing

Feel free to fork this project and add your own horror elements!

## 📜 License

Free to use and modify for personal and commercial projects.

---

**Chơi tốt... nếu bạn dám! 👻**
