'use strict';

var gulp = require('gulp');
var pkg = require('./package.json');
var lint = require('gulp-jscs');
var clean = require('gulp-clean');
var jsdoc = require('gulp-jsdoc3');

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
  var files = [
    './src/**/*.js',
    './tutorials/**/*.md',
  ];
  gulp.watch(files, ['buildDoc']);
});

gulp.task('default', ['buildDoc']);
