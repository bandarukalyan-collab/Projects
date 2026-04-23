const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Initialize database
db.initDatabase();

// Load sample questions if database is empty
db.getAllQuestions((err, questions) => {
    if (err) {
        console.error('Error loading questions:', err);
        return;
    }
    if (questions.length === 0) {
        console.log('No questions found in database. Please run: node loadQuestions.js');
    }
});

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true
    }
});

// QR Code for authentication
client.on('qr', (qr) => {
    console.log('QR RECEIVED, scan with your WhatsApp:');
    qrcode.generate(qr);
    
    // Save QR code as image file
    QRCode.toFile(path.join(__dirname, 'qrcode.png'), qr, {
        width: 400,
        margin: 2
    }, (err) => {
        if (err) {
            console.error('Error saving QR code:', err);
        } else {
            console.log('QR code saved as: ' + path.join(__dirname, 'qrcode.png'));
            console.log('Open this file to scan with your phone');
        }
    });
});

// When client is ready
client.on('ready', () => {
    console.log('Client is ready!');
    console.log('Commands:');
    console.log('  !quiz - Send a quiz to the group');
    console.log('  !leaderboard - Show the leaderboard');
    console.log('  !score - Show your score');
    
    // Setup scheduled quizzes if enabled
    if (config.schedule.enabled) {
        setupSchedule();
    }
});

// Handle incoming messages
client.on('message_create', async (msg) => {
    console.log('Message create event fired');
    console.log('Message body:', msg.body);
    console.log('Message from:', msg.from);
    console.log('Message to:', msg.to);
    
    // Ignore messages from the bot itself
    if (msg.fromMe) {
        console.log('Message from bot itself, ignoring');
        return;
    }
    
    const chat = await msg.getChat();
    console.log('Is group:', chat.isGroup);
    
    // Only process messages from groups
    if (chat.isGroup) {
        const text = msg.body.trim();
        const groupId = chat.id._serialized;
        console.log('Group ID:', groupId);
        console.log('Message text:', text);
        
        // Handle commands
        if (text.startsWith('!')) {
            console.log('Command detected:', text);
            await handleCommand(msg, text, groupId);
            return;
        }
        
        // Check if it's an answer (A, B, C, or D)
        const answer = text.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(answer)) {
            console.log('Answer detected:', answer);
            await handleAnswer(msg, answer, groupId);
        }
    }
});

// Handle commands
async function handleCommand(msg, command, groupId) {
    const contact = await msg.getContact();
    const userName = contact.pushname || contact.number;
    
    switch (command.toLowerCase()) {
        case '!quiz':
            await sendQuiz(groupId);
            break;
        case '!leaderboard':
            await showLeaderboard(msg);
            break;
        case '!score':
            await showUserScore(msg, contact.number);
            break;
        default:
            // Unknown command
            break;
    }
}

// Handle answer submission
async function handleAnswer(msg, answer, groupId) {
    db.getActiveQuiz(groupId, async (err, activeQuiz) => {
        if (err) {
            console.error('Error getting active quiz:', err);
            return;
        }
        
        if (!activeQuiz) {
            return; // No active quiz
        }
        
        const contact = await msg.getContact();
        const phoneNumber = contact.number;
        const userName = contact.pushname || contact.number;
        
        // Check if user already answered
        db.hasUserAnswered(activeQuiz.question_id, phoneNumber, async (err, hasAnswered) => {
            if (err) {
                console.error('Error checking if user answered:', err);
                return;
            }
            
            if (hasAnswered) {
                await msg.reply(config.messages.alreadyAnswered);
                return;
            }
            
            // Get the question
            db.getQuestionById(activeQuiz.question_id, async (err, question) => {
                if (err) {
                    console.error('Error getting question:', err);
                    return;
                }
                
                // Check if answer is correct
                const isCorrect = answer === question.correct_answer;
                
                // Record the answer
                db.recordAnswer(activeQuiz.question_id, phoneNumber, userName, answer, isCorrect, (err) => {
                    if (err) {
                        console.error('Error recording answer:', err);
                        return;
                    }
                    
                    console.log(`${userName} answered: ${answer} (${isCorrect ? 'Correct' : 'Wrong'})`);
                });
                
                // Send feedback to user
                if (isCorrect) {
                    await msg.react('✅');
                } else {
                    await msg.react('❌');
                }
                
                // Immediately end quiz and show results
                await endQuiz(groupId);
            });
        });
    });
}

// Send a quiz question to a group
async function sendQuiz(groupId) {
    // End any existing active quiz
    db.getActiveQuiz(groupId, async (err, existingQuiz) => {
        if (err) {
            console.error('Error getting existing quiz:', err);
            return;
        }
        
        if (existingQuiz) {
            await endQuiz(groupId);
        }
        
        // Get a random question
        db.getRandomQuestion(async (err, question) => {
            if (err) {
                console.error('Error getting random question:', err);
                return;
            }
            
            if (!question) {
                console.log('No questions available in database');
                return;
            }
            
            // Set as active quiz
            db.setActiveQuiz(groupId, question.id, (err) => {
                if (err) {
                    console.error('Error setting active quiz:', err);
                    return;
                }
            });
            
            // Format the message
            const message = `${config.messages.quizStart}${question.question}

A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

⏱️ Answer with A, B, C, or D!`;
            
            await client.sendMessage(groupId, message);
            console.log('Quiz sent to group:', groupId);
        });
    });
}

// End a quiz and show results
async function endQuiz(groupId) {
    db.getActiveQuiz(groupId, async (err, activeQuiz) => {
        if (err) {
            console.error('Error getting active quiz:', err);
            return;
        }
        
        if (!activeQuiz) {
            return;
        }
        
        // End the quiz in database
        db.endActiveQuiz(groupId, (err) => {
            if (err) {
                console.error('Error ending active quiz:', err);
            }
        });
        
        // Get the question
        db.getQuestionById(activeQuiz.question_id, async (err, question) => {
            if (err) {
                console.error('Error getting question:', err);
                return;
            }
            
            // Get all answers
            db.getAnswersForQuestion(activeQuiz.question_id, async (err, answers) => {
                if (err) {
                    console.error('Error getting answers:', err);
                    return;
                }
                
                // Build results message
                let message = config.messages.quizEnd;
                message += `${config.messages.correctAnswer}${question.correct_answer}`;
                
                if (answers.length > 0) {
                    message += '\n\n📊 *Results:*';
                    const correctCount = answers.filter(a => a.is_correct).length;
                    message += `\nTotal answers: ${answers.length}`;
                    message += `\nCorrect: ${correctCount}`;
                    message += `\nWrong: ${answers.length - correctCount}`;
                } else {
                    message += '\n\n😢 No one answered!';
                }
                
                // Show leaderboard if enabled
                if (config.quiz.showLeaderboard && config.quiz.leaderboardPosition === 'after_quiz') {
                    db.getLeaderboard(5, async (err, leaderboard) => {
                        if (err) {
                            console.error('Error getting leaderboard:', err);
                            return;
                        }
                        
                        if (leaderboard.length > 0) {
                            message += config.messages.leaderboardTitle;
                            leaderboard.forEach((score, index) => {
                                message += `${index + 1}. ${score.user_name || score.phone_number}: ${score.score.toFixed(1)}% (${score.correct_answers}/${score.total_questions})\n`;
                            });
                        }
                        
                        await client.sendMessage(groupId, message);
                        console.log('Quiz ended for group:', groupId);
                        
                        // Automatically send next quiz
                        setTimeout(() => sendQuiz(groupId), 3000);
                    });
                } else {
                    await client.sendMessage(groupId, message);
                    console.log('Quiz ended for group:', groupId);
                    
                    // Automatically send next quiz
                    setTimeout(() => sendQuiz(groupId), 3000);
                }
            });
        });
    });
}

// Show leaderboard
async function showLeaderboard(msg) {
    db.getLeaderboard(10, async (err, leaderboard) => {
        if (err) {
            console.error('Error getting leaderboard:', err);
            await msg.reply('Error getting leaderboard.');
            return;
        }
        
        if (leaderboard.length === 0) {
            await msg.reply('No scores yet! Take some quizzes to see the leaderboard.');
            return;
        }
        
        let message = config.messages.leaderboardTitle;
        leaderboard.forEach((score, index) => {
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            message += `${emoji} ${score.user_name || score.phone_number}: ${score.score.toFixed(1)}% (${score.correct_answers}/${score.total_questions})\n`;
        });
        
        await msg.reply(message);
    });
}

// Show user's score
async function showUserScore(msg, phoneNumber) {
    db.getLeaderboard(100, async (err, scores) => {
        if (err) {
            console.error('Error getting scores:', err);
            await msg.reply('Error getting your score.');
            return;
        }
        
        const userScore = scores.find(s => s.phone_number === phoneNumber);
        
        if (!userScore) {
            await msg.reply("You haven't answered any questions yet!");
            return;
        }
        
        const message = `📊 *Your Score*\n\nName: ${userScore.user_name || phoneNumber}\nTotal Questions: ${userScore.total_questions}\nCorrect Answers: ${userScore.correct_answers}\nScore: ${userScore.score.toFixed(1)}%`;
        await msg.reply(message);
    });
}

// Setup scheduled quizzes
function setupSchedule() {
    const time = config.schedule.time;
    const days = config.schedule.days;
    
    console.log(`Setting up schedule for ${days.join(', ')} at ${time}`);
    
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = days.map(day => schedule.Range[0][day]);
    rule.hour = parseInt(time.split(':')[0]);
    rule.minute = parseInt(time.split(':')[1]);
    rule.tz = config.schedule.timezone;
    
    schedule.scheduleJob(rule, async () => {
        console.log('Scheduled quiz triggered');
        const groups = config.groups.allowedGroups;
        for (const groupId of groups) {
            await sendQuiz(groupId);
        }
    });
}

// Initialize client
client.initialize();
