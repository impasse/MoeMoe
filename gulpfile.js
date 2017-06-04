const gulp = require('gulp');
const stylus = require('gulp-stylus');
const autoprefixer = require('autoprefixer-stylus');
const clean = require('gulp-clean-css');
const { spawnSync } = require('child_process');

gulp.task('build:stylus', function() {
    return gulp.src('./theme/source/_styl/app.styl')
    .pipe(stylus({
        'include css': true,
        use: [autoprefixer('last 2 versions')]
    }))
    .pipe(clean())
    .pipe(gulp.dest('./theme/source/css/'));
});

gulp.task('build:page', function() {
    return require('./lib').main();
});

gulp.task('watch:page', function() {
    return gulp.watch('./source/**/*.*', ['build:page'], function() {
        console.info('build page complete');
    });
});

gulp.task('watch:stylus', function(cb) {
    return gulp.watch('./theme/source/_styl/**/*.styl', ['build:stylus'], function() {
        console.info('build stylus complete');
    });
});

gulp.task('watch', ['watch:stylus', 'watch:page'], function() {
    console.info('start watch');
});

gulp.task('build', ['build:stylus', 'build:page']);