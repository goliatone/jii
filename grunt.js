/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:jii.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        // src: ['<banner:meta.banner>', '<file_strip_banner:src/*.js>'],
        src: ['<banner:meta.banner>',
              'src/jii.js',
              'src/module.js',
              'src/pubsub.js',
              'src/model.js',
              'src/localstorage.js',
              'src/rest.js',
              'src/!*.old.js'
            ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    /*qunit: {
      files: ['test/** /*.html']
    },*/
    lint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint jasmine'
    },
    jasmine : {
      src : ['libs/jquery/jquery.js',
              'src/jii.js',
              'src/module.js',
              'src/pubsub.js',
              'src/**/*.js',
              'src/!(*.old.js)'
      ],
      specs : 'test/specs/**/*-spec.js',
      helpers : 'test/specs/helpers/*.js',
      timeout : 10000,
      junit : {
        output : 'junit/'
      },
      phantomjs : {
        'ignore-ssl-errors' : true
      }
    },
    // http://www.jshint.com/docs/
    jshint: {
      options: {
        curly: false,
        eqeqeq: true,
        immed: true,
        latedef: true,
        // newcap: true,
        // noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        // camelcase:true,
        forin:true,
        // indent:true,
        // quotmark:"double",
        // unused:true,
        trailing:true,
        lastsemic:true,
        devel:true,
        jquery:true
      },
      globals: {
        jii:true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.loadNpmTasks('grunt-jasmine-runner');
  grunt.registerTask('default', 'lint jasmine concat min');

};
