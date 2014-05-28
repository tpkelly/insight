module.exports = function(grunt) {
    var sourceFiles = ['src/Group.js', 'src/Dimension.js', 'src/InsightCharts.Formatters.js', 'src/InsightCharts.Constants.js', 'src/ChartGroup.js', 'src/BaseChart.js', 'src/Legend.js', 'src/DataTable.js', 'src/BarChart.js', 'src/MultipleChart.js', 'src/GroupedBarChart.js', 'src/StackedBarChart.js', 'src/Timeline.js', 'src/BaseChart.js', 'src/TimelineChart.js', 'src/RowChart.js', 'src/PartitionChart.js'];


    // Livereload and connect variables
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

        connect: {
            server: {
                options: {
                    port: 8999,
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
                path: 'http://localhost:<%= connect.server.options.port %>'
            }
        },
        jshint: {
            files: ['js/**/*.js', '!lib/*.js'],
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
        "jsbeautifier": {
            files: ["./js/*.js", "./**/*.html"],
            options: {
                js: {
                    braceStyle: 'collapse',
                    indentChart: ' ',
                    indentSize: 4,
                    evalCode: true,
                    breakChainedMethods: true
                },
                html: {
                    braceStyle: "collapse",
                    indentChar: " ",
                    indentScripts: "keep",
                    indentSize: 4,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    unformatted: ["a", "sub", "sup", "b", "i", "u"],
                    wrapLineLength: 0
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>', './**/*.html', 'tests/*.spec.js'],
            tasks: ['jsbeautifier', 'jshint'],
            options: {
                livereload: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['jsbeautifier', 'jshint', 'connect:server', 'open:dev', 'watch']);

};
