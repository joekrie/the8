const gulp = require("gulp")
const mjml = require("gulp-mjml")
const postmark = require("postmark")

gulp.task("default", () => {
  const postmarkClient = postmark.Client(process.env.POSTMARK_SERVER_TOKEN)

  return gulp.src("../src/basic.mjml")
    .pipe(mjml())
    .pipe(gulp.dest("../dist"))
})
