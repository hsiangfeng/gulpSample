const gulp = require('gulp');
const $ = require('gulp-load-plugins')({ lazy: false });
const autoprefixer = require('autoprefixer');
const minimist = require('minimist');
const browserSync = require('browser-sync').create();
const { envOptions } = require('./envOptions');

let options = minimist(process.argv.slice(2), envOptions);
//現在開發狀態
console.log(options);

function copyHTML() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./public/'));
}

function scss() {
  const plugins = [
    autoprefixer(),
  ];
  return gulp.src('./src/scss/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === 'prod', $.cssnano()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'));
}

function babel() {
  return gulp.src('./src/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/env']
    }))
    .pipe($.concat('all.js'))
    .pipe($.if(options.env === 'prod', $.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'));
}

function image() {
  return gulp.src('./src/img/**/*')
    .pipe($.if(options.env === 'prod', $.image()))
    .pipe(gulp.dest('./public/img/'));
}

function browser() {
  browserSync.init({
    server: {
      baseDir: "./public"
    },
    port: 8080
  });
}

function clean() {
  return gulp.src('./public', { read: false ,allowEmpty: true })
    .pipe($.clean());
}

function deploy() {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
}

function watch() {
  gulp.watch('./src/**/*.html', gulp.series('copyHTML'));
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
  gulp.watch('./src/js/**/*.js', gulp.series('babel'));
}

exports.deploy = deploy;

exports.build = gulp.series(clean, copyHTML, scss, babel, image);

exports.default = gulp.series(copyHTML, scss, babel, image, browser, watch);
