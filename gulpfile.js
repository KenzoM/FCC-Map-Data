var gulp = require('gulp');
var sass = require('gulp-sass')
var browserSync = require('browser-sync').create()
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var imageResize = require('gulp-image-resize');
var rename = require("gulp-rename");

gulp.task('sass', function(){
  return gulp.src('app/scss/*')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
})

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/css/**/*.css', browserSync.reload);
});

gulp.task('images', function(){
  return gulp.src('app/resizedImages/**/*')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: false
    })))
  .pipe(gulp.dest('app/dist/images'))
});

gulp.task('resize', function () {
  gulp.src('app/images_src/**/*')
    .pipe(imageResize({
      width : 70,
      height : 70,
      upscale : false,
      imageMagick: true
    }))
    .pipe(rename(function (path) { path.basename += "-70"; }))
    .pipe(gulp.dest('app/images_src'));
});

gulp.task('small-resize', function() {
  gulp.src('app/images_src/*')
    .pipe(imageResize({
      width: 70,
      height: 70,
      imageMagick: true
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(rename(function (path) { path.basename += "-small"; }))
    .pipe(gulp.dest('app/images_src'))
});
