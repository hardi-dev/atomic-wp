const { gulp, series, parallel, dest, src, watch } = require('gulp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const connect = require('gulp-connect-php');
const del = require('del');
const fs = require('fs');
const remoteSrc = require('gulp-remote-src');
const gutil = require('gulp-util');
const zip = require('gulp-vinyl-zip');
const download = require('gulp-download2');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');


/* -------------------------------------------------------------------------------------------------
Theme Name
-------------------------------------------------------------------------------------------------- */
const themeName = 'atomic-wp';

/* -------------------------------------------------------------------------------------------------
SCSS Plugin
-------------------------------------------------------------------------------------------------- */
const CSSLibrary = [
	'./node_modules'
];


/* -------------------------------------------------------------------------------------------------
Installation Tasks
-------------------------------------------------------------------------------------------------- */
async function cleanup() {
	await del(['./build']);
	await del(['./dist']);
}

async function downloadWordPress() {
  await download('https://wordpress.org/latest.zip').pipe(dest('./build/'));
}

async function unzipWordPress() {
	return await zip.src('./build/latest.zip').pipe(dest('./build/'));
}

async function copyConfig() {
	if (await fs.existsSync('./wp-config.php')) {
		return src('./wp-config.php')
			.pipe(inject.after("define('DB_COLLATE', '');", "\ndefine('DISABLE_WP_CRON', true);"))
			.pipe(dest('./build/wordpress'));
	}
}

async function installationDone() {
	await gutil.beep();
	await gutil.log(devServerReady);
	await gutil.log(thankYou);
}

exports.setup = series(cleanup, downloadWordPress);
exports.install = series(unzipWordPress, copyConfig, installationDone);


/* -------------------------------------------------------------------------------------------------
Development Tasks
-------------------------------------------------------------------------------------------------- */
function devServer() {
	connect.server(
		{
			base: './build/wordpress',
			port: '3020',
		},
		() => {
			browserSync({
				logPrefix: 'AtomicWP',
				proxy: '127.0.0.1:3020',
				host: '127.0.0.1',
				port: '3010',
				open: 'external',
			});
		},
  );
}

function copyThemeDev() {
	if (!fs.existsSync('./build')) {
		gutil.log(buildNotFound);
		process.exit(1);
	} else {
		return src(
      ['./src/theme/**', '!./src/theme/**/*.scss']).pipe(dest('./build/wordpress/wp-content/themes/' + themeName));
	}
}

function stylesDev() {
	return src('./src/theme/frontend/static/styles/style.scss')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(sourcemaps.init())
		.pipe(sass({
			includePaths: CSSLibrary	
		}).on("error", sass.logError))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./build/wordpress/wp-content/themes/' + themeName))
		.pipe(browserSync.stream({ match: '**/*.css' }));
}



exports.dev = series(
  copyThemeDev,
  stylesDev, 
  devServer
);

/* -------------------------------------------------------------------------------------------------
Utility Tasks
-------------------------------------------------------------------------------------------------- */
const onError = err => {
	gutil.beep();
	gutil.log(wpFy + ' - ' + errorMsg + ' ' + err.toString());
	this.emit('end');
};

/* -------------------------------------------------------------------------------------------------
Messages
-------------------------------------------------------------------------------------------------- */
const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
const errorMsg = '\x1b[41mError\x1b[0m';
const warning = '\x1b[43mWarning\x1b[0m';
const devServerReady =
	'Your development server is ready, start the workflow with the command: $ \x1b[1mnpm run dev\x1b[0m';
const buildNotFound =
	errorMsg +
	' ⚠️　- You need to install WordPress first. Run the command: $ \x1b[1mnpm run install:wordpress\x1b[0m';
const filesGenerated =
	'Your ZIP template file was generated in: \x1b[1m' +
	__dirname +
	'/dist/' +
	themeName +
	'.zip\x1b[0m - ✅';
const pluginsGenerated =
	'Plugins are generated in: \x1b[1m' + __dirname + '/dist/plugins/\x1b[0m - ✅';
const backupsGenerated =
	'Your backup was generated in: \x1b[1m' + __dirname + '/backups/' + date + '.zip\x1b[0m - ✅';
const wpFy = '\x1b[42m\x1b[1matomic-wp\x1b[0m';
const wpFyUrl = '\x1b[2m - http://www.atomic-wp.co/\x1b[0m';
const thankYou = 'Thank you for using ' + wpFy + wpFyUrl;

