# Cadence

<p align="center">
  <strong>A modern speedcubing timer built for performance, precision, and focus.</strong>
</p>

Cadence is an open-source speedcubing timer designed with a modern interface and powerful statistics. It provides official scramble generation, detailed solve analytics, customizable sessions, and a fast, distraction-free experience for both casual and competitive cubers.

---

## ✨ Features

### ⏱️ Timer

- Responsive keyboard timer
- Inspection support
- +2 and DNF penalties
- Automatic scramble generation
- Copy and regenerate scrambles
- Multiple puzzle support

### 🧩 Supported Events

- 2×2×2
- 3×3×3
- 3×3 Blindfolded
- 3×3 One-Handed
- Fewest Moves
- 4×4×4
- 5×5×5
- 6×6×6
- 7×7×7
- Megaminx
- Pyraminx
- Skewb
- Square-1
- Clock
- Mirror Cube

### 📊 Statistics

- Best and worst solve
- Session average
- Mean
- Standard deviation
- Average of 5 (Ao5)
- Average of 12 (Ao12)
- Average of 50 (Ao50)
- Average of 100 (Ao100)
- Rolling averages
- Personal best progression
- Time distribution histogram
- Solve history

### 📁 Session Management

- Unlimited sessions
- Rename sessions
- Duplicate sessions
- Archive sessions
- Delete sessions
- Puzzle-specific sessions

### 🎨 User Experience

- Clean modern interface
- Responsive design
- Dark mode
- Custom accent colors
- Adjustable timer size
- Optional hide-while-solving mode
- Persistent local storage

---

## 🛠️ Tech Stack

- **Next.js 16**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Zustand**
- **Recharts**

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/cadence.git
cd cadence
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
app/
components/
lib/
  cubing/
  statistics/
  store.ts
public/
```

---

## 📈 Roadmap

- [ ] Import/Export solves
- [ ] WCA session import
- [ ] Smart cube support
- [ ] Theme customization
- [ ] Keyboard shortcut customization
- [ ] Solve replay
- [ ] Cross-device sync
- [ ] PWA support
- [x] Offline mode
- [ ] Mobile optimizations

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/my-feature
```

1. Commit your changes.

```bash
git commit -m "Add my feature"
```

1. Push to your branch.

```bash
git push origin feature/my-feature
```

1. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
Built with ❤️ for the speedcubing community.
</p>
