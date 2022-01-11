const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

const styles = () => {
  return src('./app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
    )
    .pipe(dest('./app/css'))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src(['node_modules/jquery/dist/jquery.js', './app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream());
};

const images = () => {
  return src('app/images/**/*.*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest('dist/images'));
};

const browsersync = () => {
  browserSync.init({
    server: './app',
    notify: false,
  });
};

const build = () => {
  return src(
    ['app/**/*.html', './app/js/main.min.js', 'app/css/style.min.css'],
    { base: 'app' }
  ).pipe(dest('dist'));
};

const deleteDist = () => {
  return del('dist');
};

const watching = () => {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
};

exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.deleteDist = deleteDist;
exports.watching = watching;
exports.browsersync = browsersync;

exports.build = series(deleteDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);
