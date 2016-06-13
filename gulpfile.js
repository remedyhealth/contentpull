'use strict';

const gulp = require('gulp');
const pkg = require('./package.json');
const clean = require('gulp-clean');
const jsdoc = require('gulp-jsdoc3');
const lint = require('gulp-jscs');

///////////
//
// Doc
//
///////////

gulp.task('cleanDoc', () => gulp.src('./docs', {
        read: false,
    })
    .pipe(clean())
);

gulp.task('buildDoc', ['cleanDoc'], () => gulp.src('./src/**/*.js', {
        read: false,
    })
    .pipe(jsdoc({
        tags: {
            allowUnknownTags: true,
        },
        source: {
            excludePattern: '(^|\\/|\\\\)_',
        },
        opts: {
            destination: './docs',
            readme: './README.md',
            package: './package.json',
            tutorials: './tutorials',
        },
        plugins: [
            'plugins/markdown',
        ],
        templates: {
            systemName: 'content-reader',
            footer: '<!-- You can add content to the footer here -->',
            copyright: 'Copyright &copy; 2016 Remedy Health Media',
            linenums: true,
            monospaceLinks: false,
            outputSourceFiles: true,
            theme: 'united', // cerulean, cosmo, flatly, sandstone, spacelab, united
            navType: 'vertical',
            dateFormat: 'MMMM Do YYYY, h:mm:ss a',
        },
    }))
);

gulp.task('doc', ['buildDoc'], () => {
    gulp.watch([
        './src/**/*.js',
        './tutorials/**/*.md',
    ], ['buildDoc']);
});

gulp.task('lint', () => gulp.src([
        './src/**/*.js',
        './gulpfile.js',
        './index.js',
    ])
    .pipe(lint())
    .pipe(lint.reporter())
    .pipe(lint.reporter('fail'))
);

gulp.task('default', ['lint', 'buildDoc']);
