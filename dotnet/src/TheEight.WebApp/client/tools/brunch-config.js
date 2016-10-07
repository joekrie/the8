module.exports = {
  files: {
    javascripts: {
      joinTo: {
        "vendor.js": /^(?!app)/,
        "app.js": /^app/
      }
    },
    stylesheets: {
      joinTo: "app.css"
    }
  },
  plugins: {
    babel: {
      plugins: [
        "transform-decorators-legacy",
        [
          "transform-runtime",
          {
            polyfill: true,
            regenerator: true
          }
        ]
      ],
      presets: ["es2015-loose", "es2015", "stage-0", "react"]
    },
    sass: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }
    }
  }
};
