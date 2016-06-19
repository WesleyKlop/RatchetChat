'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import pump from 'pump';
import babel from 'gulp-babel';
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';
import concat from 'gulp-concat';
import webserver from 'gulp-webserver';
import del from 'del';

const paths = {
    src: {
        js: [
            'node_modules/dialog-polyfill/dialog-polyfill.js',
            'node_modules/markdown/lib/markdown.js',
            'public/src/scripts/*.js'
        ],
        sass: [
            'public/src/styles/*.scss',
            'node_modules/dialog-polyfill/dialog-polyfill.css'
        ],
        images: 'public/src/images/*',
        html: 'public/src/*.html',
        copy: [
            'public/src/.htaccess',
            'public/src/manifest.json',
            'public/src/manifest.webapp'
        ],
        sw: 'public/src/service-worker.js'
    },
    dest: {
        js: 'public/build/scripts/',
        sass: 'public/build/styles/',
        images: 'public/build/images/',
        html: 'public/build/',
        copy: 'public/build/',
        sw: 'public/build/'
    }
};

//noinspection JSUnresolvedFunction
/**
 * Compile sass and write sourcemaps
 */
gulp.task('style', () => pump([
    gulp.src(paths.src.sass),
    sourcemaps.init(),
    sass().on('error', sass.logError),
    autoprefixer(),
    concat('package.min.css'),
    sourcemaps.write('.'),
    gulp.dest(paths.dest.sass)
]));

/**
 * Compile JavaScript using babel and uglify
 */
gulp.task('compress', () => pump([
    gulp.src(paths.src.js),
    sourcemaps.init(),
    babel(),
    concat('package.min.js'),
    uglify(),
    sourcemaps.write(),
    gulp.dest(paths.dest.js)
]));

/**
 * Compile the service-worker using babel and uglify it
 */
gulp.task('build-sw', () => pump([
    gulp.src(paths.src.sw),
    sourcemaps.init(),
    babel(),
    uglify({
        mangle: false
    }),
    sourcemaps.write(),
    gulp.dest(paths.dest.sw)
]));

/**
 * Optimize images
 */
gulp.task('imagemin', () => pump([
    gulp.src(paths.src.images),
    imagemin(),
    gulp.dest(paths.dest.images)
]));

/**
 * Minify HTML
 */
gulp.task('htmlmin', () => pump([
    gulp.src(paths.src.html),
    htmlmin({collapseWhitespace: true}),
    gulp.dest(paths.dest.html)
]));

/**
 * Copy some files that don't need any other things
 */
gulp.task('copy', () => pump([
    gulp.src(paths.src.copy),
    gulp.dest(paths.dest.copy)
]));

/**
 * Watch files and automatically build
 */
gulp.task('watch', () => {
    gulp.watch(paths.src.html, ['htmlmin']);
    gulp.watch(paths.src.images, ['imagemin']);
    gulp.watch(paths.src.copy, ['copy']);
    gulp.watch(paths.src.js, ['compress']);
    gulp.watch(paths.src.style, ['style']);
});

/**
 * Webserver to use locally
 */
gulp.task('webserver', () => pump([
    gulp.src('public/build'),
    webserver({
        livereload: true,
        https: false,
        open: true
    })
]));

/**
 * Clean build folder
 */
gulp.task('clean', () => del(['public/build/.*', 'public/build/*']));

/**
 * Build complete package
 */
gulp.task('build', ['style', 'compress', 'imagemin', 'htmlmin', 'copy', 'build-sw']);

/**
 * Build and Watch
 */
gulp.task('default', ['build', 'watch']);

/**
 * Build and serve locally
 */
gulp.task('serve', ['build', 'webserver']);
