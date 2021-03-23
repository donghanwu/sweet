'use strict';

const gulp = require('gulp');
const { series, parallel, watch } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const livereload = require('gulp-livereload');
const spritesmith = require('gulp.spritesmith');
const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const bulkSass = require('gulp-sass-bulk-import');

const path = require('path');
const clean = require('gulp-clean');
const savefile = require('gulp-savefile');
const LIVERELOAD_FILES_PATH = ['./js/app.min.js', './js/alone/*.min.js', './**/*.html', "./assets/**/*.svg", "./assets/css/*.css", "index.html", "data/*.json", "tours/**/*.json"];
const SCRIPTS_BUNDLE_PATH = ['./js/**/*.js', '!./js/**/*.min.js', '!./js/alone/*.js', '!./js/app.min.js'];
const FONT_NAME = 'iconfont';

const cleanTmpCss = () => {
    return gulp.src('./assets/css/*', { read: false })
        .pipe(clean())
}

const makeIconfont = () => {
    return gulp.src(['./assets/svg/*.svg'])
        .pipe(iconfontCss({
            fontName: FONT_NAME,
            cssClass: 'iconfont',
            path: './assets/sass/templates/_iconfont_tmp.scss',
            targetPath: '../sass/starter/_iconfont.scss',
            fontPath: '../fonts/'
        }))
        .pipe(iconfont({
            fontName: FONT_NAME,
            formats: ['svg', 'ttf', 'eot', 'woff'],
            normalize: true,
        }))
        .pipe(gulp.dest('./assets/fonts/'));
};

const sassTmp = () => {
    return gulp.src(['./assets/sass/**/*.scss', '!./assets/sass/bootstrap/**/*.scss', '!./assets/sass/alone/*.scss'])
        .pipe(bulkSass())
        .pipe(sass.sync({ outputStyle: 'compressed', includePaths: './assets/sass/starter/' }).on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/tmp'))
};


const sassCurrentFile = (file) => {
    const sassTmpDestPath = path.dirname(file).replace('/sass', '/css/tmp');
    return gulp.src(file)
        .pipe(sass.sync({ outputStyle: 'compressed', includePaths: './assets/sass/starter/' }).on('error', sass.logError))
        .pipe(gulp.dest(sassTmpDestPath))
}

const tmpCssBundle = () => {
    return gulp.src([
        "./assets/css/tmp/reset.css",
        "./assets/css/tmp/bootstrap-csii.css",
        "./assets/css/tmp/starter/icon.css",
        "./assets/css/tmp/**/*.css",
        "./assets/css/tmp/partials/utility.css",
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('app.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./assets/css'))
};

const sprite = () => {
    const spriteData = gulp.src('./assets/images/sprite/_global/*.png')
        .pipe(spritesmith({
            imgName: 'images/sprite/_global_spritesheet.png',
            imgPath: '../images/sprite/_global_spritesheet.png',
            cssName: 'sass/starter/_sprite.scss'
        }));
    return spriteData.pipe(gulp.dest('./assets'));
};

const sassBootstrap = () => {
    return gulp.src('./assets/sass/bootstrap/**/*.scss')
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/tmp'));
};

const sassAlone = (file) => {
    return gulp.src(file)
        .pipe(bulkSass())
        .pipe(sass.sync({ outputStyle: 'compressed', includePaths: './assets/sass/starter/' }).on('error', sass.logError))
        .pipe(gulp.dest('./assets/css'))
};

const sassAloneAll = () => {
    return gulp.src('./assets/sass/alone/*.scss')
        .pipe(bulkSass())
        .pipe(sass.sync({ outputStyle: 'compressed', includePaths: './assets/sass/starter/' }).on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/'));
};

const scriptsLibsBundle = () => {
    return gulp.src([
        "./js/libs/jquery-core/jquery-1.12.1.js",
        "./js/libs/**/*.js",
        "!./js/libs/_libs.js",
    ])
        .pipe(concat('_libs.js'))
        .pipe(gulp.dest('./js/libs/'))
};


const scriptsBundle = () => {
    return gulp.src([
        //"./js/libs/_libs.js",
        "./js/*.js",
        "!./js/alone/*.js",
        "!./js/app.min.js"
    ])
        .pipe(
            babel({
                "presets": [
                    ["@babel/preset-env"]
                ]
            })
        )
        .pipe(browserify())
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./js'))
};

const sassTmpCompress = () => {
    return gulp.src(['./assets/sass/**/*.scss', '!./assets/sass/bootstrap/**/*.scss', '!./assets/sass/alone/*.scss'])
        .pipe(bulkSass())
        .pipe(sass.sync({ outputStyle: 'compressed', includePaths: './assets/sass/starter/' }).on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/tmp'))
}

const tmpCssBundleCompress = () => {
    return gulp.src([
        "./assets/css/tmp/reset.css",
        "./assets/css/tmp/bootstrap-csii.css",
        "./assets/css/tmp/starter/icon.css",
        "./assets/css/tmp/**/*.css",
        "./assets/css/tmp/partials/utility.css",
    ])
        .pipe(concat('app.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./assets/css'))
}

const scriptsAloneMinify = (file) => {
    return gulp.src(file, { allowEmpty: true })
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./js/alone'))
};

const scriptsAloneMinifyAll = () => {
    return gulp.src(['./js/alone/**/*.js', '!./js/alone/**/*.min.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./js/alone'))
};

const scriptsUglify = () => {
    return gulp.src('./js/app.min.js')
        .pipe(uglify())
        .pipe(gulp.dest('./js'))
}


const watchFiles = () => {
    livereload.listen();
    const liveReloadWatcher = watch(LIVERELOAD_FILES_PATH);
    liveReloadWatcher.on('all', (e, file, stats) => {
        gulp.src(file, { allowEmpty: true })
            .pipe(livereload());
    })
    const scssWatcher = watch(['./assets/sass/**/*.scss', '!./assets/sass/bootstrap/**/*.scss', '!./assets/sass/**/_*.scss', '!./assets/sass/alone/**/*.scss']);
    scssWatcher.on('all', (e, file, stats) => {
        sassCurrentFile(file)
    })
    const scriptAloneWatcher = watch(['./js/alone/**/*.js', '!./js/alone/**/*.min.js'])
    scriptAloneWatcher.on('all', (e, file, stats) => {
        scriptsAloneMinify(file)
    })

    const sassAloneWatcher = watch('./assets/sass/alone/**/*.scss')
    sassAloneWatcher.on('all', (e, file, stats) => {
        let filePath = file;
        if (path.basename(file).indexOf('_') === 0) {
            filePath = `Content/sass/alone/page-${path.dirname(file).split(path.sep).pop()}.scss`;
            return gulp.src(filePath).
                pipe(savefile())
        } else {
            sassAlone(filePath)
        }
    })

    watch('./assets/sass/bootstrap/**/*.scss', sassBootstrap);
    watch('./assets/css/tmp/**/*.css', tmpCssBundle);
    watch('./assets/images/sprite/_global/*.png', sprite);
    watch('./assets/svg/*.svg', makeIconfont);
    watch(SCRIPTS_BUNDLE_PATH, scriptsBundle);

};

const defaultStep01 = series(cleanTmpCss, parallel(makeIconfont, sprite, sassBootstrap))
const defaultStep02 = parallel(sassTmp /*, scriptsLibsBundle*/)
const defaultStep03 = parallel(sassAloneAll, scriptsAloneMinifyAll, scriptsBundle, tmpCssBundle)

gulp.task('_default', series(defaultStep01, defaultStep02, defaultStep03, watchFiles))
gulp.task('_sass-minify', series(defaultStep01, parallel(sassTmpCompress, sassAloneAll), tmpCssBundleCompress))
gulp.task('_scripts-minify', series( /*scriptsLibsBundle, */ scriptsBundle, scriptsUglify, scriptsAloneMinifyAll))