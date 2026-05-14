const quizSets = [
  {
    name: "Foundation Mix",
    questions: [
      {
        topic: "Python Basics",
        type: "Theory",
        difficulty: "Easy",
        question: "Which Python data type is best for storing an ordered, changeable collection?",
        options: ["tuple", "list", "set", "frozenset"],
        answer: 1,
        explanation: "A list is ordered and mutable, so it is the best fit here."
      },
      {
        topic: "Control Flow",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "for n in range(1, 6):\n    if n == 3:\n        continue\n    print(n, end=' ')",
        options: ["1 2 3 4 5", "1 2 4 5", "3", "1 2"],
        answer: 1,
        explanation: "`continue` skips only the current iteration, so 3 is not printed."
      },
      {
        topic: "Operators",
        type: "Theory",
        difficulty: "Easy",
        question: "Which operator is used for exponentiation in Python?",
        options: ["^", "**", "//", "%"],
        answer: 1,
        explanation: "`**` performs exponentiation, such as `2 ** 3`, which gives 8."
      },
      {
        topic: "Exception Handling",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Which keyword catches an exception raised inside a `try` block?",
        code: "try:\n    risky_operation()\n_____ ValueError:\n    print('Invalid value')",
        options: ["catch", "except", "error", "handle"],
        answer: 1,
        explanation: "Python uses `except` to catch exceptions."
      },
      {
        topic: "Functions",
        type: "Code Output",
        difficulty: "Medium",
        question: "What is the output?",
        code: "def add_item(item, items=[]):\n    items.append(item)\n    return items\n\nprint(add_item('a'))\nprint(add_item('b'))",
        options: ["['a'] then ['b']", "['a'] then ['a', 'b']", "Error", "['b'] then ['a']"],
        answer: 1,
        explanation: "Default mutable arguments are created once, so the same list is reused."
      },
      {
        topic: "Operators",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "What is the main difference between `is` and `==`?",
        options: [
          "`is` compares values, `==` compares memory identity",
          "`is` compares memory identity, `==` compares values",
          "Both always behave exactly the same",
          "`==` works only for numbers"
        ],
        answer: 1,
        explanation: "`is` checks whether two references point to the same object; `==` checks equality of values."
      },
      {
        topic: "Data Structures",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this list comprehension produce?",
        code: "nums = [1, 2, 3, 4]\nprint([n * n for n in nums if n % 2 == 0])",
        options: ["[1, 4, 9, 16]", "[4, 16]", "[2, 4]", "[1, 9]"],
        answer: 1,
        explanation: "The condition keeps only even numbers, then squares them: 2 becomes 4 and 4 becomes 16."
      },
      {
        topic: "OOP",
        type: "Scenario",
        difficulty: "Medium",
        question: "You want a method that belongs to a class and receives the class itself as the first argument. What should you use?",
        options: ["@staticmethod", "@classmethod", "@property", "@abstractmethod"],
        answer: 1,
        explanation: "`@classmethod` receives `cls`, so it can access or modify class-level state."
      },
      {
        topic: "Functions",
        type: "Debugging",
        difficulty: "Hard",
        question: "Which change avoids the common mutable-default-argument bug?",
        code: "def add_item(item, items=[]):\n    items.append(item)\n    return items",
        options: [
          "Use `items=None`, then create a new list inside the function",
          "Use `items=()` and call `items.append(item)`",
          "Use `global items` inside the function",
          "Move `items=[]` to the return statement"
        ],
        answer: 0,
        explanation: "Use `None` as the default, then set `items = []` inside the function when needed."
      },
      {
        topic: "Advanced Functions",
        type: "Code Output",
        difficulty: "Hard",
        question: "What will this generator code print?",
        code: "def nums():\n    yield 1\n    yield 2\n\ng = nums()\nprint(next(g))\nprint(list(g))",
        options: ["1 then [1, 2]", "1 then [2]", "2 then [1]", "Error"],
        answer: 1,
        explanation: "The first `next(g)` consumes 1. Converting the remaining generator to a list gives [2]."
      }
    ]
  },
  {
    name: "Function Power",
    questions: [
      {
        topic: "Functions",
        type: "Theory",
        difficulty: "Easy",
        question: "What is a positional argument?",
        options: [
          "An argument matched by its position in the function call",
          "An argument that must always be a string",
          "An argument stored globally",
          "An argument used only in class methods"
        ],
        answer: 0,
        explanation: "A positional argument is matched to a parameter based on where it appears in the function call."
      },
      {
        topic: "Functions",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "def greet(name='Python'):\n    print('Hello', name)\n\ngreet()",
        options: ["Hello", "Hello Python", "Python Hello", "Error"],
        answer: 1,
        explanation: "Because no argument is passed, the default value `'Python'` is used."
      },
      {
        topic: "Lambda",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Which keyword creates an anonymous function in Python?",
        code: "square = _____ x: x * x",
        options: ["def", "func", "lambda", "return"],
        answer: 2,
        explanation: "`lambda` creates a small anonymous function."
      },
      {
        topic: "Functions",
        type: "Code Output",
        difficulty: "Easy",
        question: "What does this function call return?",
        code: "def total(*nums):\n    return sum(nums)\n\nprint(total(2, 3, 5))",
        options: ["235", "10", "[2, 3, 5]", "Error"],
        answer: 1,
        explanation: "`*nums` collects positional values into a tuple, and `sum()` adds them."
      },
      {
        topic: "Functions",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "What does `**kwargs` collect?",
        options: [
          "Extra positional arguments as a tuple",
          "Extra keyword arguments as a dictionary",
          "Only default arguments",
          "Only return values"
        ],
        answer: 1,
        explanation: "`**kwargs` collects extra keyword arguments into a dictionary."
      },
      {
        topic: "Lambda",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "nums = [1, 2, 3]\nprint(list(map(lambda x: x + 10, nums)))",
        options: ["[1, 2, 3, 10]", "[10, 20, 30]", "[11, 12, 13]", "Error"],
        answer: 2,
        explanation: "The lambda adds 10 to each item."
      },
      {
        topic: "Decorators",
        type: "Theory",
        difficulty: "Medium",
        question: "What is the main purpose of a decorator?",
        options: [
          "To delete a function after it runs",
          "To modify or extend behavior without changing the original function body",
          "To convert every function into a class",
          "To stop exceptions from happening"
        ],
        answer: 1,
        explanation: "Decorators wrap functions or classes to extend behavior while keeping the original code cleaner."
      },
      {
        topic: "Decorators",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this decorated function print first?",
        code: "def deco(func):\n    def wrapper():\n        print('Before')\n        func()\n    return wrapper\n\n@deco\ndef say_hi():\n    print('Hi')\n\nsay_hi()",
        options: ["Hi", "Before", "wrapper", "deco"],
        answer: 1,
        explanation: "Calling `say_hi()` actually calls the wrapper, which prints `Before` first."
      },
      {
        topic: "Functions",
        type: "Debugging",
        difficulty: "Hard",
        question: "Why can this call fail?",
        code: "def profile(name, age):\n    return f'{name} is {age}'\n\nprofile(age=25, 'Ravi')",
        options: [
          "A positional argument cannot follow a keyword argument",
          "Keyword arguments are never allowed",
          "f-strings cannot use variables",
          "The function needs `*args`"
        ],
        answer: 0,
        explanation: "In Python calls, positional arguments must come before keyword arguments."
      },
      {
        topic: "Decorators",
        type: "Scenario",
        difficulty: "Hard",
        question: "You want to log every call to several functions without repeating logging code inside each function. What is the best fit?",
        options: ["A decorator", "A tuple", "A shallow copy", "A metaclass for every function"],
        answer: 0,
        explanation: "A decorator is ideal for reusable cross-cutting behavior like logging, timing, or authorization."
      }
    ]
  },
  {
    name: "Control & Errors",
    questions: [
      {
        topic: "Control Flow",
        type: "Theory",
        difficulty: "Easy",
        question: "Which statement is used to choose between branches based on a condition?",
        options: ["for", "if", "def", "class"],
        answer: 1,
        explanation: "`if` executes code conditionally."
      },
      {
        topic: "Control Flow",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "x = 7\nif x > 5:\n    print('High')\nelse:\n    print('Low')",
        options: ["High", "Low", "True", "Error"],
        answer: 0,
        explanation: "Since 7 is greater than 5, the `if` block runs."
      },
      {
        topic: "Loops",
        type: "Theory",
        difficulty: "Easy",
        question: "What does `break` do inside a loop?",
        options: [
          "Skips only the current iteration",
          "Exits the loop immediately",
          "Restarts the loop from the beginning",
          "Converts a loop into a function"
        ],
        answer: 1,
        explanation: "`break` stops the loop immediately."
      },
      {
        topic: "Ternary",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Complete the conditional expression.",
        code: "status = 'adult' _____ age >= 18 else 'minor'",
        options: ["if", "when", "for", "while"],
        answer: 0,
        explanation: "Python's ternary form is `value_if_true if condition else value_if_false`."
      },
      {
        topic: "Loops",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "for n in range(4):\n    if n == 2:\n        break\n    print(n, end=' ')",
        options: ["0 1", "0 1 2", "1 2 3", "2 3"],
        answer: 0,
        explanation: "The loop stops when `n` becomes 2, so only 0 and 1 are printed."
      },
      {
        topic: "Exception Handling",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "try:\n    print(10 // 0)\nexcept ZeroDivisionError:\n    print('Cannot divide')",
        options: ["0", "10", "Cannot divide", "ZeroDivisionError only"],
        answer: 2,
        explanation: "The division raises `ZeroDivisionError`, so the matching `except` block runs."
      },
      {
        topic: "Exception Handling",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "What is the role of `finally`?",
        options: [
          "Runs only if there is no error",
          "Runs only if an error occurs",
          "Runs whether an exception occurs or not",
          "Replaces all except blocks"
        ],
        answer: 2,
        explanation: "`finally` is commonly used for cleanup because it runs in both success and error cases."
      },
      {
        topic: "Loops",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "for n in range(1, 5):\n    if n % 2 == 0:\n        continue\n    print(n, end=' ')",
        options: ["1 2 3 4", "2 4", "1 3", "3 1"],
        answer: 2,
        explanation: "`continue` skips even numbers, so only odd numbers are printed."
      },
      {
        topic: "Exception Handling",
        type: "Debugging",
        difficulty: "Hard",
        question: "What is the problem with this exception handling?",
        code: "try:\n    value = int('abc')\nexcept Exception:\n    print('Something went wrong')",
        options: [
          "It catches too broadly and can hide the real issue",
          "It cannot catch `ValueError`",
          "`int()` never raises errors",
          "The `try` block must be empty"
        ],
        answer: 0,
        explanation: "Catching broad `Exception` can hide bugs. A specific `ValueError` handler is clearer here."
      },
      {
        topic: "Control Flow",
        type: "Scenario",
        difficulty: "Hard",
        question: "You need to stop processing as soon as a matching item is found in a loop. Which statement fits best?",
        options: ["continue", "break", "pass", "finally"],
        answer: 1,
        explanation: "`break` exits the loop immediately once the match is found."
      }
    ]
  },
  {
    name: "OOP Core",
    questions: [
      {
        topic: "OOP",
        type: "Theory",
        difficulty: "Easy",
        question: "What is a class in Python?",
        options: [
          "A blueprint for creating objects",
          "A loop that runs forever",
          "A built-in exception type only",
          "A copy of a list"
        ],
        answer: 0,
        explanation: "A class defines the structure and behavior used to create objects."
      },
      {
        topic: "OOP",
        type: "Theory",
        difficulty: "Easy",
        question: "Which method is called automatically when a new object is created?",
        options: ["__str__", "__init__", "__call__", "__len__"],
        answer: 1,
        explanation: "`__init__` initializes a new object after it is created."
      },
      {
        topic: "Inheritance",
        type: "Theory",
        difficulty: "Easy",
        question: "What is inheritance mainly used for?",
        options: ["Code reuse and specialization", "Deleting parent classes", "Changing Python syntax", "Stopping object creation"],
        answer: 0,
        explanation: "Inheritance lets child classes reuse and extend parent class behavior."
      },
      {
        topic: "OOP",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "class Dog:\n    def speak(self):\n        return 'Woof'\n\nprint(Dog().speak())",
        options: ["Dog", "speak", "Woof", "Error"],
        answer: 2,
        explanation: "An object is created and its `speak()` method returns `'Woof'`."
      },
      {
        topic: "Inheritance",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "class Animal:\n    def sound(self):\n        return 'Sound'\n\nclass Cat(Animal):\n    pass\n\nprint(Cat().sound())",
        options: ["Cat", "Sound", "None", "Error"],
        answer: 1,
        explanation: "Cat inherits `sound()` from Animal."
      },
      {
        topic: "Methods",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "Which statement about `@staticmethod` is true?",
        options: [
          "It receives `self` automatically",
          "It receives `cls` automatically",
          "It receives neither `self` nor `cls` automatically",
          "It can only be used outside classes"
        ],
        answer: 2,
        explanation: "A static method behaves like a regular function placed inside a class namespace."
      },
      {
        topic: "Methods",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "class Counter:\n    count = 0\n    @classmethod\n    def inc(cls):\n        cls.count += 1\n\nCounter.inc()\nprint(Counter.count)",
        options: ["0", "1", "None", "Error"],
        answer: 1,
        explanation: "The class method receives the class as `cls` and increments the class variable."
      },
      {
        topic: "OOP",
        type: "Scenario",
        difficulty: "Medium",
        question: "You have different classes with the same method name, and Python calls the correct method based on the object. Which concept is this?",
        options: ["Polymorphism", "Type casting", "List comprehension", "String formatting"],
        answer: 0,
        explanation: "Polymorphism lets different object types respond to the same method call in their own way."
      },
      {
        topic: "Metaclasses",
        type: "Theory",
        difficulty: "Hard",
        question: "What is a metaclass?",
        options: [
          "A class that creates or controls classes",
          "A list of class names",
          "A function that catches exceptions",
          "A decorator used only for strings"
        ],
        answer: 0,
        explanation: "A metaclass controls class creation, just as a class controls object creation."
      },
      {
        topic: "OOP",
        type: "Debugging",
        difficulty: "Hard",
        question: "Why can this code fail?",
        code: "class A:\n    def show():\n        print('Hi')\n\nA().show()",
        options: [
          "`show` is missing `self` for an instance method",
          "Classes cannot have methods",
          "`print` cannot be used in classes",
          "The class name must be lowercase"
        ],
        answer: 0,
        explanation: "Instance methods should accept `self`; otherwise Python passes the instance and the argument count mismatches."
      }
    ]
  },
  {
    name: "Advanced Memory",
    questions: [
      {
        topic: "Copying",
        type: "Theory",
        difficulty: "Easy",
        question: "What does a shallow copy do?",
        options: [
          "Copies the outer object but keeps references to nested objects",
          "Always copies every nested object fully",
          "Deletes the original object",
          "Converts a list into a tuple"
        ],
        answer: 0,
        explanation: "A shallow copy creates a new outer container, but nested objects are still shared."
      },
      {
        topic: "String Formatting",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "name = 'Python'\nprint(f'Hello {name}')",
        options: ["Hello name", "Hello Python", "f'Hello Python'", "Error"],
        answer: 1,
        explanation: "An f-string evaluates `{name}` and inserts its value."
      },
      {
        topic: "Generators",
        type: "Theory",
        difficulty: "Easy",
        question: "Which keyword is used to produce values from a generator function?",
        options: ["return", "yield", "send", "next"],
        answer: 1,
        explanation: "`yield` produces a value and pauses the generator."
      },
      {
        topic: "Copying",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Which function creates a deep copy using Python's `copy` module?",
        code: "import copy\nnew_data = copy._____(data)",
        options: ["copy", "deepcopy", "clone", "duplicate"],
        answer: 1,
        explanation: "`copy.deepcopy()` recursively copies nested objects."
      },
      {
        topic: "Generators",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "Why are generators useful for large data?",
        options: [
          "They always sort data automatically",
          "They produce items lazily instead of storing all values at once",
          "They make all code run in parallel",
          "They prevent every exception"
        ],
        answer: 1,
        explanation: "Generators yield values one at a time, which can save memory."
      },
      {
        topic: "Identity",
        type: "Code Output",
        difficulty: "Medium",
        question: "What does this code check?",
        code: "a = [1, 2]\nb = a\nprint(a is b)",
        options: ["Whether values are different", "Whether both names point to the same object", "Whether `a` is a tuple", "Whether the list is empty"],
        answer: 1,
        explanation: "`is` checks object identity. Since `b = a`, both names reference the same list."
      },
      {
        topic: "List Comprehension",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "words = ['hi', 'python']\nprint([len(w) for w in words])",
        options: ["['hi', 'python']", "[2, 6]", "[0, 1]", "Error"],
        answer: 1,
        explanation: "The comprehension stores the length of each word."
      },
      {
        topic: "Copying",
        type: "Debugging",
        difficulty: "Medium",
        question: "Why does changing `b[0][0]` also affect `a` here?",
        code: "import copy\na = [[1], [2]]\nb = copy.copy(a)\nb[0][0] = 99\nprint(a)",
        options: [
          "Because shallow copy shares nested lists",
          "Because integers are always mutable",
          "Because `copy.copy` deletes `b`",
          "Because print changes the list"
        ],
        answer: 0,
        explanation: "The outer list is copied, but the inner lists are shared."
      },
      {
        topic: "Generators",
        type: "Code Output",
        difficulty: "Hard",
        question: "What happens after a generator is exhausted?",
        code: "g = (x for x in [1])\nprint(next(g))\nprint(next(g))",
        options: ["Prints 1 twice", "Prints None", "Raises StopIteration", "Creates a new generator"],
        answer: 2,
        explanation: "Once a generator has no more values, `next()` raises `StopIteration`."
      },
      {
        topic: "Memory",
        type: "Scenario",
        difficulty: "Hard",
        question: "You must process a million records one by one without loading everything into memory. What should you prefer?",
        options: ["A generator", "A deep copy of all records", "A huge list of all results first", "A metaclass"],
        answer: 0,
        explanation: "A generator lets you stream values lazily and keeps memory usage lower."
      }
    ]
  }
];

let currentSetIndex = 0;
let activeQuestions = [...quizSets[currentSetIndex].questions];
let currentIndex = 0;
let score = 0;
let answered = new Map();

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const scoreText = document.getElementById("scoreText");
const topicTag = document.getElementById("topicTag");
const typeTag = document.getElementById("typeTag");
const difficultyTag = document.getElementById("difficultyTag");
const questionText = document.getElementById("questionText");
const codeBlock = document.getElementById("codeBlock");
const codeText = codeBlock.querySelector("code");
const optionsWrap = document.getElementById("options");
const feedback = document.getElementById("feedback");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const resultPanel = document.getElementById("resultPanel");
const resultFill = document.getElementById("resultFill");
const resultPercent = document.getElementById("resultPercent");
const resultCorrect = document.getElementById("resultCorrect");
const resultTotal = document.getElementById("resultTotal");
const finalScore = document.getElementById("finalScore");
const finalMessage = document.getElementById("finalMessage");
const restartBtn = document.getElementById("restartBtn");
const quizPanel = document.querySelector(".quiz-panel");

function renderQuestion() {
  const question = activeQuestions[currentIndex];
  resultPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");

  progressText.textContent = `Question ${currentIndex + 1} of ${activeQuestions.length}`;
  progressFill.style.width = `${((currentIndex + 1) / activeQuestions.length) * 100}%`;
  scoreText.textContent = `Score ${score}`;
  topicTag.textContent = question.topic;
  typeTag.textContent = question.type;
  difficultyTag.textContent = question.difficulty;
  difficultyTag.className = `tag level-${question.difficulty.toLowerCase()}`;
  questionText.textContent = question.question;

  if (question.code) {
    codeText.textContent = question.code;
    codeBlock.classList.remove("hidden");
  } else {
    codeBlock.classList.add("hidden");
  }

  feedback.className = "feedback hidden";
  feedback.textContent = "";
  optionsWrap.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const text = document.createElement("span");
    text.className = "option-text";
    text.textContent = option;
    button.append(letter, text);
    button.addEventListener("click", () => chooseAnswer(index));
    optionsWrap.appendChild(button);
  });

  const saved = answered.get(currentIndex);
  if (saved) {
    showAnswer(saved.selected, false);
  }

  prevBtn.disabled = currentIndex === 0;
  nextBtn.textContent = currentIndex === activeQuestions.length - 1 ? "Finish" : "Next";
}

function chooseAnswer(selected) {
  if (!answered.has(currentIndex)) {
    const correct = selected === activeQuestions[currentIndex].answer;
    if (correct) score += 1;
    answered.set(currentIndex, { selected, correct });
  }
  showAnswer(selected, true);
  scoreText.textContent = `Score ${score}`;
}

function showAnswer(selected) {
  const question = activeQuestions[currentIndex];
  const buttons = [...optionsWrap.querySelectorAll(".option")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) button.classList.add("correct");
    if (index === selected && selected !== question.answer) button.classList.add("wrong");
  });

  const correct = selected === question.answer;
  feedback.className = `feedback ${correct ? "good" : "bad"}`;
  if (correct) {
    feedback.innerHTML = `
      <span class="feedback-title">Correct answer</span>
      <span class="feedback-copy">${question.explanation}</span>
    `;
    return;
  }

  feedback.innerHTML = `
    <span class="feedback-title">Not quite</span>
    <span class="correct-answer">Correct answer: ${question.options[question.answer]}</span>
    <span class="feedback-copy">${question.explanation}</span>
  `;
}

function showResults() {
  quizPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");
  progressText.textContent = "Draft complete";
  finalScore.textContent = `You scored ${score} out of ${activeQuestions.length}`;
  const percent = Math.round((score / activeQuestions.length) * 100);
  resultFill.style.width = `${percent}%`;
  resultPercent.textContent = `${percent}%`;
  resultCorrect.textContent = `${score} correct`;
  resultTotal.textContent = `${activeQuestions.length} questions`;
  finalMessage.textContent = percent >= 75
    ? "Strong start. The mixed question style is working well for practice."
    : "Good draft run. Review the explanations and retry to strengthen weak areas.";
}

function restartQuiz() {
  activeQuestions = [...quizSets[currentSetIndex].questions];
  currentIndex = 0;
  score = 0;
  answered = new Map();
  renderQuestion();
}

document.querySelectorAll(".set-chip[data-set]").forEach(button => {
  button.addEventListener("click", () => {
    currentSetIndex = Number(button.dataset.set);
    document.querySelectorAll(".set-chip[data-set]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    restartQuiz();
  });
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex === activeQuestions.length - 1) {
    showResults();
    return;
  }
  currentIndex += 1;
  renderQuestion();
});

restartBtn.addEventListener("click", () => {
  restartQuiz();
});

renderQuestion();
