const { src, dest, watch, series, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");

// плагины
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const fileInclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const size = require("gulp-size");
const pugs = require("gulp-pug");


// обработка html
const html = () => {
    return src("./src/html/*.html")
        .pipe(plumber({
            errorHandler: notify.onError(error => ({
                title: "HTML",
                message: error.message
            }))
        }))
        .pipe(fileInclude())
        .pipe(size({ title: "До сжатия" }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(size({ title: "После сжатия" }))
        .pipe(dest("./public"))
        .pipe(browserSync.stream());
}

// обработка PUG
const pug = () => {
    return src("./src/pug/*.pug")
        .pipe(plumber({
            errorHandler: notify.onError(error => ({
                title: "Pug",
                message: error.message
            }))
        }))
        .pipe(pugs({
            pretty: true,
            data: {
                news: require('./data/news.json')
            }
        })) 
        .pipe(dest("./public"))
        .pipe(browserSync.stream());
}

// удаление public

const clear = () => {
    return del("./public");
}

// сервер
const server = () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
}

// наблюдение

const watcher = () => {
    watch("./src/pug/**/*.pug", pug);
}

// задачи 
exports.pug = pug;
exports.watch = watcher;
exports.clear = clear;

// сборка
exports.dev = series(
    clear,
    pug,
    parallel(watcher, server)
);