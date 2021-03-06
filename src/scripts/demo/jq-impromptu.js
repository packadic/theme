define([ 'jquery',  'plugins/impromptu' ],
    function( $ ){
        'use strict';

        var temp = {
            state0: {
                title: 'Content Rating',
                html:'<label class="radio" for="rate_content_poor"><input type="radio" name="rate_content" id="rate_content_poor" value="Poor" class="radioinput" />Poor</label>'+
                       '<label class="radio" for="rate_content_ok"><input type="radio" name="rate_content" id="rate_content_ok" value="Ok" class="radioinput" />Ok</label>'+
                       '<label class="radio" for="rate_content_good"><input type="radio" name="rate_content" id="rate_content_good" value="Good" class="radioinput" />Good</label>'+
                       '<label class="radio" for="rate_content_excellent"><input type="radio" name="rate_content" id="rate_content_excellent" value="Excellent" class="radioinput" />Excellent!</label>',
                buttons: { Cancel: false, Next: true },
                focus: 1,
                submit:function(e,v,m,f){
                    if(!v)
                        $.prompt.close()
                    else $.prompt.goToState('state1');//go forward
                    return false;
                }
            },
            state1: {
                title: 'Needs Improvement',
                html:'<p>Check all which need improvement:</p>'+
                       '<label class="checkbox" for="rate_improve_colors"><input type="checkbox" name="rate_improve" id="rate_improve_colors" value="Color Scheme" class="radioinput" />Color Scheme</label>'+
                       '<label class="checkbox" for="rate_improve_graphics"><input type="checkbox" name="rate_improve" id="rate_improve_graphics" value="Graphics" class="radioinput" />Graphics</label>'+
                       '<label class="checkbox" for="rate_improve_readability"><input type="checkbox" name="rate_improve" id="rate_improve_readability" value="readability" class="radioinput" />Readability</label>'+
                       '<label class="checkbox" for="rate_improve_content"><input type="checkbox" name="rate_improve" id="rate_improve_content" value="Content" class="radioinput" />Content</label>'+
                       '<label class="checkbox" for="rate_improve_other"><input type="checkbox" name="rate_improve" id="rate_improve_other" value="Other" class="radioinput" />Other</label>'+
                       '<input type="text" name="rate_improve_other_txt" id="rate_improve_other_txt" value="" placeholder="Other Description" />',
                buttons: { Back: -1, Cancel: 0, Next: 1 },
                focus: 2,
                submit:function(e,v,m,f){
                    if(v==0)
                        $.prompt.close()
                    else if(v==1)
                        $.prompt.goToState('state2');//go forward
                    else if(v=-1)
                        $.prompt.goToState('state0');//go back
                    return false;
                }
            },
            state2: {
                title: 'How did you find this site?',
                html:'<select name="rate_find" id="rate_find"><option value="Search">Search</option><option value="Online Publication">Online Publication</option><option value="friend">A Friend</option><option value="No Clue">No Clue</option></select>',
                buttons: { Back: -1, Cancel: 0, Next: 1 },
                focus: 2,
                submit: function(e, v, m, f){
                    if (v == 0)
                        $.prompt.close()
                    else
                    if (v == 1)
                        $.prompt.goToState('state3');//go forward
                    else
                    if (v = -1)
                        $.prompt.goToState('state1');//go back
                    return false;
                }
            },
            state3: {
                title: 'Additional Comments',
                html:'<p>Please leave any other comments you have about this site:</p><div class="field"><textarea id="rate_comments" name="rate_comments"></textarea></div>',
                buttons: { Back: -1, Cancel: 0, Finish: 1 },
                focus: 2,
                submit:function(e,v,m,f){
                    if(v==0)
                        $.prompt.close()
                    else if(v==1)
                        return true; //we're done
                    else if(v=-1)
                        $.prompt.goToState('state2');//go back
                    return false;
                }
            }
        }

        return function($els){
            $els.on('click', function(e){
                e.preventDefault();
                $.prompt(temp,{
                    close: function(e,v,m,f){
                        if(v !== undefined){
                            var str = "You can now process with this given information:<br />";
                            $.each(f,function(i,obj){
                                str += i + " - <em>" + obj + "</em><br />";
                            });
                            $('#results').html(str);
                        }
                    },
                    classes: {
                        box: '',
                        fade: '',
                        prompt: '',
                        close: '',
                        title: 'lead',
                        message: '',
                        buttons: '',
                        button: 'btn',
                        defaultButton: 'btn-primary'
                    }
                });
            });
        };
    });
