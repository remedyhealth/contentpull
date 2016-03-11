var c = require('./index');
var reader = new c('cyn2ssr0iqx0', '1157ce98f62ebccc473a3fe59397c84fc685e5f1b7630ad56da07ccba3be50ca');

reader.findEntries('slideshow', {slug: 'common-triggers'}).then(entries => {
    console.log(entries);
}, err => {
    console.log(err);
});
