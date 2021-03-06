'use strict';

var gulp                = require('gulp'),
    pug                 = require('gulp-pug'),
    path                = require('path'),
    bower               = require('gulp-bower'),
    jsHint              = require('gulp-jshint'),
    concat              = require('gulp-concat'),
    uglify              = require('gulp-uglify'),
    sourceMaps          = require('gulp-sourcemaps'),
    copy                = require('gulp-contrib-copy'),
    plumber             = require('gulp-plumber'),
    sass                = require('gulp-sass'),
    cleanCss            = require('gulp-clean-css'),
    autoPrefixer        = require('gulp-autoprefixer'),
    rename              = require('gulp-rename'),
    runSequence         = require('run-sequence'),
    browserSync         = require('browser-sync').create(),
    reload              = browserSync.reload;

var config              = {
    bowerDir            : './bower_components',
    fontsDEST           : 'dist/assets/fonts/',
    jsSRC               : ['./src/js/*.js'],
    jsDEST              : 'dist/assets/scripts/',
    concatJsFile        : 'app.min.js',
    vendorsJsSRC        : ['./src/vendors/**/*.js'],
    concatVendorJsFile  : 'vendors.min.js',
    fontAwesomeScssDEST : './src/sass/2-vendors/fontawesome/',
    vendorsCssSRC       : ['./src/vendors/**/*.css'],
    concatVendorCssFile : 'vendors.min.css',
    sassSRC             : ['./src/sass/app.sass'],
    cssDEST             : 'dist/assets/styles/',
    autoPrefixBrowsers  : ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
    pugSRC              : ['./src/pug/**/*.pug'],
    pugDEST             : './src/',
    htmlSRC             : ['./src/index.html'],
    htmlDEST            : 'dist/'
};

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest(config.bowerDir))
});

gulp.task('copyFontAwesomeFonts', function() {
  return gulp.src(config.bowerDir + '/font-awesome/fonts/**.*')
    .pipe(plumber())
    .pipe(gulp.dest(config.fontsDEST));
});

gulp.task('copyFontAwesomeSass', function() {
  return gulp.src(config.bowerDir + '/font-awesome/scss/**.*')
    .pipe(plumber())
    .pipe(gulp.dest(config.fontAwesomeScssDEST));
});

gulp.task('compressVendorStyles', function(){
  return gulp.src(config.vendorsCssSRC)
    .pipe(sourceMaps.init())
    .pipe(plumber())
    .pipe(concat(config.concatVendorCssFile))
    //.pipe(autoPrefixer({browsers: autoPrefixBrowsers}))
    .pipe(cleanCss())
    //.pipe(rename({extname: ".min.css"}))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(config.cssDEST));
});

gulp.task('cssifySass', function(){
  return gulp.src(config.sassSRC)
    .pipe(sourceMaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoPrefixer({browsers: config.autoPrefixBrowsers}))
    .pipe(cleanCss())
    .pipe(rename({extname: ".min.css"}))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(config.cssDEST));
});

gulp.task('processPugFiles', function(){
  return gulp.src(config.pugSRC)
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest(config.pugDEST));
});

gulp.task('copyHTML', function(){
  return gulp.src(config.htmlSRC)
    .pipe(plumber())
    .pipe(copy())
    .pipe(gulp.dest(config.htmlDEST));
});

gulp.task('copyVendorsScripts', function(){
  return gulp.src(config.vendorsJsSRC)
    .pipe(plumber())
    .pipe(concat(config.concatVendorJsFile))
    .pipe(gulp.dest(config.jsDEST));
});

gulp.task('lint', function(){
  return gulp.src(config.jsSRC)
    .pipe(plumber())
    .pipe(jsHint())
    .pipe(jsHint.reporter('default'));
});

gulp.task('concatAndMinifyScripts', function(){
  return gulp.src(config.jsSRC)
    .pipe(sourceMaps.init())
    .pipe(plumber())
    .pipe(concat(config.concatJsFile))
    .pipe(uglify())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(config.jsDEST));
});

gulp.task('serve', function(){
  browserSync.init({
    server: './dist/'
  });

  gulp.watch(config.pugSRC, ['processPugFiles']).on('change', reload);
  gulp.watch('./src/sass/**/*.sass', ['cssifySass']).on('change', reload);
  gulp.watch(config.jsSRC, ['lint', 'concatAndMinifyScripts']).on('change', reload);
  gulp.watch(config.vendorsJsSRC, ['copyVendorsScripts']).on('change', reload);
  gulp.watch(config.vendorsCssSRC, ['compressVendorStyles']).on('change', reload);
  gulp.watch(config.htmlSRC, ['copyHTML']).on('change', reload);
});

gulp.task('default', function(callback){
  runSequence(['serve', 'bower', 'copyFontAwesomeFonts', 'copyFontAwesomeSass', 'processPugFiles', 'compressVendorStyles', 'cssifySass', 'copyHTML', 'copyVendorsScripts', 'lint', 'concatAndMinifyScripts'], callback);
});
