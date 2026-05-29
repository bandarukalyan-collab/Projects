const roadmap = [
  ["01", "Course Overview and Syllabus", "Understand the full Python learning plan and notebook sequence."],
  ["02", "Python Fundamentals", "Keywords, data types, type casting, variables, constants, naming rules, and Python 2 vs 3."],
  ["03", "Operators", "Arithmetic, comparison, logical, assignment, identity, and membership operators."],
  ["04", "Control Statements", "if, elif, else, for, while, and pass statements."],
  ["05", "Break and Continue", "Control loop execution with break and continue statements."],
  ["06", "Function Arguments", "Return statements, default arguments, positional arguments, *args, and **kwargs."],
  ["07", "Strings and Comprehensions", "String formatting, identity vs equality, ternary operator, and list comprehension."],
  ["08", "Scope, LEGB, and nonlocal", "Local, enclosing, global, built-in scope, global, nonlocal, and closures."],
  ["09", "Lambda, Decorators, and Closures", "Anonymous functions, decorators, closures, and built-in decorators."],
  ["10", "Generators and yield", "Create memory-efficient iteration with generators and yield."],
  ["11", "Memoization", "Cache repeated function results and understand optimization patterns."],
  ["12", "Built-in Data Structures", "Lists, tuples, sets, dictionaries, mutability, ordering, and operations."],
  ["13", "Object Copying", "Assignment, shallow copy, deep copy, and nested object behavior."],
  ["14", "Exception Handling", "try, except, else, finally, raise, and custom exception patterns."],
  ["15", "Context Managers", "Use with statements and custom context managers for reliable cleanup."],
  ["16", "OOP and Advanced OOP", "Classes, inheritance, methods, metaclasses, monkey patching, and dunder methods."],
  ["17", "Memory Management", "References, object identity, garbage collection, and memory-efficient code."],
  ["18", "Global Interpreter Lock", "Understand the GIL and its impact on Python execution."],
  ["19", "Threading vs Multiprocessing", "Compare concurrency choices for I/O-bound and CPU-bound work."],
  ["20", "Asyncio Programming", "Use asynchronous programming patterns for non-blocking tasks."],
  ["21", "Data-Structure Practical Problems", "Practice interview-style problems using Python data structures."],
  ["22", "Iterators and Python Internals", "Iterator protocol, internals, and deeper runtime behavior."],
  ["23", "os and shutil Modules", "Use Python for file-system utilities and automation tasks."],
  ["24", "Regex Validation", "Validate strings and patterns using regular expressions."],
  ["25", "Logging Module", "Add structured runtime logging to Python programs."],
  ["26", "Practical Patterns", "Property setters, environment variables, and practical coding patterns."],
  ["27", "Practice Exercises", "Revise every major topic using the GitHub practice exercise set."],
];

const topics = [
  ["Course Overview", "Syllabus and recommended study sequence.", "Beginner", "1 notebook"],
  ["Python Fundamentals", "Keywords, data types, type casting, variables, constants, naming rules, and Python 2 vs 3.", "Beginner", "1 notebook"],
  ["Operators", "Arithmetic, comparison, logical, assignment, identity, and membership operators.", "Beginner", "1 notebook"],
  ["Control Statements", "if, elif, else, for, while, and pass.", "Beginner", "1 notebook"],
  ["Break and Continue", "Loop-control statements for stopping or skipping iterations.", "Beginner", "1 notebook"],
  ["Function Arguments", "Return statements, default arguments, positional arguments, *args, and **kwargs.", "Core", "1 notebook"],
  ["Strings and Comprehensions", "String formatting, is vs ==, ternary operator, and list comprehension.", "Core", "1 notebook"],
  ["Scope, LEGB, and nonlocal", "Local, enclosing, global, built-in lookup, global, nonlocal, and closures.", "Core", "1 notebook"],
  ["Lambda and Decorators", "Lambda functions, decorators, closures, and built-in decorators.", "Core", "1 notebook"],
  ["Generators", "yield, generator expressions, lazy iteration, and memory-efficient workflows.", "Core", "1 notebook"],
  ["Memoization", "Caching repeated function results and optimization patterns.", "Advanced", "1 notebook"],
  ["Built-in Data Structures", "Lists, tuples, sets, dictionaries, mutability, ordering, and common operations.", "Core", "1 notebook"],
  ["Object Copying", "Assignment vs copy, shallow copy, deep copy, and nested structures.", "Core", "1 notebook"],
  ["Exception Handling", "try, except, else, finally, raise, and custom exceptions.", "Core", "1 notebook"],
  ["Context Managers", "with statements, __enter__, __exit__, and cleanup patterns.", "Advanced", "1 notebook"],
  ["OOP and Advanced OOP", "Classes, inheritance, methods, metaclasses, monkey patching, and dunder methods.", "Advanced", "1 notebook"],
  ["Memory Management", "Object identity, references, reference counts, garbage collection, and memory efficiency.", "Advanced", "1 notebook"],
  ["Global Interpreter Lock", "GIL behavior and why it matters for Python concurrency.", "Advanced", "1 notebook"],
  ["Threading vs Multiprocessing", "Concurrency choices for I/O-bound and CPU-bound work.", "Advanced", "1 notebook"],
  ["Asyncio Programming", "Async and await patterns for asynchronous programming.", "Advanced", "1 notebook"],
  ["Data-Structure Problems", "Practical interview-style data-structure problems.", "Core", "1 notebook"],
  ["Iterators and Internals", "Iterator protocol and deeper Python runtime behavior.", "Advanced", "1 notebook"],
  ["os and shutil Modules", "File-system utilities, path operations, copying, moving, and automation.", "Core", "1 notebook"],
  ["Regex Validation", "Regular expressions for validation and pattern matching.", "Advanced", "1 notebook"],
  ["Logging Module", "Structured logging and runtime diagnostics.", "Core", "1 notebook"],
  ["Practical Patterns", "Property setters, environment variables, and practical coding patterns.", "Advanced", "1 notebook"],
  ["Practice Exercises", "Revision, interview preparation, and hands-on exercises across major topics.", "Core", "1 guide"],
];

const sourceBase =
  "https://github.com/bandarukalyan-collab/Python/blob/main/python%20study%20material/";

const materialFiles = {
  "course overview and syllabus": "Course_Syllabus_Python.ipynb",
  "course overview": "Course_Syllabus_Python.ipynb",
  "python fundamentals": "Python Fundamentals-1(keywords,datatypes,typecasting) .ipynb",
  operators: "Python Operators.ipynb",
  "control statements": "Python Control Statements.ipynb",
  "break and continue": "Break and Continue Statements - Python.ipynb",
  "function arguments": "Python Function Arguments.ipynb",
  "strings and comprehensions": "Python List Compre., Ternary Oper., String forma., is vs ==.ipynb",
  "scope, legb, and nonlocal": "Python Scope LEGB and nonlocal.ipynb",
  "lambda, decorators, and closures": "Python Decorators and Lambda Functions.ipynb",
  "lambda and decorators": "Python Decorators and Lambda Functions.ipynb",
  "generators and yield": "Python Generators.ipynb",
  generators: "Python Generators.ipynb",
  memoization: "Python Memoization.ipynb",
  "built-in data structures": "Python Built-in Data Structures.ipynb",
  "object copying": "Python Object Copying.ipynb",
  "exception handling": "Python Exception Handling.ipynb",
  "context managers": "Python Context Managers and with Statement.ipynb",
  "oop and advanced oop": "Python OOPS Concepts.ipynb",
  "memory management": "Python Memory Management.ipynb",
  "global interpreter lock": "Python Global Interpreter Lock GIL.ipynb",
  "threading vs multiprocessing": "Python Threading vs Multiprocessing.ipynb",
  "asyncio programming": "Python Asyncio and Asynchronous Programming.ipynb",
  "data-structure practical problems": "Python Data Structures Practical Problems.ipynb",
  "data-structure problems": "Python Data Structures Practical Problems.ipynb",
  "iterators and python internals": "Python Iterators and Python Internals.ipynb",
  "iterators and internals": "Python Iterators and Python Internals.ipynb",
  "os and shutil modules": "Python Modules os and shutil.ipynb",
  "regex validation": "Python Regex Validation.ipynb",
  "logging module": "Python Logging Module.ipynb",
  "practical patterns": "Python Practical Patterns.ipynb",
  "practice exercises": "PRACTICE_EXERCISES.md",
};

const materialDetails = {
  "course overview": {
    learn: ["How the Python course is structured.", "Recommended order from beginner topics to advanced concepts.", "How notebooks and exercises should be used together."],
    practice: ["Skim the full sequence once.", "Mark topics you already know.", "Start from Fundamentals if any beginner topic feels weak."],
    checkpoints: ["You can explain the study order.", "You know where practice exercises fit.", "You have a clear next topic."],
  },
  "course overview and syllabus": {
    learn: ["How the Python course is structured.", "Recommended order from beginner topics to advanced concepts.", "How notebooks and exercises should be used together."],
    practice: ["Skim the full sequence once.", "Mark topics you already know.", "Start from Fundamentals if any beginner topic feels weak."],
    checkpoints: ["You can explain the study order.", "You know where practice exercises fit.", "You have a clear next topic."],
  },
  "python fundamentals": {
    learn: ["Python keywords, identifiers, variables, constants, and naming rules.", "Core data types and type casting.", "Important differences between Python 2 and Python 3."],
    practice: ["Create variables for name, age, salary, and active status.", "Print each value and type.", "Write valid and invalid variable names with reasons."],
    checkpoints: ["You can identify basic data types.", "You can convert between common types.", "You can explain dynamic typing."],
  },
  operators: {
    learn: ["Arithmetic, comparison, logical, assignment, identity, and membership operators.", "Difference between `/` and `//`.", "How `is` and membership checks behave."],
    practice: ["Build a BMI calculator.", "Write password validation using logical operators.", "Create examples for every operator group."],
    checkpoints: ["You can choose the right operator.", "You can explain identity vs equality.", "You can combine conditions clearly."],
  },
  "control statements": {
    learn: ["if, elif, else branching.", "for and while loops.", "pass as a placeholder statement."],
    practice: ["Write a grade classifier.", "Print number ranges with for and while loops.", "Use conditions inside loops."],
    checkpoints: ["You can write clean branching logic.", "You can choose for vs while.", "You avoid unnecessary nested conditions."],
  },
  "break and continue": {
    learn: ["How break exits a loop.", "How continue skips the current iteration.", "Where loop-control statements make code simpler."],
    practice: ["Stop a loop when a target value is found.", "Skip negative numbers in a list.", "Trace loop output before running code."],
    checkpoints: ["You can predict loop output.", "You know when to stop early.", "You know when to skip and continue."],
  },
  "function arguments": {
    learn: ["Return values, default arguments, positional arguments, keyword arguments.", "*args and **kwargs.", "Common argument-ordering mistakes."],
    practice: ["Write functions with default arguments.", "Use *args to sum many values.", "Use **kwargs to print student details."],
    checkpoints: ["You can call functions correctly.", "You can return and unpack multiple values.", "You avoid mutable default argument bugs."],
  },
  "strings and comprehensions": {
    learn: ["f-strings, format, and older string formatting.", "Ternary expressions.", "List comprehensions and identity vs equality."],
    practice: ["Format the same output three ways.", "Filter even numbers using list comprehension.", "Compare `is` and `==` using lists."],
    checkpoints: ["You can write concise transformations.", "You can explain `is` vs `==`.", "You can read list comprehensions comfortably."],
  },
  "scope, legb, and nonlocal": {
    learn: ["Local, enclosing, global, and built-in lookup.", "global and nonlocal usage.", "Closures and nested functions."],
    practice: ["Create nested functions showing LEGB.", "Update a global counter.", "Build a closure-based counter."],
    checkpoints: ["You can predict variable lookup.", "You know when nonlocal is needed.", "You avoid accidental global state."],
  },
  "lambda and decorators": {
    learn: ["Lambda functions with map and filter.", "Function decorators.", "Closures and reusable behavior wrappers."],
    practice: ["Use lambda to transform a list.", "Create a before/after decorator.", "Write a decorator that accepts arguments."],
    checkpoints: ["You can read decorator syntax.", "You can explain wrapper functions.", "You use lambda only when it stays readable."],
  },
  "lambda, decorators, and closures": {
    learn: ["Lambda functions with map and filter.", "Function decorators.", "Closures and reusable behavior wrappers."],
    practice: ["Use lambda to transform a list.", "Create a before/after decorator.", "Write a decorator that accepts arguments."],
    checkpoints: ["You can read decorator syntax.", "You can explain wrapper functions.", "You use lambda only when it stays readable."],
  },
  generators: {
    learn: ["yield and lazy value production.", "Generator expressions.", "Why generators are memory efficient."],
    practice: ["Create a generator from 1 to 5.", "Use next to consume values.", "Write an infinite even-number generator."],
    checkpoints: ["You can explain lazy iteration.", "You know when generators beat lists.", "You can trace generator state."],
  },
  "generators and yield": {
    learn: ["yield and lazy value production.", "Generator expressions.", "Why generators are memory efficient."],
    practice: ["Create a generator from 1 to 5.", "Use next to consume values.", "Write an infinite even-number generator."],
    checkpoints: ["You can explain lazy iteration.", "You know when generators beat lists.", "You can trace generator state."],
  },
  memoization: {
    learn: ["Caching repeated function results.", "Where memoization improves performance.", "Tradeoffs around memory and stale values."],
    practice: ["Memoize a recursive Fibonacci function.", "Compare repeated calls with and without caching.", "Identify a function where caching is unsafe."],
    checkpoints: ["You can explain cache hits.", "You know when memoization helps.", "You know when not to cache."],
  },
  "built-in data structures": {
    learn: ["Lists, tuples, sets, and dictionaries.", "Mutability and ordering.", "Common operations and use cases."],
    practice: ["Remove duplicates using a set.", "Update dictionary student details.", "Compare all four structures in a table."],
    checkpoints: ["You choose the right structure.", "You know mutable vs immutable behavior.", "You can perform common operations confidently."],
  },
  "object copying": {
    learn: ["Assignment vs copying.", "Shallow copy vs deep copy.", "Nested object reference behavior."],
    practice: ["Modify a nested list after shallow copy.", "Repeat using deep copy.", "Explain why the results differ."],
    checkpoints: ["You can predict copied object behavior.", "You know when deep copy is required.", "You avoid shared nested-state bugs."],
  },
  "exception handling": {
    learn: ["try, except, else, finally.", "Raising exceptions.", "Custom exceptions and specific error handling."],
    practice: ["Handle division by zero.", "Use else and finally.", "Create an invalid-age custom exception."],
    checkpoints: ["You catch specific errors.", "You know when cleanup runs.", "You avoid hiding bugs with broad exceptions."],
  },
  "context managers": {
    learn: ["with statement behavior.", "__enter__ and __exit__.", "Reliable cleanup for files and resources."],
    practice: ["Write to a file using with open.", "Create a custom context manager.", "Show cleanup after an error."],
    checkpoints: ["You can explain why with is safer.", "You can write a basic context manager.", "You understand cleanup flow."],
  },
  "oop and advanced oop": {
    learn: ["Classes, objects, instance and class attributes.", "Inheritance, staticmethod, classmethod, and dunder methods.", "Metaclasses and monkey patching basics."],
    practice: ["Create parent and child classes.", "Use __str__ and __add__.", "Demonstrate staticmethod and classmethod."],
    checkpoints: ["You model objects clearly.", "You know method types.", "You can explain advanced OOP in simple terms."],
  },
  "memory management": {
    learn: ["Object identity and references.", "Reference counts and garbage collection.", "Memory-efficient coding patterns."],
    practice: ["Use id to compare object references.", "Inspect reference count.", "Rewrite a large-list example with a generator."],
    checkpoints: ["You know variables reference objects.", "You understand garbage collection basics.", "You can avoid unnecessary memory usage."],
  },
  "global interpreter lock": {
    learn: ["What the GIL is.", "How it affects CPU-bound threads.", "Why it matters in CPython."],
    practice: ["Explain GIL in plain words.", "Compare CPU-heavy threading behavior.", "Connect GIL to multiprocessing decisions."],
    checkpoints: ["You know what GIL stands for.", "You can explain thread limitations.", "You know when multiprocessing helps."],
  },
  "threading vs multiprocessing": {
    learn: ["Threading for I/O-bound work.", "Multiprocessing for CPU-bound work.", "Tradeoffs around memory and overhead."],
    practice: ["Write a small threading example.", "Write a small multiprocessing example.", "Compare both in five points."],
    checkpoints: ["You choose concurrency model by workload.", "You know shared vs separate memory.", "You understand process overhead."],
  },
  "asyncio programming": {
    learn: ["async and await.", "Non-blocking task flow.", "Where async I/O is useful."],
    practice: ["Trace an async function call.", "Run multiple async waits.", "Compare async with threading for I/O-like tasks."],
    checkpoints: ["You can read async code.", "You know when async helps.", "You understand event-loop basics."],
  },
  "data-structure problems": {
    learn: ["Common list, dictionary, set, and string problem patterns.", "Interview-style reasoning.", "Clean transformation logic."],
    practice: ["Solve small frequency-count problems.", "Transform raw records into dictionaries.", "Explain time and space tradeoffs."],
    checkpoints: ["You recognize common patterns.", "You can solve without overcomplicating.", "You can explain your approach."],
  },
  "data-structure practical problems": {
    learn: ["Common list, dictionary, set, and string problem patterns.", "Interview-style reasoning.", "Clean transformation logic."],
    practice: ["Solve small frequency-count problems.", "Transform raw records into dictionaries.", "Explain time and space tradeoffs."],
    checkpoints: ["You recognize common patterns.", "You can solve without overcomplicating.", "You can explain your approach."],
  },
  "iterators and internals": {
    learn: ["Iterator protocol.", "__iter__ and __next__.", "Deeper runtime behavior around iteration."],
    practice: ["Create a custom iterator.", "Trace next calls.", "Compare iterator and generator styles."],
    checkpoints: ["You know iterable vs iterator.", "You can implement __next__.", "You can explain StopIteration."],
  },
  "iterators and python internals": {
    learn: ["Iterator protocol.", "__iter__ and __next__.", "Deeper runtime behavior around iteration."],
    practice: ["Create a custom iterator.", "Trace next calls.", "Compare iterator and generator styles."],
    checkpoints: ["You know iterable vs iterator.", "You can implement __next__.", "You can explain StopIteration."],
  },
  "os and shutil modules": {
    learn: ["File-system paths and operations.", "Copying, moving, and organizing files.", "Automation utility patterns."],
    practice: ["List files in a folder.", "Move files by extension.", "Build a tiny cleanup report."],
    checkpoints: ["You can automate file tasks.", "You handle paths carefully.", "You know when to use shutil."],
  },
  "regex validation": {
    learn: ["Pattern matching basics.", "Validation rules.", "Readable regular-expression design."],
    practice: ["Validate email-like text.", "Validate phone or ID patterns.", "Explain each regex part."],
    checkpoints: ["You can write simple regex safely.", "You know when regex is too much.", "You can test patterns clearly."],
  },
  "logging module": {
    learn: ["Logging levels.", "Structured runtime messages.", "Why logging beats print for applications."],
    practice: ["Add info, warning, and error logs.", "Format log messages.", "Replace print debugging with logging."],
    checkpoints: ["You choose the right log level.", "You can read logs quickly.", "You avoid noisy logs."],
  },
  "practical patterns": {
    learn: ["Property setters.", "Environment variables.", "Small patterns useful in real scripts."],
    practice: ["Create a validated property setter.", "Read a setting from environment variables.", "Refactor a script using a practical pattern."],
    checkpoints: ["You can write cleaner utility code.", "You avoid hard-coded secrets.", "You understand validation through properties."],
  },
  "practice exercises": {
    learn: ["Revision questions across fundamentals, operators, control flow, functions, OOP, memory, and concurrency.", "Hands-on exercises for interview preparation.", "How to identify weak areas."],
    practice: ["Solve one section at a time.", "Revisit notebooks for missed questions.", "Track wrong answers and retry later."],
    checkpoints: ["You can solve without looking first.", "You can explain each answer.", "You know which topic to revise next."],
  },
};

const practice = [
  ["Easy", "Output Prediction", "Guess the output of short snippets before running them."],
  ["Easy", "Fix the Bug", "Find the mistake in a loop, condition, or function."],
  ["Medium", "Transform Data", "Convert a list of raw records into clean dictionaries."],
  ["Medium", "File Challenge", "Read a CSV file and produce a summary report."],
  ["Hard", "Refactor Practice", "Turn repeated code into functions and modules."],
  ["Hard", "Project Extension", "Add validation, search, and export to a mini app."],
];

const projects = [
  ["Quiz App", "Build a terminal quiz with scoring, feedback, and difficulty levels.", "Beginner", "3 hr"],
  ["File Organizer", "Sort files by extension and generate a cleanup report.", "Practical", "2 hr"],
  ["Expense Tracker", "Read expenses from CSV and create monthly summaries.", "Practical", "4 hr"],
  ["Password Tool", "Generate strong passwords and validate user rules.", "Beginner", "1 hr"],
  ["Resume Scanner", "Compare resume text with job keywords.", "Career", "4 hr"],
  ["Excel Reporter", "Create formatted reports from spreadsheet data.", "Office", "5 hr"],
];

const interviews = [
  [
    "Python Basics",
    "Theory",
    "Easy",
    "Which Python data type is best for storing an ordered, changeable collection?",
    "list",
    "A list is ordered and mutable, so it is the best fit.",
  ],
  [
    "Control Flow",
    "Code Output",
    "Easy",
    "What does continue do inside a loop?",
    "Skips the current iteration",
    "continue skips only the current iteration and moves to the next one.",
  ],
  [
    "Operators",
    "Theory",
    "Easy",
    "Which operator is used for exponentiation in Python?",
    "**",
    "** performs exponentiation, such as 2 ** 3.",
  ],
  [
    "Exception Handling",
    "Fill Blank",
    "Easy",
    "Which keyword catches an exception raised inside a try block?",
    "except",
    "Python uses except to catch exceptions.",
  ],
  [
    "Functions",
    "Debugging",
    "Medium",
    "What is the common issue with mutable default arguments?",
    "The same object is reused",
    "Default mutable arguments are created once, so values can carry over between calls.",
  ],
  [
    "Functions",
    "Theory",
    "Easy",
    "What is a positional argument?",
    "An argument matched by position",
    "It is matched to a parameter based on where it appears in the function call.",
  ],
  [
    "Lambda",
    "Fill Blank",
    "Easy",
    "Which keyword creates an anonymous function in Python?",
    "lambda",
    "lambda creates a small anonymous function.",
  ],
  [
    "Decorators",
    "Theory",
    "Medium",
    "What is the main purpose of a decorator?",
    "Extend behavior without changing original code",
    "Decorators wrap functions or classes to add reusable behavior.",
  ],
  [
    "OOP",
    "Scenario",
    "Medium",
    "Which method receives the class itself as the first argument?",
    "@classmethod",
    "@classmethod receives cls, so it can work with class-level state.",
  ],
  [
    "Advanced Functions",
    "Code Output",
    "Hard",
    "What keyword is used to produce values from a generator function?",
    "yield",
    "yield returns one value at a time and pauses the generator state.",
  ],
];

const quizSets = [
  ["Foundation Mix", "Basics, operators, control flow"],
  ["Function Power", "functions, lambda, decorators"],
  ["Control & Errors", "loops, branching, exceptions"],
  ["OOP Core", "classes, methods, inheritance"],
  ["Advanced Memory", "identity, copy, memory"],
  ["Data Structures", "collections, copy, dictionaries"],
  ["Scope & Runtime", "LEGB, closures, monkey patching"],
  ["Context & Exceptions", "with, cleanup, custom errors"],
  ["Advanced OOP", "dunder, metaclasses, class methods"],
  ["Concurrency", "GIL, threading, multiprocessing"],
];

const views = document.querySelectorAll("[data-view]");
const navLinks = document.querySelectorAll("[data-route]");
const mainNav = document.querySelector(".main-nav");
const menuButton = document.querySelector(".menu-button");
const searchInputs = document.querySelectorAll(".hub-search");
const searchPanels = document.querySelectorAll(".search-results");
const lessonTitle = document.querySelector("#lessonTitle");
const lessonDescription = document.querySelector("#lessonDescription");
const lessonContent = document.querySelector("#lessonContent");
const backToLibrary = document.querySelector("#backToLibrary");
let previousLibraryRoute = "topics";

function scrollToPageTop() {
  window.scrollTo({ top: 0, behavior: "auto" });
  setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 40);
  setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 140);
}

function routeTo(route) {
  const hasRoute = [...views].some((view) => view.dataset.view === route);
  const target = hasRoute ? route : "home";
  views.forEach((view) => view.classList.toggle("active", view.dataset.view === target));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === target));
  mainNav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  requestAnimationFrame(scrollToPageTop);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localMaterialUrl(title) {
  const file = materialFiles[title.toLowerCase()];
  return file ? `./study-material/${encodeURIComponent(file)}` : "";
}

function markdownInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(markdown) {
  const lines = markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !line.toLowerCase().includes("colab.research.google.com"))
    .filter((line) => !line.toLowerCase().includes("colab-badge.svg"));
  const html = [];
  let paragraph = [];
  let list = [];
  let orderedList = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${markdownInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${markdownInline(item)}</li>`).join("")}</ul>`);
      list = [];
    }
    if (orderedList.length) {
      html.push(`<ol>${orderedList.map((item) => `<li>${markdownInline(item)}</li>`).join("")}</ol>`);
      orderedList = [];
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 2, 5);
      html.push(`<h${level}>${markdownInline(heading[2])}</h${level}>`);
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      orderedList = [];
      list.push(bullet[1]);
      return;
    }

    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      flushParagraph();
      list = [];
      orderedList.push(numbered[1]);
      return;
    }

    if (trimmed.includes("|") && trimmed.startsWith("|")) {
      flushParagraph();
      flushList();
      html.push(`<pre class="markdown-table">${escapeHtml(trimmed)}</pre>`);
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return html.join("");
}

function cellSource(cell) {
  const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";
  return source
    .split("\n")
    .filter((line) => !line.toLowerCase().includes("colab.research.google.com"))
    .filter((line) => !line.toLowerCase().includes("colab-badge.svg"))
    .join("\n");
}

function renderNotebook(notebook) {
  return notebook.cells
    .filter((cell) => ["markdown", "code"].includes(cell.cell_type))
    .map((cell, index) => {
      const source = cellSource(cell).trim();
      if (!source) return "";
      if (cell.cell_type === "markdown") {
        return `<article class="lesson-block markdown-block">${renderMarkdown(source)}</article>`;
      }
      return `
        <article class="lesson-block code-cell">
          <div class="cell-label">Code cell ${index + 1}</div>
          <pre><code>${escapeHtml(source)}</code></pre>
        </article>
      `;
    })
    .join("");
}

async function openLesson(title, fromRoute = "topics") {
  previousLibraryRoute = fromRoute;
  const normalizedTitle = title.toLowerCase();
  const roadmapItem = roadmap.find(([, itemTitle]) => itemTitle.toLowerCase() === normalizedTitle);
  const topicItem = topics.find(([itemTitle]) => itemTitle.toLowerCase() === normalizedTitle);
  const displayTitle = roadmapItem?.[1] || topicItem?.[0] || title;
  const description = roadmapItem?.[2] || topicItem?.[1] || "";
  const url = localMaterialUrl(displayTitle) || localMaterialUrl(normalizedTitle);

  routeTo("lesson");
  history.replaceState(null, "", `#lesson/${encodeURIComponent(displayTitle)}`);
  lessonTitle.textContent = displayTitle;
  lessonDescription.textContent = description;
  lessonContent.innerHTML = `<div class="lesson-loading">Loading complete lesson content...</div>`;

  if (!url) {
    lessonContent.innerHTML = `<div class="lesson-error">No local study material file is mapped for this topic yet.</div>`;
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    const fileName = decodeURIComponent(url).toLowerCase();

    if (fileName.endsWith(".ipynb")) {
      const notebook = await response.json();
      lessonContent.innerHTML = renderNotebook(notebook);
    } else {
      const markdown = await response.text();
      lessonContent.innerHTML = `<article class="lesson-block markdown-block">${renderMarkdown(markdown)}</article>`;
    }
  } catch (error) {
    lessonContent.innerHTML = `
      <div class="lesson-error">
        Could not load this lesson from the local study-material folder. Please check the file exists.
      </div>
    `;
  }
}

function studyActions(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("practice")) {
    return ["Solve the exercise set after revising the matching notebooks.", "Mark weak areas and return to the matching topic card.", "Use the questions for interview-style daily revision."];
  }
  if (text.includes("oop")) {
    return ["Read the concept flow from class basics to advanced OOP.", "Run the code examples and change class or method names.", "Practice inheritance, classmethod, staticmethod, dunder methods, and metaclass examples."];
  }
  if (text.includes("thread") || text.includes("async") || text.includes("gil")) {
    return ["Understand when the concept is useful in real programs.", "Compare the examples with CPU-bound and I/O-bound scenarios.", "Write a small experiment and note the behavior."];
  }
  if (text.includes("regex") || text.includes("logging") || text.includes("os") || text.includes("shutil")) {
    return ["Study the notebook examples as practical utilities.", "Modify the examples for one real file or validation task.", "Save a small reusable snippet for future projects."];
  }
  return ["Read the notebook explanation fully once.", "Run each code example and change the inputs.", "Finish the related practice exercises before moving ahead."];
}

function renderRoadmap() {
  document.querySelector("#roadmapList").innerHTML = roadmap
    .map(
      ([day, title, description]) => `
        <article class="timeline-card clickable-card" data-material-title="${title.toLowerCase()}" data-item-title="${title.toLowerCase()}" data-keywords="${title} ${description}">
          <div class="day-number"><span>Day</span><b>${day}</b></div>
          <div>
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTopics(filter = "all") {
  document.querySelector("#topicGrid").innerHTML = topics
    .filter(([, , level]) => filter === "all" || level === filter)
    .map(
      ([title, description, level, count], index) => `
        <article class="topic-card clickable-card" data-material-title="${title.toLowerCase()}" data-item-title="${title.toLowerCase()}" data-keywords="${title} ${description} ${level}">
          <div class="topic-card-head">
            <div class="topic-icon">${String(index + 1).padStart(2, "0")}</div>
            <span class="pill">${level}</span>
          </div>
          <div>
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
          <div class="card-meta">
            <span class="pill">Open lesson</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPractice() {
  document.querySelector("#practiceList").innerHTML = practice
    .map(
      ([difficulty, title, description]) => `
        <article class="practice-card" data-item-title="${title.toLowerCase()}" data-keywords="${difficulty} ${title} ${description}">
          <span class="difficulty">${difficulty}</span>
          <h3>${title}</h3>
          <p>${description}</p>
        </article>
      `
    )
    .join("");
}

function renderProjects() {
  document.querySelector("#projectGrid").innerHTML = projects
    .map(
      ([title, description, type, time], index) => `
        <article class="project-card" data-item-title="${title.toLowerCase()}" data-keywords="${title} ${description} ${type}">
          <div>
            <div class="project-icon">${String.fromCharCode(65 + index)}</div>
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
          <div class="card-meta">
            <span class="pill">${type}</span>
            <span class="pill">${time}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function searchableItems() {
  return [
    ...roadmap.map(([day, title, description]) => ({
      route: "roadmap",
      label: `Day ${day}`,
      title,
      description,
      keywords: `${day} ${title} ${description} roadmap`,
    })),
    ...topics.map(([title, description, level]) => ({
      route: "topics",
      label: level,
      title,
      description,
      keywords: `${title} ${description} ${level} topics`,
    })),
    ...practice.map(([difficulty, title, description]) => ({
      route: "practice",
      label: difficulty,
      title,
      description,
      keywords: `${difficulty} ${title} ${description} practice exercises tasks`,
    })),
    ...projects.map(([title, description, type]) => ({
      route: "projects",
      label: type,
      title,
      description,
      keywords: `${title} ${description} ${type} projects apps build`,
    })),
    {
      route: "interview",
      label: "Quiz",
      title: "Interview Practice",
      description: "Python Mastery Quiz with mixed question sets and review.",
      keywords: "interview quiz questions python mastery",
    },
  ];
}

function renderInterview() {
  const interviewList = document.querySelector("#interviewList");
  if (!interviewList) return;
}

function searchPanelFor(input) {
  const panel = input.closest("label")?.nextElementSibling;
  return panel?.classList.contains("search-results") ? panel : searchPanels[0];
}

function closeSearchPanels() {
  searchPanels.forEach((panel) => {
    panel.classList.remove("open");
    panel.innerHTML = "";
  });
}

function renderSearchResults(query, panel = searchPanels[0]) {
  if (!panel) return;
  const term = query.trim().toLowerCase();
  closeSearchPanels();
  panel.classList.toggle("open", Boolean(term));

  if (!term) {
    return;
  }

  const matches = searchableItems()
    .filter((item) => item.keywords.toLowerCase().includes(term))
    .slice(0, 6);

  if (!matches.length) {
    panel.innerHTML = `<div class="empty-result">No matching topic found</div>`;
    return;
  }

  panel.innerHTML = matches
    .map(
      (item) => `
        <button type="button" class="search-result" data-search-route="${item.route}" data-search-title="${item.title.toLowerCase()}">
          <span>${item.label}</span>
          <strong>${item.title}</strong>
          <small>${item.description}</small>
        </button>
      `
    )
    .join("");
}

function applySearch(query) {
  const term = query.trim().toLowerCase();
  document.querySelectorAll("[data-keywords]").forEach((card) => {
    const keywords = card.dataset.keywords.toLowerCase();
    card.classList.toggle("hidden", term && !keywords.includes(term));
  });
}

function clearHighlights() {
  document.querySelectorAll(".search-highlight").forEach((card) => {
    card.classList.remove("search-highlight");
  });
}

function showMaterialDetail(title, detailId) {
  const normalizedTitle = title.toLowerCase();
  const roadmapItem = roadmap.find(([, itemTitle]) => itemTitle.toLowerCase() === normalizedTitle);
  const topicItem = topics.find(([itemTitle]) => itemTitle.toLowerCase() === normalizedTitle);
  const displayTitle = roadmapItem?.[1] || topicItem?.[0] || title;
  const description = roadmapItem?.[2] || topicItem?.[1] || "";
  const fileName = materialFiles[displayTitle.toLowerCase()] || materialFiles[normalizedTitle] || "GitHub study material";
  const details = materialDetails[displayTitle.toLowerCase()] || materialDetails[normalizedTitle];
  const learn = details?.learn || [description];
  const practiceItems = details?.practice || studyActions(displayTitle, description);
  const checkpoints = details?.checkpoints || ["You can explain the concept clearly.", "You can write a small example.", "You can solve the related practice tasks."];
  const panel = document.querySelector(detailId);

  if (!panel) return;

  panel.classList.remove("hidden");
  panel.innerHTML = `
    <div>
      <span class="detail-label">Selected study topic</span>
      <h3>${displayTitle}</h3>
      <p>${description}</p>
      <div class="detail-meta">
        <span>${roadmapItem ? `Roadmap ${roadmapItem[0]}` : "Topic library"}</span>
      </div>
    </div>
    <div class="detail-actions">
      <strong>What to learn</strong>
      <ul>
        ${learn.map((action) => `<li>${action}</li>`).join("")}
      </ul>
      <strong>Practice now</strong>
      <ul>
        ${practiceItems.map((action) => `<li>${action}</li>`).join("")}
      </ul>
      <strong>Before moving next</strong>
      <ul>
        ${checkpoints.map((action) => `<li>${action}</li>`).join("")}
      </ul>
    </div>
  `;

  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function highlightSearchTarget(title) {
  clearHighlights();
  if (!title) return;

  const activeView = document.querySelector(".view.active");
  const target = activeView?.querySelector(`[data-item-title="${title}"]`);
  if (!target) return;

  target.classList.add("search-highlight");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    routeTo(link.dataset.route);
    history.replaceState(null, "", `#${link.dataset.route}`);
  });
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderTopics(button.dataset.filter);
    applySearch(activeSearchValue());
  });
});

menuButton.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

function activeSearchValue() {
  return [...searchInputs].find((input) => input.value.trim())?.value || "";
}

searchInputs.forEach((input) => {
  input.addEventListener("input", (event) => {
    searchInputs.forEach((otherInput) => {
      if (otherInput !== event.target) otherInput.value = event.target.value;
    });
    applySearch(event.target.value);
    renderSearchResults(event.target.value, searchPanelFor(event.target));
  });
});

document.addEventListener("click", (event) => {
  const searchResult = event.target.closest("[data-search-route]");
  if (searchResult) {
    const route = searchResult.dataset.searchRoute;
    const title = searchResult.dataset.searchTitle;
    routeTo(route);
    history.replaceState(null, "", `#${route}`);
    searchInputs.forEach((input) => {
      input.value = "";
    });
    applySearch("");
    closeSearchPanels();
    setTimeout(() => {
      highlightSearchTarget(title);
      openLesson(title, route);
    }, 80);
    return;
  }

  const quickCard = event.target.closest("[data-card-route]");
  if (quickCard && !event.target.closest("a")) {
    const route = quickCard.dataset.cardRoute;
    routeTo(route);
    history.replaceState(null, "", `#${route}`);
    clearHighlights();
    return;
  }

  const materialCard = event.target.closest("[data-material-title]");
  if (materialCard) {
    const title = materialCard.dataset.materialTitle;
    const fromRoute = materialCard.closest("[data-view]")?.dataset.view || "topics";
    clearHighlights();
    openLesson(title, fromRoute);
    return;
  }

  const button = event.target.closest(".interview-card button");
  if (!button) return;
  const card = button.closest(".interview-card");
  card.classList.toggle("open");
  button.textContent = card.classList.contains("open") ? "Hide" : "Reveal";
});

renderRoadmap();
renderTopics();
renderPractice();
renderProjects();
renderInterview();
const initialHash = location.hash.replace("#", "");
if (initialHash.startsWith("lesson/")) {
  openLesson(decodeURIComponent(initialHash.replace("lesson/", "")), previousLibraryRoute);
} else {
  routeTo(initialHash || "home");
}

window.addEventListener("hashchange", () => {
  const hash = location.hash.replace("#", "");
  if (hash.startsWith("lesson/")) {
    openLesson(decodeURIComponent(hash.replace("lesson/", "")), previousLibraryRoute);
    return;
  }
  routeTo(hash || "home");
});

backToLibrary.addEventListener("click", () => {
  routeTo(previousLibraryRoute);
  history.replaceState(null, "", `#${previousLibraryRoute}`);
});
