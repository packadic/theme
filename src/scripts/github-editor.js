define([ 'jquery', 'config', 'theme', 'plugins/async', 'plugins/oauth-io', 'plugins/github-api', 'plugins/mscrollbar' ],
    function( $, config, theme, async, OAuth, Github ){

    OAuth.initialize(config.oauth_io);

    var api = {};
    var github = null;
    var editor = {
        $el   : null
    };

    function cre( el ){
        if( _.isUndefined(el) ){
            el = 'div';
        }
        return $(document.createElement(el));
    }

    (function Editor(){


        editor.getBox = function(name, data, cb){
            theme.getTemplate('github-editor/' + name, function( template ){
                var $tpl = $(template(data));
                $('body').append($tpl.hide());
                $.mCustomScrollbar.defaults.theme = 'dark';
                $tpl.find('.scrollable').addClass('mCustomScrollbar').mCustomScrollbar();
                cb($tpl);
            });
        };

        editor.getAll = function(done){
            async.waterfall([
                // Get organisations
                function(cb){
                    data = {};
                    github.getUser().orgs(function( err, orgs ){
                        data.orgs = orgs;
                        cb(null, data);
                    });
                },

                // Get repos for each organisation
                function(data, cb){
                    repoRequests = {};

                    $.each(data.orgs, function(i, org){

                        repoRequests[org.login] = function( callback){
                            github.getUser().orgRepos(org.login, function(err, repos){
                                callback(null, repos)
                            })
                        }

                    });

                    async.parallel(repoRequests, function(err, result){
                        data.repos = result;
                        cb(null, data)
                    });

                },

                // Get user repos
                function(data, cb){
                    github.getUser().repos(function( err, repos ){
                        data.repos.user = repos;
                        cb(null, data);
                    });
                }
            ], function(err, results){
                console.log('all results', results);
                done(results);
            })
        };


        editor.getAuthButton = function($el){

            var btnAuth = { $el: $el || cre('a').addClass('btn btn-sm blue-light hide').attr('id', 'github-auth').attr('href', '#').text('Login') };
            btnAuth.setLogin = function(){
                btnAuth.$el.off('click').text('Login').on('click', function( e ){
                    e.preventDefault();
                    editor.api.authorize();
                    btnAuth.setLogout()
                })
            };
            btnAuth.setLogout = function(){
                btnAuth.$el.off('click').text('Logout').on('click', function(e){
                    e.preventDefault();
                    editor.api.logout();
                    btnAuth.setLogin()
                })
            };
            if(editor.api.isAuthorized()){
                btnAuth.setLogout()
            } else {
                btnAuth.setLogin()
            }
            return btnAuth.$el.removeClass('hide');
        };

        editor.init = function( $el ){
            editor.$el = $($el);

            if( api.isAuthorized() && !github ){
                github = new Github({
                    token: api.request().access_token,
                    auth : 'oauth'
                });

                editor.github = github;
            }

           // editor.initRepositoriesTable();
           //editor.initOrganisationsTable();
        };

    }.call());

    (function Api(){

        api.authorize = function( cb ){
            OAuth.popup('github', {cache: true}).done(function( result ){
                if( !github ){
                    github = new Github({
                        token: api.request().access_token,
                        auth : 'oauth'
                    });
                }

                if( _.isFunction(cb) ){
                    cb(result);
                }

            }).fail(function( err ){
                console.log(err);
            });
        };

        api.logout = function(){
            OAuth.clearCache('github');
            github = null;
        };

        api.isAuthorized = function(){
            return _.isObject(OAuth.create('github'));
        };

        api.request = function(){
            return OAuth.create('github');
        };

    }.call());

    editor.api = api;
    return editor;
});
