# Python Practice Exercises

Use these exercises after reading the notebooks. They are designed for revision, interview preparation, and hands-on practice.

## Python Fundamentals

1. Write a short note on the differences between Python 2 and Python 3.
2. Create variables for name, age, salary, and active status. Print their values and types.
3. Create constants for `PI`, `MAX_USERS`, and `DEFAULT_LANGUAGE`.
4. Write five valid variable names and three invalid variable names. Explain why the invalid ones fail.
5. Demonstrate dynamic typing by assigning different data types to the same variable.

## Operators

1. Write examples for arithmetic, comparison, logical, assignment, identity, and membership operators.
2. Build a simple BMI calculator.
3. Write a small password validation example using logical operators.
4. Demonstrate the difference between `/` and `//`.

## Control Flow

1. Write an `if-elif-else` program to classify marks as grade A, B, C, or fail.
2. Print numbers from 1 to 10 using a `for` loop.
3. Print numbers from 10 to 1 using a `while` loop.
4. Use `break` to stop a loop when a target value is found.
5. Use `continue` to skip negative numbers in a list.

## Functions

1. Write a function that accepts two numbers and returns their sum.
2. Write a function with default arguments.
3. Demonstrate positional and keyword arguments.
4. Write a function using `*args` to add any number of values.
5. Write a function using `**kwargs` to print student details.
6. Return multiple values from a function and unpack them.

## Scope, LEGB, and nonlocal

1. Create local and global variables with the same name and print both.
2. Demonstrate the LEGB rule with nested functions.
3. Use `global` to update a global counter.
4. Use `nonlocal` to update a value in an enclosing function.
5. Create a closure-based counter.

## Strings, Ternary, and Comprehensions

1. Format a string using f-string, `format()`, and `%` formatting.
2. Demonstrate `is` vs `==` using lists.
3. Write a ternary expression to check if a number is even or odd.
4. Create a list of squares using list comprehension.
5. Filter even numbers from a list using list comprehension.

## Lambda, Decorators, and Closures

1. Write a lambda function to square a number.
2. Use lambda with `map()` to double list values.
3. Use lambda with `filter()` to select even numbers.
4. Create a simple decorator that prints before and after a function call.
5. Create a decorator that accepts arguments.
6. Write a closure that remembers a message.

## Generators

1. Create a generator that yields numbers from 1 to 5.
2. Use `next()` to read values from a generator.
3. Create a generator expression for squares.
4. Write an infinite generator for even numbers.
5. Explain why generators are memory efficient.

## Built-in Data Structures

1. Create a list and perform append, update, and delete operations.
2. Create a tuple and access elements by index.
3. Create a set and remove duplicate values from a list.
4. Create a dictionary for student details and update one value.
5. Compare list, tuple, set, and dictionary based on mutability and ordering.

## Object Copying

1. Demonstrate assignment vs copying using a list.
2. Create a shallow copy of a nested list and modify the nested value.
3. Create a deep copy of a nested list and show that the original is unchanged.
4. Explain when shallow copy is enough.
5. Explain when deep copy is required.

## Exception Handling

1. Handle division by zero using `try-except`.
2. Handle multiple exception types in one program.
3. Use `else` and `finally` with exception handling.
4. Raise a custom exception for invalid age.
5. Write a file handling example with exception handling.

## Context Managers

1. Open and write to a file using `with open(...)`.
2. Explain why `with` is better than manually closing files.
3. Create a custom context manager using `__enter__` and `__exit__`.
4. Show that cleanup happens even when an error occurs inside the `with` block.

## OOP

1. Create a class with instance attributes and methods.
2. Demonstrate class attributes vs instance attributes.
3. Create an inheritance example with parent and child classes.
4. Demonstrate `staticmethod` and `classmethod`.
5. Create a class that uses `__str__`.
6. Use `__add__` to define custom addition behavior.
7. Write a simple example of monkey patching and explain the risk.
8. Explain what a metaclass is in simple terms.

## Memory Management

1. Use `id()` to show that two variables can refer to the same object.
2. Use `sys.getrefcount()` to inspect reference count.
3. Explain garbage collection in your own words.
4. Write a generator example that avoids creating a large list in memory.

## GIL and Concurrency

1. Explain the Global Interpreter Lock in simple words.
2. Write a small threading example for an I/O-like task.
3. Write a small multiprocessing example for a CPU-like task.
4. Compare threading and multiprocessing in five points.
5. Explain why multiprocessing is preferred for CPU-bound work in Python.
