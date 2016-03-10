var c = require('./index');
var reader = new c('cyn2ssr0iqx0', '1157ce98f62ebccc473a3fe59397c84fc685e5f1b7630ad56da07ccba3be50ca');

reader.findEntry('slideshow', {slug: 'common-acid-reflux-triggers'}).then(function (entry) {
    console.log(entry);
}, function(err) {
    console.log(err);
});
