const db = require('./database');

// Sample Python quiz questions
const sampleQuestions = [
    {
        question: "What is the correct file extension for Python files?",
        options: {
            A: ".python",
            B: ".py",
            C: ".pt",
            D: ".pyt"
        },
        correct: "B"
    },
    {
        question: "Which data type is immutable in Python?",
        options: {
            A: "List",
            B: "Dictionary",
            C: "Tuple",
            D: "Set"
        },
        correct: "C"
    },
    {
        question: "What is the output of print(2 ** 3)?",
        options: {
            A: "6",
            B: "8",
            C: "9",
            D: "5"
        },
        correct: "B"
    },
    {
        question: "Which keyword is used to define a function in Python?",
        options: {
            A: "function",
            B: "def",
            C: "func",
            D: "define"
        },
        correct: "B"
    },
    {
        question: "What is the correct way to create a list in Python?",
        options: {
            A: "list = (1, 2, 3)",
            B: "list = [1, 2, 3]",
            C: "list = {1, 2, 3}",
            D: "list = <1, 2, 3>"
        },
        correct: "B"
    },
    {
        question: "Which method is used to add an element to the end of a list?",
        options: {
            A: "add()",
            B: "append()",
            C: "insert()",
            D: "push()"
        },
        correct: "B"
    },
    {
        question: "What is the output of len('Python')?",
        options: {
            A: "5",
            B: "6",
            C: "7",
            D: "8"
        },
        correct: "B"
    },
    {
        question: "Which operator is used for exponentiation in Python?",
        options: {
            A: "^",
            B: "**",
            C: "exp",
            D: "pow"
        },
        correct: "B"
    },
    {
        question: "What is the correct syntax for a for loop in Python?",
        options: {
            A: "for i in range(5):",
            B: "for (i = 0; i < 5; i++)",
            C: "for i = 0 to 5",
            D: "foreach i in range(5)"
        },
        correct: "A"
    },
    {
        question: "Which function is used to get the length of a list?",
        options: {
            A: "length()",
            B: "len()",
            C: "size()",
            D: "count()"
        },
        correct: "B"
    },
    {
        question: "What is the output of type([1, 2, 3])?",
        options: {
            A: "<class 'list'>",
            B: "<class 'array'>",
            C: "<class 'tuple'>",
            D: "[1, 2, 3]"
        },
        correct: "A"
    },
    {
        question: "Which keyword is used to import a module in Python?",
        options: {
            A: "include",
            B: "import",
            C: "require",
            D: "using"
        },
        correct: "B"
    },
    {
        question: "What is the correct way to create a dictionary in Python?",
        options: {
            A: "dict = [1: 'a', 2: 'b']",
            B: "dict = {1: 'a', 2: 'b'}",
            C: "dict = (1: 'a', 2: 'b')",
            D: "dict = <1: 'a', 2: 'b'>"
        },
        correct: "B"
    },
    {
        question: "Which method removes the last element from a list?",
        options: {
            A: "remove()",
            B: "pop()",
            C: "delete()",
            D: "clear()"
        },
        correct: "B"
    },
    {
        question: "What is the output of 'Hello' + 'World'?",
        options: {
            A: "Hello World",
            B: "HelloWorld",
            C: "'Hello' 'World'",
            D: "Error"
        },
        correct: "B"
    },
    {
        question: "Which symbol is used for comments in Python?",
        options: {
            A: "//",
            B: "/* */",
            C: "#",
            D: "--"
        },
        correct: "C"
    },
    {
        question: "What is the output of bool(0)?",
        options: {
            A: "True",
            B: "False",
            C: "0",
            D: "Error"
        },
        correct: "B"
    },
    {
        question: "Which function converts a string to an integer?",
        options: {
            A: "int()",
            B: "integer()",
            C: "str()",
            D: "to_int()"
        },
        correct: "A"
    },
    {
        question: "What is the correct way to create a set in Python?",
        options: {
            A: "set = [1, 2, 3]",
            B: "set = {1, 2, 3}",
            C: "set = (1, 2, 3)",
            D: "set = <1, 2, 3>"
        },
        correct: "B"
    },
    {
        question: "Which method returns the index of a value in a list?",
        options: {
            A: "find()",
            B: "index()",
            C: "search()",
            D: "locate()"
        },
        correct: "B"
    }
];

// Load questions into database
function loadQuestions() {
    console.log('Loading sample questions into database...');
    
    let count = 0;
    let loaded = 0;
    
    for (const q of sampleQuestions) {
        db.addQuestion(q.question, q.options, q.correct, (err, id) => {
            if (err) {
                console.error('Error adding question:', err);
            } else {
                loaded++;
                console.log(`Loaded question ${loaded}/${sampleQuestions.length}`);
                
                if (loaded === sampleQuestions.length) {
                    console.log(`Successfully loaded ${loaded} questions into the database!`);
                    process.exit(0);
                }
            }
        });
        count++;
    }
}

// Initialize database and load questions
db.initDatabase();
setTimeout(loadQuestions, 1000); // Wait for database to initialize
