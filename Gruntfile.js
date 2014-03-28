module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
          src: ['src/Group.js', 'src/Dimension.js', 'src/ChartGroup.js', 'src/BaseChart.js', 'src/Legend.js', 'src/DataTable.js', 'src/BarChart.js', 'src/MultipleChart.js', 'src/GroupedBarChart.js', 'src/StackedBarChart.js', 'src/Timeline.js', 'src/BaseChart.js', 'src/RowChart.js', 'src/PartitionChart.js'],
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
      }
    ]
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['jsbeautifier', 'jshint','uglify', 'concat', "copy"]);

};