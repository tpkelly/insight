module.exports = function(grunt) {
  var sourceFiles = ['src/cube/Group.js', 'src/cube/Dimension.js', 'src/InsightCharts.Formatters.js', 'src/InsightCharts.Constants.js', 'src/new/Series.js', 'src/new/Chart.js', 'src/new/Scale.js','src/new/Axis.js', 'src/new/LineSeries.js','src/new/ColumnSeries.js', 'src/ChartGroup.js', 'src/BaseChart.js', 'src/Legend.js', 'src/DataTable.js', 'src/ColumnChart.js', 'src/MultipleChart.js', 'src/GroupedBarChart.js', 'src/StackedBarChart.js', 'src/Timeline.js', 'src/BaseChart.js','src/TimelineChart.js', 'src/RowChart.js', 'src/PartitionChart.js'];



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
        braceStyle: 'expand',
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
    watch: {
      files: ['<%= jshint.files %>', 'tests/*.spec.js'],
      tasks: ['jsbeautifier', 'jshint', 'concat', 'uglify', 'jasmine']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask('default', ['jsbeautifier', 'jshint', 'jasmine', 'concat', 'uglify', 'watch']);
  grunt.registerTask('deploy', ['jsbeautifier', 'jshint', 'concat', 'uglify']);
};