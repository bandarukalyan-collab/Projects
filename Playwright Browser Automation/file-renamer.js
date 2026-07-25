const fs = require('fs');
const path = require('path');

/**
 * Renames a downloaded file to match the search keyword
 * @param {string} downloadedFilePath - Path to the downloaded file
 * @param {string} keyword - The search keyword to use as the new filename
 * @returns {string} - The new file path after renaming
 */
function renameDownloadedFile(downloadedFilePath, keyword) {
  try {
    const directory = path.dirname(downloadedFilePath);
    const extension = path.extname(downloadedFilePath);
    const newFileName = `${keyword}${extension}`;
    const newFilePath = path.join(directory, newFileName);

    // If the target file already exists, add a timestamp to avoid conflicts
    let finalNewFilePath = newFilePath;
    if (fs.existsSync(newFilePath)) {
      const timestamp = Date.now();
      finalNewFilePath = path.join(directory, `${keyword}-${timestamp}${extension}`);
    }

    fs.renameSync(downloadedFilePath, finalNewFilePath);
    console.log(`Renamed file: ${downloadedFilePath} -> ${finalNewFilePath}`);
    return finalNewFilePath;
  } catch (error) {
    console.error(`Failed to rename file: ${error.message}`);
    return downloadedFilePath; // Return original path if rename fails
  }
}

module.exports = { renameDownloadedFile };
