'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('csslint', function () {
  return gulp.src(['**/*.less'])
    .pipe($.filter(['**',
      '!build/**',
      '!node_modules/**',
      '!bower_components/**' ]))
    .pipe($.csslint())
    .pipe($.csslint.reporter());
});

gulp.task('jshint', function () {
  return gulp.src('**/*.js')
    .pipe($.filter(['**',
      '!*.js',
      '!build/**',
      '!node_modules/**',
      '!bower_components/**' ]))
    .pipe($.jshint())
    .pipe($.jshint.reporter($.jshintStylish));
});

gulp.task('less', function() {
  gulp.src('**/*.less')
    .pipe($.less())
    .pipe(gulp.dest('build'))
    .pipe($.livereload());
});

gulp.task('traceur', function () {
  var bowerFiles = require('main-bower-files'),
      filter = $.filter('!traceur-runtime.js');

  return gulp.src('**/*.js')
    .pipe($.filter(['**',
      '!*.js',
      '!build/**',
      '!node_modules/**',
      '!bower_components/**' ]))
    .pipe($.addSrc($.traceur.RUNTIME_PATH))
    .pipe($.addSrc(bowerFiles()))
    .pipe($.sourcemaps.init())
    .pipe($.order([
      'traceur-runtime.js',
      'app.js' ]))
    .pipe(filter)
    .pipe($.traceur())
    .pipe(filter.restore())
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('build'))
    .pipe($.livereload());
  });

  gulp.task('clean', function () {
    require('del')('build', function (err, deletedFiles) {
      console.log('Files deleted:', deletedFiles.join(', '));
    });
  });

  gulp.task('connect', function () {
    var connect = require('connect'),
        serveIndex = require('serve-index'),
        serveStatic = require('serve-static'),
        livereload = require('connect-livereload');

    var app = connect()
      .use(livereload({
        port: 35729 }))
      .use(serveIndex('.'))
      .use(serveStatic('.'));

    require('http').createServer(app)
      .listen(3000)
      .on('listening', function () {
        console.log('Started connect web server on http://localhost:3000');
      });
  });

  gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:3000');
  });

  gulp.task('watch', ['connect', 'serve'], function () {
    $.livereload.listen();

    gulp.watch(['**/*.html'])
      .on('change', function(file) {
        $.livereload.changed(file.path);
      });

    gulp.watch(['**/*.less',
      '!build/**',
      '!node_modules/**',
      '!bower_components/**'], ['less']);

    gulp.watch(['**/*.js',
      '!build/**',
      '!node_modules/**',
      '!bower_components/**'], ['traceur']);
  });

  gulp.task('default', ['csslint', 'jshint', 'less', 'traceur', 'watch']);
