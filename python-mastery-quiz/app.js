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
  },
  {
    name: "Data Structures & Copying",
    questions: [
      {
        topic: "Built-in Data Structures",
        type: "Theory",
        difficulty: "Easy",
        question: "Which built-in data structure stores key-value pairs?",
        options: ["list", "tuple", "set", "dict"],
        answer: 3,
        explanation: "A dictionary stores data as key-value pairs."
      },
      {
        topic: "Lists",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "items = [1, 2]\nitems.append(3)\nprint(items)",
        options: ["[1, 2]", "[1, 2, 3]", "[3, 1, 2]", "Error"],
        answer: 1,
        explanation: "`append()` adds the value to the end of the list."
      },
      {
        topic: "Sets",
        type: "Code Output",
        difficulty: "Easy",
        question: "What is the output?",
        code: "values = {1, 2, 2, 3}\nprint(len(values))",
        options: ["2", "3", "4", "Error"],
        answer: 1,
        explanation: "Sets keep unique values only, so `{1, 2, 2, 3}` has 3 elements."
      },
      {
        topic: "Dictionaries",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Complete the code to safely read a missing key with a default value.",
        code: "student = {'name': 'Ravi'}\nprint(student.____('age', 0))",
        options: ["find", "get", "read", "default"],
        answer: 1,
        explanation: "`dict.get(key, default)` returns the default when the key is missing."
      },
      {
        topic: "Data Structures",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "Which comparison is correct?",
        options: [
          "Lists are immutable and tuples are mutable",
          "Lists and tuples both reject duplicates",
          "Lists are mutable and tuples are immutable",
          "Sets preserve duplicates in insertion order"
        ],
        answer: 2,
        explanation: "Lists can be changed after creation, while tuples cannot."
      },
      {
        topic: "Object Copying",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "import copy\na = [[1], [2]]\nb = copy.deepcopy(a)\nb[0][0] = 99\nprint(a)",
        options: ["[[99], [2]]", "[[1], [2]]", "[99, 2]", "Error"],
        answer: 1,
        explanation: "`deepcopy()` copies nested objects too, so changing `b` does not affect `a`."
      },
      {
        topic: "Dictionaries",
        type: "Scenario",
        difficulty: "Medium",
        question: "You need to quickly find a student's marks using their roll number. Which structure is the best fit?",
        options: ["list of marks only", "dictionary", "tuple of names", "set of marks"],
        answer: 1,
        explanation: "A dictionary is ideal for lookup by a unique key like roll number."
      },
      {
        topic: "Copying",
        type: "Debugging",
        difficulty: "Medium",
        question: "Why does this code change both variables?",
        code: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
        options: [
          "`b = a` makes both names refer to the same list",
          "`append` always changes all lists in memory",
          "Lists are copied automatically",
          "`print` mutates the list"
        ],
        answer: 0,
        explanation: "Assignment does not copy the list; it creates another reference to the same object."
      },
      {
        topic: "Built-in Data Structures",
        type: "Theory",
        difficulty: "Hard",
        question: "Why are dictionary keys required to be hashable?",
        options: [
          "Because Python stores dictionaries as sorted lists",
          "Because hash values help locate keys efficiently",
          "Because dictionary values must be immutable",
          "Because keys are always converted to strings"
        ],
        answer: 1,
        explanation: "Dictionaries use hash values internally to find keys efficiently."
      },
      {
        topic: "Comprehensions",
        type: "Code Output",
        difficulty: "Hard",
        question: "What will this dictionary comprehension produce?",
        code: "nums = [1, 2, 3]\nprint({n: n * n for n in nums if n > 1})",
        options: ["{1: 1, 2: 4, 3: 9}", "{2: 4, 3: 9}", "[2, 3]", "{1, 4, 9}"],
        answer: 1,
        explanation: "The condition keeps 2 and 3, then maps each number to its square."
      }
    ]
  },
  {
    name: "Scope & Runtime",
    questions: [
      {
        topic: "Scope",
        type: "Theory",
        difficulty: "Easy",
        question: "What does the L in LEGB stand for?",
        options: ["Local", "Loop", "Library", "Lambda"],
        answer: 0,
        explanation: "LEGB means Local, Enclosing, Global, Built-in."
      },
      {
        topic: "Scope",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "x = 'global'\n\ndef show():\n    x = 'local'\n    print(x)\n\nshow()",
        options: ["global", "local", "None", "Error"],
        answer: 1,
        explanation: "Inside the function, Python finds the local variable `x` first."
      },
      {
        topic: "Scope",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Which keyword lets an inner function modify a variable from the enclosing function?",
        code: "def outer():\n    count = 0\n    def inner():\n        _____ count\n        count += 1",
        options: ["global", "local", "nonlocal", "outer"],
        answer: 2,
        explanation: "`nonlocal` modifies a variable from the nearest enclosing function scope."
      },
      {
        topic: "Scope",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "What is the difference between `global` and `nonlocal`?",
        options: [
          "`global` targets module scope, `nonlocal` targets enclosing function scope",
          "`nonlocal` targets module scope, `global` targets enclosing function scope",
          "Both are only used with classes",
          "Both create constants"
        ],
        answer: 0,
        explanation: "`global` refers to module-level names; `nonlocal` refers to names in an outer function."
      },
      {
        topic: "Closures",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this closure print?",
        code: "def outer(msg):\n    def inner():\n        return msg\n    return inner\n\nfn = outer('Python')\nprint(fn())",
        options: ["outer", "inner", "Python", "Error"],
        answer: 2,
        explanation: "The inner function remembers `msg` from the enclosing scope."
      },
      {
        topic: "Runtime",
        type: "Theory",
        difficulty: "Medium",
        question: "What is monkey patching?",
        options: [
          "Changing code behavior at runtime",
          "Copying every object deeply",
          "Creating only immutable classes",
          "Disabling exception handling"
        ],
        answer: 0,
        explanation: "Monkey patching means modifying or replacing behavior dynamically at runtime."
      },
      {
        topic: "Memory",
        type: "Code Output",
        difficulty: "Medium",
        question: "What does this code show?",
        code: "a = [1]\nb = a\nprint(id(a) == id(b))",
        options: ["Both names reference the same object", "The lists have different memory identities", "Lists cannot use id()", "Error"],
        answer: 0,
        explanation: "`b = a` makes both names refer to the same list object."
      },
      {
        topic: "Scope",
        type: "Debugging",
        difficulty: "Hard",
        question: "Why does this function fail?",
        code: "count = 0\n\ndef inc():\n    count += 1\n    return count\n\ninc()",
        options: [
          "Python treats `count` as local because it is assigned inside the function",
          "Integers cannot be incremented",
          "`return` cannot return numbers",
          "Global variables cannot exist"
        ],
        answer: 0,
        explanation: "Assignment makes `count` local unless declared `global`, so reading it first causes an error."
      },
      {
        topic: "Memory Management",
        type: "Scenario",
        difficulty: "Hard",
        question: "You are holding a huge object that is no longer needed. What helps make it eligible for cleanup?",
        options: ["Keep more references to it", "Remove references to it", "Convert it to a string", "Put it in a tuple"],
        answer: 1,
        explanation: "When no references point to an object, Python can reclaim it."
      },
      {
        topic: "Runtime",
        type: "Debugging",
        difficulty: "Hard",
        question: "What is risky about this monkey patch?",
        code: "import math\nmath.sqrt = lambda x: 10\nprint(math.sqrt(81))",
        options: [
          "It changes expected behavior for all later uses of `math.sqrt` in this runtime",
          "Lambda cannot return numbers",
          "Imports cannot be modified in Python",
          "`print` will remove the patch"
        ],
        answer: 0,
        explanation: "Monkey patches can surprise other code because they replace normal behavior at runtime."
      }
    ]
  },
  {
    name: "Context & Exceptions",
    questions: [
      {
        topic: "Context Managers",
        type: "Theory",
        difficulty: "Easy",
        question: "What is the main benefit of using `with open(...)` for files?",
        options: ["It automatically closes the file", "It makes the file read-only", "It prevents all exceptions", "It converts files to lists"],
        answer: 0,
        explanation: "`with` ensures the file is closed after the block finishes."
      },
      {
        topic: "Context Managers",
        type: "Fill in the Blank",
        difficulty: "Easy",
        question: "Complete the file-handling pattern.",
        code: "_____ open('data.txt') as file:\n    content = file.read()",
        options: ["using", "with", "try", "context"],
        answer: 1,
        explanation: "Python uses the `with` statement for context managers."
      },
      {
        topic: "Exception Handling",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "try:\n    int('abc')\nexcept ValueError:\n    print('bad value')",
        options: ["abc", "bad value", "ValueError", "Nothing"],
        answer: 1,
        explanation: "`int('abc')` raises `ValueError`, so the except block runs."
      },
      {
        topic: "Context Managers",
        type: "Concept Comparison",
        difficulty: "Medium",
        question: "Which methods are used by a custom class-based context manager?",
        options: ["__start__ and __stop__", "__enter__ and __exit__", "__open__ and __close__", "__init__ and __del__ only"],
        answer: 1,
        explanation: "A class-based context manager defines `__enter__` and `__exit__`."
      },
      {
        topic: "Exception Handling",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "try:\n    print('try')\nexcept Exception:\n    print('except')\nelse:\n    print('else')\nfinally:\n    print('finally')",
        options: ["try only", "try else finally", "except finally", "finally only"],
        answer: 1,
        explanation: "No exception occurs, so `else` runs, and `finally` always runs."
      },
      {
        topic: "Exception Handling",
        type: "Debugging",
        difficulty: "Medium",
        question: "What is the best improvement for this handler?",
        code: "try:\n    age = int(user_input)\nexcept:\n    print('Error')",
        options: [
          "Catch a specific exception like `ValueError`",
          "Remove the try block and ignore errors",
          "Catch the error with `finally` only",
          "Use `break` instead of `except`"
        ],
        answer: 0,
        explanation: "Specific exception handling is clearer and avoids hiding unrelated bugs."
      },
      {
        topic: "Context Managers",
        type: "Scenario",
        difficulty: "Medium",
        question: "You need to acquire a resource and guarantee cleanup even if an error occurs. What should you prefer?",
        options: ["A context manager", "A list comprehension", "A lambda", "A tuple unpacking expression"],
        answer: 0,
        explanation: "Context managers are designed for reliable setup and cleanup."
      },
      {
        topic: "Exception Handling",
        type: "Theory",
        difficulty: "Hard",
        question: "When does the `else` block in try-except-else run?",
        options: [
          "Only when an exception is caught",
          "Only when no exception occurs in the try block",
          "Always before try",
          "Only after finally"
        ],
        answer: 1,
        explanation: "`else` runs only when the `try` block completes without an exception."
      },
      {
        topic: "Context Managers",
        type: "Code Output",
        difficulty: "Hard",
        question: "What prints first when entering this context manager?",
        code: "class Demo:\n    def __enter__(self):\n        print('enter')\n    def __exit__(self, exc_type, exc, tb):\n        print('exit')\n\nwith Demo():\n    print('body')",
        options: ["body", "exit", "enter", "Demo"],
        answer: 2,
        explanation: "`__enter__` runs before the body of the `with` block."
      },
      {
        topic: "Exception Handling",
        type: "Scenario",
        difficulty: "Hard",
        question: "You want to reject negative ages by raising your own meaningful error. What should you use?",
        options: ["A custom exception", "A set", "A generator expression", "A static method only"],
        answer: 0,
        explanation: "A custom exception makes domain-specific validation errors clearer."
      }
    ]
  },
  {
    name: "Advanced OOP",
    questions: [
      {
        topic: "Dunder Methods",
        type: "Theory",
        difficulty: "Easy",
        question: "What are dunder methods?",
        options: [
          "Special methods with double underscores at the beginning and end",
          "Methods that can only be used in dictionaries",
          "Methods that delete objects immediately",
          "Methods that work only in Python 2"
        ],
        answer: 0,
        explanation: "Dunder methods like `__init__` and `__str__` customize object behavior."
      },
      {
        topic: "Dunder Methods",
        type: "Code Output",
        difficulty: "Easy",
        question: "What will this code print?",
        code: "class Book:\n    def __str__(self):\n        return 'Python Book'\n\nprint(Book())",
        options: ["<Book object>", "Python Book", "__str__", "Error"],
        answer: 1,
        explanation: "`print()` uses `__str__` to get a user-friendly string."
      },
      {
        topic: "Methods",
        type: "Concept Comparison",
        difficulty: "Easy",
        question: "Which method receives the class as the first argument?",
        options: ["instance method", "staticmethod", "classmethod", "lambda"],
        answer: 2,
        explanation: "A class method receives `cls` automatically."
      },
      {
        topic: "Inheritance",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "class A:\n    def speak(self):\n        return 'A'\n\nclass B(A):\n    def speak(self):\n        return 'B'\n\nprint(B().speak())",
        options: ["A", "B", "None", "Error"],
        answer: 1,
        explanation: "The child class overrides the parent method."
      },
      {
        topic: "Dunder Methods",
        type: "Code Output",
        difficulty: "Medium",
        question: "What will this code print?",
        code: "class Box:\n    def __len__(self):\n        return 5\n\nprint(len(Box()))",
        options: ["0", "5", "Box", "Error"],
        answer: 1,
        explanation: "`len(obj)` calls `obj.__len__()` internally."
      },
      {
        topic: "OOP",
        type: "Scenario",
        difficulty: "Medium",
        question: "You want object addition with `+` to combine balances. Which dunder method should you define?",
        options: ["__str__", "__len__", "__add__", "__iter__"],
        answer: 2,
        explanation: "`__add__` defines behavior for the `+` operator."
      },
      {
        topic: "Methods",
        type: "Debugging",
        difficulty: "Medium",
        question: "Why does this static method call fail?",
        code: "class Tool:\n    @staticmethod\n    def add(self, a, b):\n        return a + b\n\nTool.add(2, 3)",
        options: [
          "A static method does not receive `self`, so the parameters are wrong",
          "Static methods cannot return values",
          "Classes cannot contain add methods",
          "`@staticmethod` requires `cls`"
        ],
        answer: 0,
        explanation: "Static methods receive only the arguments passed explicitly."
      },
      {
        topic: "Metaclasses",
        type: "Theory",
        difficulty: "Hard",
        question: "Which built-in object is the default metaclass for normal Python classes?",
        options: ["object", "type", "class", "meta"],
        answer: 1,
        explanation: "In Python, classes are objects created by the metaclass `type`."
      },
      {
        topic: "Monkey Patching",
        type: "Scenario",
        difficulty: "Hard",
        question: "When is monkey patching most reasonable?",
        options: [
          "Carefully in tests or temporary compatibility fixes",
          "Every time a normal function is needed",
          "To replace all inheritance",
          "To make variables constant"
        ],
        answer: 0,
        explanation: "Monkey patching should be used carefully because it changes runtime behavior."
      },
      {
        topic: "Dunder Methods",
        type: "Debugging",
        difficulty: "Hard",
        question: "Why is this equality check probably not doing what the author expects?",
        code: "class User:\n    def __init__(self, name):\n        self.name = name\n\nprint(User('A') == User('A'))",
        options: [
          "Without `__eq__`, separate objects compare by identity by default",
          "Strings cannot be compared inside objects",
          "`__init__` prevents equality checks",
          "Classes cannot create two objects with the same value"
        ],
        answer: 0,
        explanation: "To compare users by name, define `__eq__`; otherwise two different instances are not equal by value."
      }
    ]
  },
  {
    name: "Concurrency Challenge",
    questions: [
      {
        topic: "GIL",
        type: "Theory",
        difficulty: "Easy",
        question: "What does GIL stand for?",
        options: ["Global Interpreter Lock", "General Import List", "Generator Internal Loop", "Global Input Logger"],
        answer: 0,
        explanation: "GIL stands for Global Interpreter Lock."
      },
      {
        topic: "Concurrency",
        type: "Concept Comparison",
        difficulty: "Easy",
        question: "Which is usually better for I/O-bound tasks?",
        options: ["threading", "multiprocessing only", "metaclasses", "deepcopy"],
        answer: 0,
        explanation: "Threads work well for tasks that spend time waiting for I/O."
      },
      {
        topic: "Concurrency",
        type: "Concept Comparison",
        difficulty: "Easy",
        question: "Which is usually better for CPU-bound work in Python?",
        options: ["threading", "multiprocessing", "string formatting", "context managers only"],
        answer: 1,
        explanation: "Multiprocessing uses separate processes and can use multiple CPU cores."
      },
      {
        topic: "Threading",
        type: "Fill in the Blank",
        difficulty: "Medium",
        question: "Which method waits for a thread to finish?",
        code: "thread.start()\nthread._____()",
        options: ["wait", "join", "stop", "finish"],
        answer: 1,
        explanation: "`join()` waits until the thread completes."
      },
      {
        topic: "GIL",
        type: "Scenario",
        difficulty: "Medium",
        question: "You have heavy pure-Python calculations and want to use multiple CPU cores. What should you consider?",
        options: ["multiprocessing", "more global variables", "only static methods", "a shallow copy"],
        answer: 0,
        explanation: "Multiprocessing can run work in separate processes and avoid the GIL limitation."
      },
      {
        topic: "Threading",
        type: "Code Output",
        difficulty: "Medium",
        question: "What is guaranteed after `join()` returns?",
        code: "t.start()\nt.join()\nprint('done')",
        options: ["The thread has finished", "The thread has never started", "The program becomes multiprocessing", "The GIL is disabled"],
        answer: 0,
        explanation: "`join()` blocks until the thread finishes."
      },
      {
        topic: "Multiprocessing",
        type: "Theory",
        difficulty: "Medium",
        question: "What is one tradeoff of multiprocessing compared with threading?",
        options: [
          "Higher process creation and communication overhead",
          "It cannot use CPU cores",
          "It shares all memory automatically",
          "It cannot run functions"
        ],
        answer: 0,
        explanation: "Processes are heavier than threads and require explicit communication for shared data."
      },
      {
        topic: "GIL",
        type: "Debugging",
        difficulty: "Hard",
        question: "Why might this not speed up CPU-heavy pure-Python code much?",
        code: "threads = [threading.Thread(target=cpu_heavy) for _ in range(4)]\nfor t in threads: t.start()\nfor t in threads: t.join()",
        options: [
          "The GIL can prevent true parallel execution of Python bytecode in threads",
          "Threads cannot call functions",
          "`join()` cancels every thread",
          "CPU-heavy code always needs dictionaries"
        ],
        answer: 0,
        explanation: "In CPython, the GIL limits CPU-bound Python threads from running bytecode in parallel."
      },
      {
        topic: "Concurrency",
        type: "Scenario",
        difficulty: "Hard",
        question: "You are downloading many files and most time is spent waiting for network responses. Which approach is reasonable?",
        options: ["threading or async I/O", "deepcopy every response", "metaclass per file", "only one blocking request at a time"],
        answer: 0,
        explanation: "I/O-bound workloads can benefit from concurrency using threads or async I/O."
      },
      {
        topic: "Concurrency",
        type: "Concept Comparison",
        difficulty: "Hard",
        question: "Which statement is correct?",
        options: [
          "Threads share memory; processes have separate memory spaces",
          "Processes share all local variables automatically",
          "Threads always bypass the GIL for CPU work",
          "Multiprocessing is only for file reading"
        ],
        answer: 0,
        explanation: "Threads run in the same process and share memory; processes are separate."
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
