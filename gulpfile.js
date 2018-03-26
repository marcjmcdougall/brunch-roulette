var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var bs = require('browser-sync').create(); // create a browser sync instance.


gulp.task('browser-sync', function() {
    bs.init({
        server: {
            baseDir: "./src",
            // directory: true,
            serveStaticOptions: {
                
                extensions: ["html"]
            }
        },
        port: 1337
    });
});


gulp.task('sass', function () {
    
    return gulp.src('./src/assets/scss/*.scss')
                .pipe(sass())
                .on('error', function (err) {

                    // Instead of crashing, simply log the error to the console.
                    console.log(err.toString());

                    // End the event to move to the next stage in the pipe.
                    this.emit('end');
                })
                .pipe(autoprefixer({
                    browsers: ['last 2 versions'],
                    // browsers: ['IE 6','Chrome 9', 'Firefox 14'],
                    cascade: false
                }))
                .pipe(gulp.dest('./src/assets/css'))
                .pipe(bs.reload({stream: true})); // prompts a reload after compilation
});


gulp.task('watch', ['browser-sync'], function () {
    
    // Watch all SASS, and JS files within all directories, and HTML inside this directory.
    gulp.watch("src/assets/scss/*.scss", ['sass']);
    gulp.watch("src/**/**.html").on('change', bs.reload);
    gulp.watch("src/dependencies/*.js").on('change', bs.reload);
});