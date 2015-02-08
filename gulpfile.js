'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    files = './!(build|node_modules|bower_components)/**/*';

gulp.task('csslint', function () {
  return gulp.src([files + '.less'])
    .pipe($.csslint())
    .pipe($.csslint.reporter());
});

gulp.task('jshint', function () {
  return gulp.src(files + '.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter($.jshintStylish));
});

gulp.task('less', function() {
  gulp.src(files + '.less')
    .pipe($.less())
    .pipe(gulp.dest('build'))
    .pipe($.livereload());
});

gulp.task('traceur', function () {
  var bowerFiles = require('main-bower-files');

  return gulp.src([files + '.js', '!*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.traceur())
    .pipe($.addSrc($.traceur.RUNTIME_PATH))
    .pipe($.addSrc(bowerFiles()))
    .pipe($.order([
      'traceur-runtime.js',
      'app.js' ]))
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('build'))
    .pipe($.livereload());
  });

  gulp.task('clean', function () {
    require('del').sync('build');
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

    gulp.watch([files + '.html'])
      .on('change', function(file) {
        $.livereload.changed(file.path);
      });

    gulp.watch([files + '.less'], ['less']);
    gulp.watch([files + '.js'], ['traceur']);
  });

  gulp.task('default', $.sequence('clean', ['csslint', 'jshint', 'less', 'traceur'], 'watch'));
