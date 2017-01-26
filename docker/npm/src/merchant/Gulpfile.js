var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync').create();

var envify = require('gulp-envify');

gulp.task('js', function() {

    var environment = null;

    try {
        environment = require('./env');
        console.log('Use builded env.js...');
    }
    catch (e) {
        console.log('Use docker env...');
    }

    return gulp.src('src/app.js')
        .pipe(browserify({
            transform: ['mithrilify']
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(envify(environment))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('public/build/'))
});

gulp.task('js-watch', ['js'], function(){
    browserSync.reload();
});

gulp.task('default', ['js'], function() {
    browserSync.init({
        server: {
           baseDir: "./public"
        }
    });

    gulp.watch('./src/**/*.js', ['js-watch']);
});
