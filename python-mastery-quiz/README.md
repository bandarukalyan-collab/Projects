# Python Mastery Quiz

An interactive web-based quiz application for testing Python knowledge across various topics and difficulty levels.

## Features

- **5 Quiz Sets**: Foundation Mix, Function Power, Control & Errors, OOP Core, Advanced Memory
- **Multiple Question Types**: Theory, code output, debugging, and concept checks
- **Interactive UI**: Real-time feedback, progress tracking, and scoring
- **Responsive Design**: Clean, modern interface with smooth animations
- **Instant Results**: Score percentage, correct answers count, and performance feedback

## Files

- `index.html` - Main HTML structure
- `app.js` - Quiz logic and interactivity
- `styles.css` - Styling and responsive design

## Usage

### Option 1: Open directly in browser
Simply open `index.html` in your web browser:
```bash
start index.html
```

### Option 2: Use a local server (recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Quiz Structure

Each quiz set contains 7 questions covering:
- **Theory**: Conceptual questions about Python
- **Code Output**: Predict the output of code snippets
- **Debugging**: Find errors in code
- **Concept Checks**: Test understanding of Python features

## Question Sets

1. **Set 1 - Foundation Mix**: Basic Python concepts and syntax
2. **Set 2 - Function Power**: Functions, parameters, and scope
3. **Set 3 - Control & Errors**: Control flow and exception handling
4. **Set 4 - OOP Core**: Object-oriented programming concepts
5. **Set 5 - Advanced Memory**: Memory management and advanced topics

## Scoring

- Each question is worth 1 point
- Total score displayed at completion
- Percentage calculated based on correct answers
- Performance feedback provided based on score

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Customization

To add new questions or modify existing ones, edit the `app.js` file and update the quiz data structure.
