/* jshint node: true */
'use strict';

var path = require('path');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.task.loadTasks('node_modules/styles-editor/tasks');

  var pkg = grunt.file.readJSON('./package.json');

  grunt.registerTask('copyLess2master', function () {
    if (!pkg.masterBranchDir) { return; }
    grunt.file.expand({cwd: 'styles'}, 'dmn-*.less').forEach(function (filename) {
      grunt.file.copy(path.join('styles', filename), path.join(pkg.masterBranchDir, 'styles', filename));
    });

    grunt.file.expand({cwd: 'fonts'}, '**.*').forEach(function (filename) {
      grunt.file.copy(path.join('fonts', filename), path.join(pkg.masterBranchDir, 'fonts', filename));
    });
  });

  grunt.initConfig({
    less: {
      options: {
        paths: [
          'node_modules'
        ]
      },

      styles: {
        files: {
          'dist/dmn-js.css':        'styles/dmn-js.less',
          'dist/dev.css':           'styles/dev.less',
          'dist/normalize.css':     'node_modules/bootstrap/less/normalize.less'
        }
      }
    },

    'extract-less-variables': {
      styles: {
        files: {
          'dist/styles-variables.json': 'styles/dmn-variables.less'
        }
      }
    },

    browserify: {
      dependencies: {
        options: {
          browserifyOptions: {
            standalone: 'deps',
            list: true,
            debug: true
          }
        },
        files: {
          'dist/dependencies.js': 'scripts/dependencies.js'
        }
      },

      scripts: {
        options: {
          ignore: [
            './dependencies'
          ],
          exclude: [
            './dependencies'
          ],
          browserifyOptions: {
            standalone: 'DecisionTable',
            list: true,
            debug: true
          }
        },
        files: {
          'dist/scripts.js': 'scripts/index.js'
        }
      }
    },

    connect: {
      dev: {
        options: {
          port: 9999,
          livereload: 9998,
          base: ['dist']
        }
      }
    },

    copy: {
      fonts: {
        files: [{expand: true, src: 'fonts/**', dest: 'dist/'}]
      },
      html: {
        files: [
          {src: 'index.html', dest: 'dist/index.html'},
          {src: 'favicon.ico', dest: 'dist/favicon.ico'},
          {src: 'scripts/app.js', dest: 'dist/app.js'},
          {src: 'images/contextmenu-cursor.png', dest: 'dist/contextmenu-cursor.png'}
        ]
      },
      editor: {
        files: [
          {src: 'node_modules/styles-editor/dist/styles-editor.js', dest: 'dist/styles-editor.js'},
          {src: 'node_modules/styles-editor/dist/styles-editor.css', dest: 'dist/styles-editor.css'},
          {cwd: 'node_modules/', src: 'bootstrap/less/**/*.less', expand: true, dest: 'dist/'}
        ]
      },
      less: {
        files: [
          {cwd: 'styles/', src: '*.less', expand: true, dest: 'dist/'}
        ]
      }
    },

    watch: {
      editor: {
        files: [
          'node_modules/styles-editor/dist/styles-editor.{js,css}'
        ],
        tasks: [
          'copy:editor'
        ]
      },

      less: {
        files: [
          'styles/**/*.less'
        ],
        tasks: [
          'extract-less-variables',
          'copy:less',
          'copyLess2master',
          'less:styles'
        ]
      },

      html: {
        files: [
          'index.html',
          'scripts/app.js'
        ],
        tasks: ['copy:html']
      },

      scripts: {
        files: [
          'scripts/**/*.js',
          '!scripts/dependencies.js',
          '!scripts/app.js'
        ],
        tasks: [
          'browserify:scripts'
        ]
      },

      dependencies: {
        files: [
          'scripts/dependencies.js',
          '!scripts/app.js'
        ],
        tasks: [
          'browserify:dependencies'
        ]
      },

      connect: {
        options: {
          livereload: 9998
        },
        files: [
          'dist/**.{html,js,css}'
        ],
        tasks: []
      }
    }
  });

  grunt.registerTask('build', [
    'copy',
    'extract-less-variables',
    'browserify',
    'less'
  ]);

  grunt.registerTask('default', [
    'build',
    'connect:dev',
    'watch'
  ]);
};
