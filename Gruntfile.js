module.exports = function(grunt) {
  var sourceFiles = ['src/Group.js', 'src/Dimension.js', 'src/InsightCharts.Formatters.js', 'src/InsightCharts.Constants.js', 'src/ChartGroup.js', 'src/BaseChart.js', 'src/Legend.js', 'src/DataTable.js', 'src/BarChart.js', 'src/MultipleChart.js', 'src/GroupedBarChart.js', 'src/StackedBarChart.js', 'src/Timeline.js', 'src/BaseChart.js','src/TimelineChart.js', 'src/RowChart.js', 'src/PartitionChart.js'];


  // Livereload and connect variables
    var LIVERELOAD_PORT = 35729;
    var lrSnippet = require('connect-livereload')({
        port: LIVERELOAD_PORT
    });

    var mountFolder = function( connect, dir ) {
        return connect.static(require('path').resolve(dir));
    };


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
          src: sourceFiles,
          dest: 'dist/<%= pkg.name %>.js'
      }
    },
    connect: {
                server: {
                  options: {
                    port: 8999,
                    hostname: 'localhost',
                    middleware: function( connect ) {
                        return [lrSnippet, mountFolder(connect, '.')];
                    }                    
                }
              },
                
    },
    open: {
           dev:{
            path: 'http://localhost:<%= connect.server.options.port %>/_SpecRunner.html'
          }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
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
  copy: {
    main: {
      files: [
      {
        expand: true, flatten:true, src: ['dist/*'], dest: 'C:\\Users\\nstavrakakis\\Documents\\visual studio 2013\\Projects\\ReportingTool\\ReportingTool\\Scripts\\d3Charts\\', filter: 'isFile'
      },
      {
        expand: true, flatten:true, src: ['dist/*'], dest: 'examples\\lib\\', filter: 'isFile'
      },
      {
        expand: true, flatten:true, src: ['dist/*'], dest: 'C:\\nstavrakakis\\dashboard\\lib\\insightcharts\\', filter: 'isFile'
      }
    ]
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
    watch: {
      files: ['<%= jshint.files %>', 'tests/*.spec.js'],
      tasks: ['jsbeautifier', 'jshint', 'concat', 'uglify', 'jasmine', 'copy'],
      options: {
                livereload: true
            }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['jsbeautifier', 'jshint', 'concat', 'uglify', 'connect:server', 'open:dev', 'copy', 'watch']);

};