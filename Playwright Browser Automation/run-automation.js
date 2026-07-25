const readline = require('readline');
const { openDocumentSearch } = require('./dell-search-web');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== B2B File Download Automation ===\n');

rl.question('Dell Username: ', (username) => {
  rl.question('Dell Password: ', (password) => {
    rl.question('Keywords (comma-separated): ', (keywordsStr) => {
      const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);
      
      if (keywords.length === 0) {
        console.log('\nError: At least one keyword is required.');
        rl.close();
        return;
      }

      console.log('\nStarting automation...');
      console.log(`Processing ${keywords.length} keyword(s)...\n`);

      openDocumentSearch(username, password, keywords, (message, type) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
      }, true).then(() => {
        console.log('\nAutomation completed successfully!');
        rl.close();
      }).catch((error) => {
        console.error('\nError:', error.message);
        rl.close();
      });
    });
  });
});
