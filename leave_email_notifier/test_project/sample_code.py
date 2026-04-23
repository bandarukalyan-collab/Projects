#!/usr/bin/env python3
"""
Sample Test Project
This is a test file to demonstrate Git workflow
"""

def hello_world():
    """Simple hello world function"""
    return "Hello, World!"

def add_numbers(a, b):
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    print(hello_world())
    print(f"2 + 3 = {add_numbers(2, 3)}")
