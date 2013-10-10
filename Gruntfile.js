module.exports = function (grunt) {

    grunt.initConfig({
        compass: {
            dist: {
                options: {
                    sassDir: 'sass',
                    cssDir: 'public/css'
                }
            }
        },

        jshint: {
            all: ['Gruntfile.js', 'lib/**/*.js', 'public/**/*.js']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            }
        },

        watch: {
            scripts: {
                files: ['**/*.scss'],
                tasks: ['compass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint', 'mochaTest', 'compass']);
};
