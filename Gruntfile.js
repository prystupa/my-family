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

    grunt.registerTask('default', ['jshint', 'compass']);
};
