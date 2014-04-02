module.exports = function(grunt) {
  var sourceFiles = ['src/Group.js', 'src/Dimension.js', 'src/ChartGroup.js', 'src/BaseChart.js', 'src/Legend.js', 'src/DataTable.js', 'src/BarChart.js', 'src/MultipleChart.js', 'src/GroupedBarChart.js', 'src/StackedBarChart.js', 'src/Timeline.js', 'src/BaseChart.js', 'src/RowChart.js', 'src/PartitionChart.js'];


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
        files: ['Gruntfile.js', 'src/**/*.js', 'examples/*/*.js','!examples/lib/*.js'],
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
                vendor: ['./lib/jquery-1.10.2.js', './lib/d3.v3.js', './lib/crossfilter.js', './lib/knockout-3.0.0.js', './lib/d3.tip.js'],
                keepRunner: true
            }
        }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['default']
    },
    connect: {
        server: {
            options: {
                port: 8888,
                base: 'examples',
                keepalive: true
            },

        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['jsbeautifier', 'jshint','uglify', 'concat', "copy"]);

};