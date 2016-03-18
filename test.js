var c = require('./index');
var reader = new c('k93yc4pkke22', '8df52946b77b1862ea5650ddb4b3b41a3047303d11defbdb0f8cb5fb8c2738b0');

reader.getEntryById('5edY84DmSc0oqGAEio4kKS').then(entry => {
    console.log(entry);
}, err => {
    console.log(err);
});
