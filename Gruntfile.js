module.exports = function(grunt) {
  var sourceFiles = [
    'src/insight-dependencies.js',
    'src/Insight.js',
    'src/utils/*.js',
    'src/helpers/*.js',
    'src/tests/**/*.spec.js',
    'src/mda/*.js', 
    'src/charts/Theming/Theme.js',
    'src/charts/Theming/LightTheme.js',
    'src/charts/ChartGroup.js',
    'src/charts/Chart.js',
    'src/charts/Table.js',
    'src/charts/Tooltip.js',
    'src/charts/Legend.js',
    'src/charts/Axis/Axis.js',
    'src/charts/Axis/ScaleStrategies/AxisStrategy.js',
    'src/charts/Axis/ScaleStrategies/DateAxis.js',
    'src/charts/Axis/ScaleStrategies/LinearAxis.js',
    'src/charts/Axis/ScaleStrategies/OrdinalAxis.js',
    'src/charts/Axis/AxisGridlines.js',
    'src/charts/Series/Series.js',
    'src/charts/Series/PointSeries.js',
    'src/charts/Series/BarSeries.js',
    'src/charts/Series/MarkerSeries.js',
    'src/charts/Series/BubbleSeries.js', 
    'src/charts/Series/ScatterSeries.js', 
    'src/charts/Series/RowSeries.js',  
    'src/charts/Series/LineSeries.js',
    'src/charts/Series/ColumnSeries.js', 
    'src/insight-amd.js'];
   
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
        eqeqeq: true,
        eqnull: true,
        curly: true,
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
    files : sourceFiles,
    options:
    {
      js:
      {
        fileTypes: ['.spec.js'],
        braceStyle: 'collapse',
        indentChart: ' ',
        indentSize: 4,
        evalCode: true,
        breakChainedMethods: false
      }
    }
  },
  jasmine: {
        dev: {
            src: sourceFiles,
            options: {
                specs: 'tests/**/*spec.js',
                helpers: ['tests/charts/Mocks/d3-mocks.js', 'tests/insightTesting.js', 'tests/matchers/toContainSameElementsAs.js'],
                vendor: ['./bower_components/jquery/jquery.js', './bower_components/d3/d3.js', './bower_components/crossfilter/crossfilter.js'],
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
      files: ['<%= jshint.files %>', 'tests/**/*.spec.js'],
      tasks: ['deploy'],
      options: {
          livereload: true
      }
    },
    compress: {
        zip: {
            options: {
                archive: './insight.js.zip',
                mode: 'zip'
            },
            files: [
                {src: './dist/**', dest:'InsightJS/'},
                {src: 'Changelog.txt', dest:'InsightJS/'}]
        }
    },
    jsdoc : {
        dist : {
            src: ['src/**/*.js'], 
            options: {
                destination: 'dist/docs',
                template: 'doctemplate'
            }
        }
    },
    clean: ["dist/docs/"]
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
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  

  
  grunt.registerTask('deploy', ['jsbeautifier', 'jshint', 'jasmine', 'concat', 'uglify', 'cssmin', 'clean', 'jsdoc', 'compress']);
  grunt.registerTask('default', ['deploy', 'connect:server','open','watch']);
};
