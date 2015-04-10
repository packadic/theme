define([ 'jquery', 'config', 'theme', 'plugins/async', 'plugins/oauth-io', 'Github', 'Codepad', 'plugins/bootbox', 'storage',
         'plugins/mscrollbar' ],
    function( $, config, theme, async, OAuth, Github, Codepad, bootbox, storage ){

        OAuth.initialize(config.oauth_io);

        var api = {};
        var github = null;
        var editor = {
            $el        : null,
            defaults   : {
                codepadEditorId     : 'github-editor-codepad',
                contentsSelector    : '#github-editor-contents',
                branchesSelector    : '#github-editor-branches',
                repositoriesSelector: '#github-editor-repos'
            },
            currentFile: {},
            boxes: {}
        };

        function cre( el ){
            if( _.isUndefined(el) ){
                el = 'div';
            }
            return $(document.createElement(el));
        }

        console.log('storage', storage);
        //console.log('Github', Github);
        (function Editor(){

            editor.init = function( $el, options ){
                editor.options = _.merge(editor.defaults, options || {});
                editor.$el = $($el);

                editor.$contents = $(editor.options.contentsSelector);
                editor.$branches = $(editor.options.branchesSelector);
                editor.$repositories = $(editor.options.repositoriesSelector);

                if( api.isAuthorized() && !github ){
                    github = new Github({
                        token: api.request().access_token,
                        auth : 'oauth'
                    });

                    editor.github = github;
                }


                var codepad = window.codepad = editor.codepad = new Codepad(editor.options.codepadEditorId);

                // Close button
                codepad.addToolbarButton('close', 'Close', 'btn-warning').on('click', function( e ){
                    e.preventDefault();
                    codepad.hide();
                    editor.currentFile = {};
                    editor.$contents.removeAttr('style');
                    editor.$branches.removeAttr('style');
                    editor.$repositories.removeAttr('style');

                    editor.$repositories.append(editor.boxes.repos);
                })

                // Commit button
                codepad.addToolbarButton('commit', 'Commit/save', 'btn-success').on('click', function( e ){
                    e.preventDefault();
                    var content = codepad.aceEditor.session.getValue();
                    var repo = editor.github.getRepo(editor.currentFile.owner, editor.currentFile.repoName);
                    bootbox.prompt('Enter a commit message', function( message ){
                        if(message === false || typeof message !== 'string' ){
                            return;
                        }
                        repo.write(editor.currentFile.branch, editor.currentFile.path, content, message, function( err ){
                            theme.alert({message: 'File commited successfully.'})
                        })
                    })

                });
            };

            editor.getBox = function( name, data, cb ){
                theme.getTemplate('github-editor/' + name, function( template ){
                    editor.boxes[name] = $(template(data));
                    $('body').append(editor.boxes[name].hide());
                    $.mCustomScrollbar.defaults.theme = 'dark';
                    editor.boxes[name].find('.scrollable').addClass('mCustomScrollbar').mCustomScrollbar();
                    cb(editor.boxes[name]);
                });
            };


            editor.showFileEditor = function( repo, repoData, branch, path ){
                repo.read(branch, path, function( err, data ){

                    editor.currentFile.repoName = repoData.name;
                    editor.currentFile.owner = repoData.owner.login;
                    editor.currentFile.path = path;
                    editor.currentFile.branch = branch;

                    codepad.init(function(){
                        codepad.setValue(data);
                        codepad.setModeForPath(path);
                        console.log('path', path);
                        editor.$contents.hide();
                        editor.$branches.hide();
                        editor.$repositories.hide();
                        codepad.enableToolbar().show();
                        $('#github-editor-side-contents').append(editor.boxes.repos);
                    });


                });
            }

            editor.showContent = function( repo, repoData, branch, path ){
                path = path || '';
                var segments = path.split('/');
                var isRootPath = segments.length === 0;

                console.log('show content branch', branch, 'path', path);
                repo.contents(branch, path, function( err, files ){
                    console.log(files);

                    editor.getBox('contents', {files: files, repo: repoData, branch: branch}, function( box ){
                        box.find('a[data-name]').on('click', function( e ){
                            e.preventDefault();
                            var data = $(this).data();
                            if( data.type === 'dir' ){
                                editor.showContent(repo, repoData, branch, data.path);
                            } else {
                                editor.showFileEditor(repo, repoData, branch, data.path);
                            }
                        })
                        box.find('#github-editor-contents-path').html('').append(cre('i').text(path));
                        var up = box.find('#github-editor-contents-up');
                        up.off('click').on('click', function( e ){
                            e.preventDefault();
                            editor.showContent(repo, repoData, branch, isRootPath ? '' : segments[ segments.length - 2 ]);
                        });


                        $(editor.options.contentsSelector).html('').append(box.show());
                    })

                })
            }

            editor.showBranches = function( owner, repoName ){
                var repo = editor.github.getRepo(owner, repoName);
                async.parallel({
                    repo    : function( cb ){
                        repo.show(function( err, repoData ){
                            cb(null, repoData);
                        })
                    },
                    branches: function( cb ){
                        repo.listBranches(function( err, branches ){
                            cb(null, branches);
                        })
                    }
                }, function( err, result ){
                    editor.getBox('branches', result, function( box ){
                        console.log('branches result', result);
                        box.find('a[data-branch]').on('click', function( e ){
                            e.preventDefault();
                            editor.showContent(repo, result.repo, $(this).data('branch'));
                        });
                        editor.showContent(repo, result.repo, result.repo.default_branch);

                        $(editor.options.branchesSelector).html('').append(box.show());
                    })
                })
            }

            editor.showRepositories = function(){
                async.waterfall([
                    function( cb ){
                        editor.getAll(function( data ){
                            cb(null, data);
                        });
                    },
                    function( data, cb ){
                        editor.getBox('repos', {repos: [].concat.apply([], _.merge(_.values(data.repos)))}, function( table ){
                            cb(null, data, table);
                        });
                    },
                    function( data, table, cb ){
                        table.find('a[data-repo-name]').on('click', function( e ){
                            e.preventDefault();
                            var data = $(this).data();
                            editor.showBranches(data.owner, data.repoName);
                        });
                        $(editor.options.repositoriesSelector).html('').append(table.show());
                        cb();
                    }
                ])
            }

            editor.getAuthButton = function( $el ){

                if( !_.isUndefined(this.btnAuth) ){
                    return this.btnAuth;
                }
                var btnAuth = {$el: $el || cre('a').addClass('btn btn-sm blue-light hide').attr('id', 'github-auth').attr('href', '#').text('Login')};
                btnAuth.setLogin = function(){
                    btnAuth.$el.off('click').text('Login').on('click', function( e ){
                        e.preventDefault();
                        editor.api.authorize();
                        btnAuth.setLogout()
                    })
                };
                btnAuth.setLogout = function(){
                    btnAuth.$el.off('click').text('Logout').on('click', function( e ){
                        e.preventDefault();
                        editor.api.logout();
                        btnAuth.setLogin()
                    })
                };
                if( editor.api.isAuthorized() ){
                    btnAuth.setLogout()
                } else {
                    btnAuth.setLogin()
                }
                btnAuth.$el.removeClass('hide');
                return this.btnAuth = btnAuth;
            };

            editor.getAll = function( done ){
                async.waterfall([
                    // Get organisations
                    function( cb ){
                        data = {};
                        github.getUser().orgs(
                            /**
                             *
                             * @param err
                             * @param orgs
                             * @param {XMLHttpRequest} xhr
                             */
                            function( err, orgs, xhr ){

                                console.log('xhr', xhr);
                                data.orgs = orgs;
                                cb(null, data);
                            });
                    },

                    // Get repos for each organisation
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

                    // Get user repos
                    function( data, cb ){
                        github.getUser().repos(function( err, repos ){
                            data.repos.user = repos;
                            cb(null, data);
                        });
                    }
                ], function( err, results ){
                    console.log('all results', results);
                    done(results);
                })
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

                    window.location.href = window.location.href;

                }).fail(function( err ){
                    console.log(err);
                });
            };

            api.logout = function(){
                OAuth.clearCache('github');
                github = editor.github = null;
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
