const gulp = require('gulp');
const $ = require('gulp-load-plugins')({ lazy: false });
const autoprefixer = require('autoprefixer');
const minimist = require('minimist');
const browserSync = require('browser-sync').create();
$.sass.compiler = require('node-sass');

let envOptions = {
  string: 'env',
  default: {
    env: 'dev'
  }
};

let options = minimist(process.argv.slice(2), envOptions);
//現在開發狀態
console.log(options);

gulp.task('copyHTML', () => {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./public/'));
});

gulp.task('scss', () => {
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
});

gulp.task('babel', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/env']
    }))
    .pipe($.concat('all.js'))
    .pipe($.if(options.env === 'prod',$.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'));
});


gulp.task('image',() => {
  return gulp.src('./src/img/**/*')
  .pipe($.if(options.env ==='prod', $.image()))
  .pipe(gulp.dest('./public/img/'));
});

gulp.task('browser-sync', () => {
  browserSync.init({
      server: {
          baseDir: "./public"
      },
      port: 8080
  });
});

gulp.task('clean', () => {
  return gulp.src('./public', {read: false})
      .pipe($.clean());
});

gulp.task('deploy', function() {
  return gulp.src('./public/')
    .pipe($.ghPages());
});

gulp.task('watch', gulp.parallel('browser-sync', () =>{
  gulp.watch('./src/**/*.html', gulp.series('copyHTML'));
  gulp.watch('./src/scss/**/*.scss',  gulp.series('scss'));
  gulp.watch('./src/js/**/*.js', gulp.series('babel'));
}));

gulp.task('bulid', gulp.series('clean', 'copyHTML', 'scss', 'babel', 'image'));

gulp.task('default',gulp.series('copyHTML', 'scss', 'babel', 'image', 'watch'));