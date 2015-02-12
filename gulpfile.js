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
  return gulp.src(files + '.less')
    .pipe($.less())
    .pipe(gulp.dest('build'))
    .pipe($.livereload());
});

gulp.task('traceur', function () {
  return gulp.src([files + '.js', '!*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.traceur({
      modules: 'commonjs' }))
    .pipe($.sourcemaps.write('.', {
      sourceMappingURLPrefix: '/build' }))
    .pipe(gulp.dest('build'));
});

gulp.task('browserify', function () {
  var browserify = require('browserify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer');

  var bundler = browserify({
    entries: './build/app/app.module.js',
    debug: true
  });

  return bundler
    .bundle()
    .pipe(source('modules.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({
      loadMaps: true }))
    .pipe($.uglify({
      compress: false }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('templates', function () {
  gulp.src(files + '.html')
  .pipe($.angularTemplatecache())
  .pipe(gulp.dest('build'));
});

gulp.task('concat', function() {
  var bowerFiles = require('main-bower-files');

  return gulp.src(['build/*.js', '!build/app.js'])
    .pipe($.addSrc($.traceur.RUNTIME_PATH))
    .pipe($.addSrc(bowerFiles()))
    .pipe($.order([
      'traceur-runtime.js',
      'angular*.js',
      'app/**' ]))
    .pipe($.sourcemaps.init({
      loadMaps: true }))
    .pipe($.concat('app.js'))
    .pipe($.uglify({
      compress: false }))
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
  gulp.watch([files + '.js'], function() {
    // wrap in a function because an instance
    // of sequence can't be executed repeatedly.
    $.sequence('traceur', 'browserify', 'templates', 'concat')();
  });
});

gulp.task('default', $.sequence('clean', ['csslint', 'jshint', 'less', 'traceur'], 'browserify', 'templates', 'concat', 'watch'));
