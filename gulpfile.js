'use strict'

const gulp = require('gulp')
const clean = require('gulp-clean')
const jsdoc = require('gulp-jsdoc3')

gulp.task('cleanDoc', () => gulp.src('./docs', {read: false}).pipe(clean()))

gulp.task('buildDoc', ['cleanDoc'], () => gulp.src('./src/**/*.js', {read: false})
  .pipe(jsdoc({
    tags: {
      allowUnknownTags: true
    },
    source: {
      excludePattern: '(^|\\/|\\\\)_'
    },
    opts: {
      destination: './docs',
      readme: './README.md',
      package: './package.json',
      tutorials: './tutorials'
    },
    plugins: [
      'plugins/markdown'
    ],
    templates: {
      systemName: 'contentpull',
      footer: '<!-- You can add content to the footer here -->',
      copyright: 'Copyright &copy; 2016 Remedy Health Media',
      linenums: true,
      monospaceLinks: false,
      outputSourceFiles: true,
      theme: 'united',
      navType: 'vertical',
      dateFormat: 'MMMM Do YYYY, h:mm:ss a'
    }
  }))
)

gulp.task('doc', ['buildDoc'], () => {
  gulp.watch([
    './src/**/*.js',
    './tutorials/**/*.md'
  ], ['buildDoc'])
})

gulp.task('default', ['buildDoc'])
