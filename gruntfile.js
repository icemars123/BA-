module.exports = function (grunt) 
{
    grunt.initConfig
    ({

        // define source files and their destinations
        uglify: 
        {
            files: 
            {
                src: 'routes/dlg-product-new.js',  // source files mask
                dest: 'routes/jsm/',    // destination folder
                expand: true,    // allow dynamic building
                flatten: true,   // remove all unnecessary nesting
                ext: '.min.js'   // replace .js to .min.js
            }
        },
        watch: 
        {
            js: { files: '*.js', tasks: ['uglify'] },
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // register at least this one task
    grunt.registerTask('default', ['uglify']);


};
