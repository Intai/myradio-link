'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    bowerFiles = require('main-bower-files'),
    files = './!(build|node_modules|bower_components)/**/*';

gulp.task('csslint', function () {
  return gulp.src([files + '.css'])
    .pipe($.csslint())
    .pipe($.csslint.reporter());
});

gulp.task('jshint', function () {
  return gulp.src(files + '.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter($.jshintStylish));
});

gulp.task('sass-delay', function(callback) {
  setTimeout(function() {
    callback();
  }, 500);
});

gulp.task('sass', function() {
  return gulp.src('app/app.module.scss')
    .pipe($.sass())
    .pipe($.minifyCss())
    .pipe($.rename('app.css'))
    .pipe(gulp.dest('build'))
    .pipe($.livereload());
});

gulp.task('font', function() {
  return gulp.src(bowerFiles())
    .pipe($.filter('**/*.{otf,eot,svg,ttf,woff,woff2}'))
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('image', function() {
  return gulp.src('./images/**/*.{jpg,png}')
    .pipe(gulp.dest('build/images'));
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
  return gulp.src(files + '.html', {cwd: 'app'})
    .pipe($.angularTemplatecache({
      root: '/',
      module: 'app.templates',
      standalone: true }))
    .pipe(gulp.dest('build'));
});

gulp.task('concat', function() {
  return gulp.src(['build/*.js', '!build/app.js'])
    .pipe($.addSrc($.traceur.RUNTIME_PATH))
    .pipe($.addSrc(bowerFiles()))
    .pipe($.filter('**/*.js'))
    .pipe($.order([
      'traceur-runtime.js',
      'angular.js',
      'angular-*.js',
      'templates.js',
      'underscore.js' ]))
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
  var express = require('express'),
      serveStatic = require('serve-static'),
      livereload = require('connect-livereload');

  var app = express()
    .use(livereload({
      port: 35729 }))
    .use(serveStatic('./build'))
    .use(function(req, res) {
      res.sendFile(__dirname + '/app/index.html');
    });

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

  gulp.watch([files + '.scss'], function() {
    // workaround missing scss files from sublime save.
    $.sequence('sass-delay', 'sass')();
  });

  gulp.watch([files + '.js'], function() {
    // wrap in a function because an instance
    // of sequence can't be executed repeatedly.
    $.sequence('traceur', 'browserify', 'templates', 'concat')();
  });

  // need to recompile htmls into js.
  gulp.watch([files + '.html'], function() {
    $.sequence('templates', 'concat')();
  });
});

gulp.task('default', $.sequence('clean', ['csslint', 'jshint', 'sass', 'font', 'image', 'traceur'], 'browserify', 'templates', 'concat', 'watch'));
