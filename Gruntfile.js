module.exports = function(grunt) {
  var sourceFiles = ['src/Insight.js', 'src/utils/*.js', 'src/mda/*.js', 'src/Dashboard.js', 'src/charts/Series.js', 'src/charts/Chart.js','src/charts/MarkerSeries.js', 'src/charts/BubbleSeries.js', 'src/charts/RowSeries.js',  'src/charts/Scale.js','src/charts/Axis.js', 'src/charts/LineSeries.js','src/charts/ColumnSeries.js'];
   
  var LIVERELOAD_PORT = 35729;
  var lrSnippet = require('connect-livereload')({
      port: LIVERELOAD_PORT
  });
  
  var mountFolder = function(connect, dir) {
        return connect.static(require('path')
            .resolve(dir));
    };
  

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
          src: sourceFiles,
          dest: 'dist/insight.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/insight.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
        files: ['Gruntfile.js', 'src/**/*.js', 'examples/*/*.js','!examples/lib/*.js', '!examples/js/*.js' ],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
  "jsbeautifier" : {
    files : ["src/**/*.js"],
    options:
    {
      js:
      {
        braceStyle: 'collapse',
        indentChart: ' ',
        indentSize: 4,
        evalCode: true,
        breakChainedMethods: true
      }
    }
  },
  jasmine: {
        dev: {
            src: sourceFiles,
            options: {
                specs: 'tests/*spec.js',
                vendor: ['./bower_components/jquery/jquery.js', './bower_components/d3/d3.js', './bower_components/crossfilter/crossfilter.js', './lib/d3.tip.js'],
                keepRunner: true
            }
        }
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: 'themes/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/',
        ext: '.min.css'
      }
    },
    connect: {
            server: {
                options: {
                    port: 9000,
                    base: '.',
                    hostname: 'localhost',
                    middleware: function(connect) {
                        return [lrSnippet, mountFolder(connect, '.')];
                    }
                }
            },

        },
    open: {
        dev: {
            path: 'http://localhost:<%= connect.server.options.port %>/_SpecRunner.html'
        }
    },
    watch: {
      files: ['<%= jshint.files %>', 'tests/*.spec.js'],
      tasks: ['jsbeautifier', 'jshint', 'jasmine', 'concat', 'uglify', 'jsdoc'],
      options: {
          livereload: true
      }
    },
    jsdoc : {
        dist : {
            src: ['src/**/*.js'], 
            options: {
                destination: 'doc',
                template: 'doctemplate'
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('deploy', ['jsbeautifier', 'jshint', 'jasmine', 'concat', 'uglify', 'cssmin', 'jsdoc']);
  grunt.registerTask('default', ['deploy', 'connect:server','open','watch']);
};
