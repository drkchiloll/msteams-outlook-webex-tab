/***
***Commands***
--gulp watch: to compile code and start the node process with a watch on changes to the code
--gulp: to compile code and get ready for deployment
***/

const gulp = require('gulp'),
      ts = require('gulp-typescript'),
      merge = require('merge2'),
      clean = require('gulp-clean'),
      ava = require('gulp-ava'),
      runSequence = require('run-sequence'),
      tsProject = ts.createProject('tsconfig.json'),
      spawn = require('child_process').spawn;

let node;

gulp.task('clean', () => {
  return gulp.src('release', {read: false}).pipe(clean());
});

gulp.task('compile', ['clean'], () => {
  let tsResult = gulp.src([
    "!./server/actions/*.ts",
    "!./server/components/*.ts",
    "!./server/containers/*.ts",
    "!./server/middleware/*.ts",
    "!./server/constants/*.ts",
    "!./server/reducers/*.ts",
    "!./server/store/*.ts",
    "./server/**/*.ts",
    "!./node_modules/**/*.ts"
  ]).pipe(tsProject()); //UPDATED FOR TS 2.X

	return merge([ // Merge output streams if nesissary
    tsResult.js.pipe(gulp.dest('release'))
	]);
});

gulp.task('server', ['compile'], () => {
  if(node) node.kill();
  node = spawn('node', ['release/run.js'], {stdio: 'inherit'});
  node.on('close', (code) => {
    if(code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('watch', ['server'], () => {
  gulp.watch('./server/**/**/*.ts', ['server']);
});

gulp.task('test', () => {
  return gulp.src('tests/*.js').pipe(ava());
});

gulp.task('default', () => {
  //This kind of sucks all tests have to be run after compile because ava does not understand typescript
  runSequence('compile', 'test' );
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
