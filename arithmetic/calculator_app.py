#!/usr/bin/env python3
"""
Simple Calculator Application
A complete CLI calculator with basic arithmetic operations.
"""

import sys
import math


class Calculator:
    """A simple calculator class with basic operations."""
    
    @staticmethod
    def add(a, b):
        return a + b
    
    @staticmethod
    def subtract(a, b):
        return a - b
    
    @staticmethod
    def multiply(a, b):
        return a * b
    
    @staticmethod
    def divide(a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
    
    @staticmethod
    def power(a, b):
        return a ** b
    
    @staticmethod
    def square_root(a):
        if a < 0:
            raise ValueError("Cannot calculate square root of negative number")
        return math.sqrt(a)


def get_number(prompt):
    """Get a number from user input."""
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Invalid input. Please enter a number.")


def main():
    """Main calculator application."""
    print("=" * 40)
    print("      Simple Calculator Application")
    print("=" * 40)
    print()
    
    while True:
        print("\nChoose operation:")
        print("1. Addition")
        print("2. Subtraction")
        print("3. Multiplication")
        print("4. Division")
        print("5. Power")
        print("6. Square Root")
        print("7. Exit")
        
        choice = input("\nEnter choice (1-7): ")
        
        if choice == '7':
            print("\nThank you for using the calculator!")
            sys.exit(0)
        
        try:
            if choice == '6':
                num = get_number("Enter number: ")
                result = Calculator.square_root(num)
                print(f"\nSquare root of {num} = {result}")
            elif choice in ['1', '2', '3', '4', '5']:
                num1 = get_number("Enter first number: ")
                num2 = get_number("Enter second number: ")
                
                if choice == '1':
                    result = Calculator.add(num1, num2)
                    print(f"\n{num1} + {num2} = {result}")
                elif choice == '2':
                    result = Calculator.subtract(num1, num2)
                    print(f"\n{num1} - {num2} = {result}")
                elif choice == '3':
                    result = Calculator.multiply(num1, num2)
                    print(f"\n{num1} * {num2} = {result}")
                elif choice == '4':
                    result = Calculator.divide(num1, num2)
                    print(f"\n{num1} / {num2} = {result}")
                elif choice == '5':
                    result = Calculator.power(num1, num2)
                    print(f"\n{num1} ^ {num2} = {result}")
            else:
                print("\nInvalid choice. Please try again.")
        except ValueError as e:
            print(f"\nError: {e}")
        except KeyboardInterrupt:
            print("\n\nCalculator closed.")
            sys.exit(0)


if __name__ == "__main__":
    main()
