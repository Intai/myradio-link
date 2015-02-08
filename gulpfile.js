'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('csslint', function () {
  return gulp.src('**/*.css')
    .pipe($.filter(['**',
      '!node_modules/**',
      '!bower_components/**']))
    .pipe($.csslint())
    .pipe($.csslint.reporter());
});

gulp.task('jshint', function () {
  return gulp.src('**/*.js')
    .pipe($.filter(['**',
      '!*.js',
      '!node_modules/**',
      '!bower_components/**']))
    .pipe($.jshint())
    .pipe($.jshint.reporter($.jshintStylish));
});

gulp.task('traceur', function () {
  var bowerFiles = require('main-bower-files'),
      filter = $.filter('!traceur-runtime.js');

  return gulp.src('**/*.js')
    .pipe($.filter(['**',
      '!*.js',
      '!node_modules/**',
      '!bower_components/**']))
    .pipe($.addSrc($.traceur.RUNTIME_PATH))
    .pipe($.addSrc(bowerFiles()))
    .pipe($.sourcemaps.init())
    .pipe($.order([
      'traceur-runtime.js',
      'app.js']))
    .pipe(filter)
    .pipe($.traceur())
    .pipe(filter.restore())
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
  });

  gulp.task('clean', function () {
    return gulp.src('build', { read: false })
    .pipe($.clean());
  });

  gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
    .use(require('connect-livereload')({
      port: 35729
    }))
    .use(connect.static('.'))
    .use(connect.directory('.'));

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
    var server = $.livereload();

    gulp.watch([
      '*.html',
      'styles/*.css',
      'build/*.js'
      ]).on('change', function (file) {
        server.changed(file.path);
      });

      gulp.watch(['styles/*.css'], ['csslint']);
      gulp.watch(['gulpfile.js', 'scripts/*.js'], ['jshint', 'traceur']);
    });

    gulp.task('default', ['csslint', 'jshint', 'traceur', 'connect', 'watch']);
