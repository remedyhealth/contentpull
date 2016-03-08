var reader;
try {
    reader = require('./src/content-reader');
} catch (err) {
    console.log(err);
    process.exit(1);
}

module.exports = reader;
