define([ 'jquery', 'theme', 'plugins/async', 'plugins/oauth-io', 'Github', 'Codepad', 'plugins/bootbox', 'storage', 'eventer', 'plugins/mscrollbar' ],
    function( $, theme, async, OAuth, Github, Codepad, bootbox, storage, eventer ){


        var packadic = (window.packadic = window.packadic || {});
        function cre( el ){
            return $(document.createElement(_.isUndefined(el) ? 'div' : el));
        }

        var github = new Github();
        var codepad = new Codepad(Math.random);
        var ui = {};

        var editor = {
            github : github,
            codepad: codepad,
            ui     : ui
        };
        eventer('editor', editor);
        editor._defineEvent('editor.file.open');
        editor._defineEvent('editor.file.close');
        editor._defineEvent('editor.file.commit');

        (function Connection(){
            OAuth.initialize(packadic.config.oauth_io);

            github.authorize = function( preventReload ){
                preventReload = preventReload || false;
                OAuth.popup('github', {cache: true}).done(function( result ){
                    if( !preventReload ){
                        window.location.reload();
                    }
                }).fail(function( err ){
                    console.log(err);
                });
            };

            github.clearAuthorization = function( preventReload ){
                preventReload = preventReload || false;
                OAuth.clearCache('github');
                if( !preventReload ){
                    window.location.reload();
                }
            };

            github.isAuthorized = function(){
                return _.isObject(OAuth.create('github'));
            };

            github.request = function(){
                return OAuth.create('github');
            };

            if( github.isAuthorized() ){
                github.setAccessToken(github.request().access_token);
                github.setAuth('oauth');
            }


            github.getUserData = function( done ){
                async.waterfall([
                    function( cb ){
                        data = {};
                        github.getUser().orgs(function( err, orgs, xhr ){
                            console.log('xhr', xhr);
                            data.orgs = orgs;
                            cb(null, data);
                        });
                    },
                    function( data, cb ){
                        repoRequests = {};
                        $.each(data.orgs, function( i, org ){
                            repoRequests[ org.login ] = function( callback ){
                                github.getUser().orgRepos(org.login, function( err, repos ){
                                    callback(null, repos)
                                })
                            }
                        });
                        async.parallel(repoRequests, function( err, result ){
                            data.repos = result;
                            cb(null, data)
                        });
                    },
                    function( data, cb ){
                        github.getUser().repos(function( err, repos ){
                            data.repos.user = repos;
                            cb(null, data);
                        });
                    }
                ], function( err, results ){
                    console.log('all results', results);
                    done(err, results);
                })
            };

            github.getRepository = function( owner, repoName, done ){
                var repoApi = github.getRepo(owner, repoName);
                async.parallel({
                    info    : function( cb ){
                        repoApi.show(function( err, info ){
                            cb(null, info)
                        })
                    },
                    branches: function( cb ){
                        repoApi.listBranches(function( err, branches ){
                            cb(null, branches);
                        })
                    }
                }, function( err, result ){
                    done(err, result.info, result.branches, repoApi);
                })
            };

            github.getDirectory = function( owner, repoName, branch, path, done ){
                if( typeof path !== string ){
                    path = '';
                }

                var repoApi = github.getRepo(owner, repoName);
                repoApi.contents(branch, path, function( err, files ){
                    done(err, files, repoApi);
                });
            };

            github.getFile = function( owner, repoName, branch, path, done ){
                var repoApi = github.getRepo(owner, repoName);
                repoApi.read(branch, path, function( err, fileContent ){
                    done(err, fileContent, repoApi)
                })
            };

            github.commitFile = function( owner, repoName, branch, path, content, message, done ){
                var repoApi = github.getRepo(owner, repoName);
                repoApi.write(branch, path, content, message, function( err ){
                    if( err ){
                        console.log('error committing file: ', err);
                    }
                    done(err);
                });
            };


        }.call());

        (function CodePad(){
            codepad._file = {};
            // Close button
            codepad.addToolbarButton('close', 'Close', 'btn-warning').on('click', function( e ){
                e.preventDefault();
                editor._trigger('editor.file.close');
                codepad.hide();
            });

            // Commit button
            codepad.addToolbarButton('commit', 'Commit/save', 'btn-success').on('click', function( e ){
                e.preventDefault();
                bootbox.prompt('Enter a commit message', function( message ){
                    if( message === false || typeof message !== 'string' ){
                        return;
                    }
                    editor._trigger('editor.file.commit', file, message);
                    var file = codepad._file;
                    github.commitFile(file.owner, file.repoName, file.branch, file.path, codepad.getValue(), message, function( err ){
                        theme.alert({message: 'File commited successfully.'})
                    })
                })
            });
        }.call());

        (function UI(){

            ui.getTemplate = function( name, cb ){
                theme.getTemplate('github-editor/' + name, cb);
            };

            function getTemplate( name, data, cb ){
                theme.getTemplate('github-editor/' + name, function( template ){
                    var $tpl = $(template(data));
                    $('body').append($tpl.hide());
                    $.mCustomScrollbar.defaults.theme = 'dark';
                    $tpl.find('.scrollable').addClass('mCustomScrollbar').mCustomScrollbar();
                    cb($tpl);
                });
            }

            ui.getAuthButton = function( $el ){

                if( !_.isUndefined(this.btnAuth) ){
                    console.warn('getAuthButton $el is undefined', this.btnAuth);
                    return this.btnAuth;
                }
                var btnAuth = {$el: $el || cre('a').addClass('btn btn-sm blue-light hide').attr('id', 'github-auth').attr('href', '#').text('Login')};
                btnAuth.setLogin = function(){
                    btnAuth.$el.off('click').text('Login').on('click', function( e ){
                        e.preventDefault();
                        github.authorize();
                    })
                };
                btnAuth.setLogout = function(){
                    btnAuth.$el.off('click').text('Logout').on('click', function( e ){
                        e.preventDefault();
                        github.clearAuthorization();
                    })
                };
                if( github.isAuthorized() ){
                    btnAuth.setLogout()
                } else {
                    btnAuth.setLogin()
                }
                btnAuth.$el.removeClass('hide');
                return this.btnAuth = btnAuth;
            };


            ui.createFileEditor = function( owner, repoName, branch, path, done ){

                async.parallel({
                    codepad: function( callback ){
                        codepad.init(function( cb ){
                            codepad.enableToolbar();
                            callback(null, codepad);
                        })
                    },
                    file   : function( callback ){
                        github.getFile(owner, repoName, branch, path, function( err, fileContent, repoApi ){
                            callback(null, fileContent);
                        });
                    }
                }, function( err, result ){
                    codepad._file = {
                        owner   : owner,
                        repoName: repoName,
                        branch  : branch,
                        path    : path
                    };
                    codepad.setValue(result.file);
                    codepad.setModeForPath(path);
                    editor._trigger('editor.file.open', [ owner, repoName, branch, path ]);
                    if( _.isFunction(done) ){
                        done();
                    }
                });

            }
        }.call());


        return editor;
    });
