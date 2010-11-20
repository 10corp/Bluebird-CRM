// generic JS fixes

// various JavaScript object.
var Blueprint = {};

// jump to the value in a select drop down
Blueprint.go = function(e) {
  var destination = e.options[e.selectedIndex].value;
  if (destination && destination != 0) location.href = destination;
};

// prevent users from clicking a submit button twice
Blueprint.formCheck = function() {
  // only apply this to node and comment and new user registration forms
  var forms = $("#node-form>div>div>#edit-submit,#comment-form>div>#edit-submit,#user-register>div>#edit-submit");

  // insert the saving div now to cache it for better performance and to show the loading image
  $('<div id="saving"><p class="saving">Saving&hellip;</p></div>').insertAfter(forms);

  forms.click(function() {
    $(this).siblings("input:submit").hide();
    $(this).hide();
    $("#saving").show();

    var notice = function() {
      $('<p id="saving-notice">Not saving? Wait a few seconds, reload this page, and try again. Every now and then the internet hiccups too :-)</p>').appendTo("#saving").fadeIn();
    };

    // append notice if form saving isn't work, perhaps a timeout issue
    setTimeout(notice, 24000);
  });
};

// Global Killswitch.
if (Drupal.jsEnabled) {
  $(document).ready(Blueprint.formCheck);
}



/* lame customTokenInput hack */
/*
 * jQuery Plugin: Tokenizing Autocomplete Text Entry
 * Version 1.1
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */

(function($) {

$.fn.customTokenInput = function (url, options) {
    var settings = $.extend({
        url: url,
        hintText: options.hintText,
        noResultsText: "No results",
        searchingText: "Searching...",
        searchDelay: 600,
        minChars: 2,
        tokenLimit: null,
        jsonContainer: null,
        method: "GET",
        contentType: "json",
        queryParam: "sort_name",
        ajaxCallbackFunction: null,
        onResult: null
    }, options);

    settings.classes = $.extend({
        tokenList: "token-input-list",
        token: "token-input-token",
        tokenDelete: "token-input-delete-token",
        selectedToken: "token-input-selected-token",
        highlightedToken: "token-input-highlighted-token",
        dropdown: "token-input-dropdown",
        dropdownItem: "token-input-dropdown-item",
        dropdownItem2: "token-input-dropdown-item2",
        selectedDropdownItem: "token-input-selected-dropdown-item",
        inputToken: "token-input-input-token"
    }, options.classes);

    return this.each(function () {
        var list = new $.customTokenList(this, settings);
    });
};

$.customTokenList = function (input, settings) {
    //
    // Variables
    //

    // Input box position "enum"
    var POSITION = {
        BEFORE: 0,
        AFTER: 1,
        END: 2
    };

    // Keys "enum"
    var KEY = {
        BACKSPACE: 8,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        COMMA: 188
    };

    // Save the tokens
    var saved_tokens = [];
    
    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout
    var timeout;

    // Create a new text input an attach keyup events
    var input_box = $("<input type=\"text\" class='custom-token-input-box'>")
        .css({
            outline: "none"
        })
        .focus(function () {
            if (settings.tokenLimit == null || settings.tokenLimit != token_count) {
                custom_show_dropdown_hint();
            }
        })
        .blur(function () {
            custom_hide_dropdown();
        })
        .keydown(function (event) {
            var previous_token;
            var next_token;

            switch(event.keyCode) {
                case KEY.LEFT:
                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    if(!$(this).val()) {
                        previous_token = input_token.prev();
                        next_token = input_token.next();

                        if((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                            // Check if there is a previous/next token and it is selected
                            if(event.keyCode == KEY.LEFT || event.keyCode == KEY.UP) {
                                deselect_token($(selected_token), POSITION.BEFORE);
                            } else {
                                deselect_token($(selected_token), POSITION.AFTER);
                            }
                        } else if((event.keyCode == KEY.LEFT || event.keyCode == KEY.UP) && previous_token.length) {
                            // We are moving left, select the previous token if it exists
                            select_token($(previous_token.get(0)));
                        } else if((event.keyCode == KEY.RIGHT || event.keyCode == KEY.DOWN) && next_token.length) {
                            // We are moving right, select the next token if it exists
                            select_token($(next_token.get(0)));
                        }
                    } else {
                        var dropdown_item = null;

                        if(event.keyCode == KEY.DOWN || event.keyCode == KEY.RIGHT) {
                            dropdown_item = $(selected_dropdown_item).next();
                        } else {
                            dropdown_item = $(selected_dropdown_item).prev();
                        }

                        if(dropdown_item.length) {
                            custom_select_dropdown_item(dropdown_item);
                        }
                        return false;
                    }
                    break;

                case KEY.BACKSPACE:
                    previous_token = input_token.prev();

                    if(!$(this).val().length) {
                        if(selected_token) {
                            custom_delete_token($(selected_token));
                        } else if(previous_token.length) {
                            select_token($(previous_token.get(0)));
                        }

                        return false;
                    } else if($(this).val().length == 1) {
                        custom_hide_dropdown();
                    } else {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){custom_do_search(false);}, 5);
                    }
                    break;

                case KEY.TAB:
                case KEY.RETURN:
                case KEY.COMMA:
                  if(selected_dropdown_item) {
                    add_token($(selected_dropdown_item));
                    return false;
                  }
                  break;

                case KEY.ESC:
                  custom_hide_dropdown();
                  return true;

                default:
                    if(is_printable_character(event.keyCode)) {
                      // set a timeout just long enough to let this function finish.
                      setTimeout(function(){custom_do_search(false);}, 5);
                    }
                    break;
            }
        });

    // Keep a reference to the original input box
    var hidden_input = $(input)
                           .hide()
                           .focus(function () {
                               input_box.focus();
                           })
                           .blur(function () {
                               input_box.blur();
                           });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $("<ul />")
        .addClass(settings.classes.tokenList)
        .insertAfter(hidden_input)
        .click(function (event) {
            var li = get_element_from_event(event, "li");
            if(li && li.get(0) != input_token.get(0)) {
                custom_toggle_select_token(li);
                return false;
            } else {
                input_box.focus();

                if(selected_token) {
                    deselect_token($(selected_token), POSITION.END);
                }
            }
        })
        .mouseover(function (event) {
            var li = get_element_from_event(event, "li");
            if(li && selected_token !== this) {
                li.addClass(settings.classes.highlightedToken);
            }
        })
        .mouseout(function (event) {
            var li = get_element_from_event(event, "li");
            if(li && selected_token !== this) {
                li.removeClass(settings.classes.highlightedToken);
            }
        })
        .mousedown(function (event) {
            // Stop user selecting text on tokens
            var li = get_element_from_event(event, "li");
            if(li){
                return false;
            }
        });


    // The list to store the dropdown items in
    var dropdown = $("<div>")
        .addClass(settings.classes.dropdown)
        .insertAfter(token_list)
        .hide();

    // The token holding the input box
    var input_token = $("<li />")
        .addClass(settings.classes.inputToken)
        .appendTo(token_list)
        .append(input_box);

    custom_init_list();

    //
    // Functions
    //


    // Pre-populate list if items exist
    function custom_init_list () {
        //reset tokens, before initialize.
        hidden_input.val('');
       
        li_data = settings.prePopulate;
        if(li_data && li_data.length) {
          for(var i in li_data) { 
              if ( li_data[i].contact_id ) {
                    var this_token = $("<li><p>"+li_data[i].sort_name+"</p> </li>")
                        .addClass(settings.classes.token)
                        .insertBefore(input_token);

                    $("<span>x</span>")
                        .addClass(settings.classes.tokenDelete)
                        .appendTo(this_token)
                        .click(function () {
                            custom_delete_token($(this).parent());
                            return false;
                        });

                    $.data(this_token.get(0), "tokeninput", {"contact_id": li_data[i].contact_id, "sort_name": li_data[i].sort_name});

                    // Clear input box and make sure it keeps focus
                    input_box
                        .val("")
                        .focus();

                    // Don't show the help dropdown, they've got the idea
                    custom_hide_dropdown();

                    // Save this token id
                    var id_string = li_data[i].contact_id;
                    
                    // IE fixes: Remove extra comma at the end
                    if ( hidden_input.val( ) ) {
                        id_string = ',' + id_string;    
                    }
                    
                    hidden_input.val(hidden_input.val() + id_string);
                }
            }
        }
    }

    function is_printable_character(keycode) {
        if((keycode >= 48 && keycode <= 90) ||      // 0-1a-z
           (keycode >= 96 && keycode <= 111) ||     // numpad 0-9 + - / * .
           (keycode >= 186 && keycode <= 192) ||    // ; = , - . / ^
           (keycode >= 219 && keycode <= 222)       // ( \ ) '
          ) {
              return true;
          } else {
              return false;
          }
    }

    // Get an element of a particular type from an event (click/mouseover etc)
    function get_element_from_event (event, element_type) {
        var target = $(event.target);
        var element = null;

        if(target.is(element_type)) {
            element = target;
        } else if(target.parent(element_type).length) {
            element = target.parent(element_type+":first");
        }

        return element;
    }

    // Inner function to a token to the list
    function insert_token(contact_id, value) {
      var this_token = $("<li><p>"+ value +"</p> </li>")
      .addClass(settings.classes.token)
      .insertBefore(input_token);

      // The 'delete token' button
      $("<span>x</span>")
          .addClass(settings.classes.tokenDelete)
          .appendTo(this_token)
          .click(function () {
              custom_delete_token($(this).parent());
              return false;
          });

      $.data(this_token.get(0), "tokeninput", {"contact_id": contact_id, "sort_name": value});

      return this_token;
    }

    // Add a token to the token list based on user input
    function add_token (item) {
        var li_data = $.data(item.get(0), "tokeninput");
        var this_token = insert_token(li_data.contact_id, li_data.sort_name);

        // Clear input box and make sure it keeps focus
        input_box
            .val("")
            .focus();

        // Don't show the help dropdown, they've got the idea
        custom_hide_dropdown();

        // Save this token id
        var id_string = li_data.contact_id;
        
        if ( settings.ajaxCallbackFunction !=  null ) {
            eval( settings.ajaxCallbackFunction + '( "select", id_string )')
        }

        // IE fixes: Remove extra comma at the end
        if ( hidden_input.val( ) ) {
		    id_string = ',' + id_string;    
		}
		
        hidden_input.val(hidden_input.val() + id_string);
        
        token_count++;
        
        if(settings.tokenLimit != null && settings.tokenLimit >= token_count) {
            input_box.hide();
            custom_hide_dropdown();
        }
    }

    // Select a token in the token list
    function select_token (token) {
        token.addClass(settings.classes.selectedToken);
        selected_token = token.get(0);

        // Hide input box
        input_box.val("");

        // Hide dropdown if it is visible (eg if we clicked to select token)
        custom_hide_dropdown();
    }

    // Deselect a token in the token list
    function deselect_token (token, position) {
        token.removeClass(settings.classes.selectedToken);
        selected_token = null;

        if(position == POSITION.BEFORE) {
            input_token.insertBefore(token);
        } else if(position == POSITION.AFTER) {
            input_token.insertAfter(token);
        } else {
            input_token.appendTo(token_list);
        }

        // Show the input box and give it focus again
        input_box.focus();
    }

    // Toggle selection of a token in the token list
    function custom_toggle_select_token (token) {
        if(selected_token == token.get(0)) {
            deselect_token(token, POSITION.END);
        } else {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.END);
            }
            select_token(token);
        }
    }

    // Delete a token from the token list
    function custom_delete_token (token) {
        // Remove the id from the saved list
        var token_data = $.data(token.get(0), "tokeninput");
        
        if ( settings.ajaxCallbackFunction !=  null ) {
            eval( settings.ajaxCallbackFunction + '( "delete", token_data.contact_id )')
        }

        // Delete the token
        token.remove();
        selected_token = null;

        // Show the input box and give it focus again
        input_box.focus();

        // Delete this token's id from hidden input
        var str = hidden_input.val()

        // var start = str.indexOf(token_data.id+",");
        // var end = str.indexOf(",", start) + 1;
        // 
        // if(end >= str.length) {
        //     hidden_input.val(str.slice(0, start));
        // } else {
        //     hidden_input.val(str.slice(0, start) + str.slice(end, str.length));
        // }
        
        // IE : Fixes to remove extra comma
        var resultantTokenStr = '';
    	// token string consist of multiple tokens.
    	if ( str.indexOf( ',' ) != -1 ) {
    	    var deleteTokenStr = ',' + token_data.contact_id;
    	    if ( str.indexOf( token_data.contact_id ) == 0 ) {
    		    deleteTokenStr =  token_data.contact_id + ',';
    	    }
    	    var start = str.indexOf( deleteTokenStr );
    	    var end   = start + deleteTokenStr.length;
    	    resultantTokenStr = str.slice( 0, start ) + str.slice( end, str.length );
    	}

    	hidden_input.val( resultantTokenStr );
    	
        token_count--;
        
        if (settings.tokenLimit != null) {
            input_box
                .show()
                .val("")
                .focus();
        }
    }

    // Hide and clear the results dropdown
    function custom_hide_dropdown () {
//         dropdown.hide().empty();
//         selected_dropdown_item = null;

      //here we need to sleep, fix for IE, CRM-6012 
      setTimeout(function( ) { 
	  dropdown.hide().empty(); 
	  selected_dropdown_item = null; 
	}, 300 );
    }

    function custom_show_dropdown_searching () {
        dropdown
            .html("<p>"+settings.searchingText+"</p>")
            .show();
    }

    function custom_show_dropdown_hint () {
        dropdown
            .html("<p>"+settings.hintText+"</p>")
            .show();
    }

    // Highlight the query part of the search term
	function custom_highlight_term(value, term) {
		return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
	}

    // Populate the results dropdown with some results
    function custom_populate_dropdown (query, results) {
        if(results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    custom_select_dropdown_item(get_element_from_event(event, "li"));
                })
                .click(function (event) {
                    add_token(get_element_from_event(event, "li"));
                })
                .mousedown(function (event) {
                    // Stop user selecting text on tokens
                    return false;
                })
                .hide();

            for(var i in results) {
                if (results.hasOwnProperty(i)) {
                    var this_li = $("<li>"+custom_highlight_term(results[i].sort_name, query)+"</li>")
                                      .appendTo(dropdown_ul);

                    if(i%2) {
                        this_li.addClass(settings.classes.dropdownItem);
                    } else {
                        this_li.addClass(settings.classes.dropdownItem2);
                    }

                    if(i == 0) {
                        custom_select_dropdown_item(this_li);
                    }

                    $.data(this_li.get(0), "tokeninput", {"contact_id": results[i].contact_id, "sort_name": results[i].sort_name});
                }
            }

            dropdown.show();
            dropdown_ul.slideDown("fast");

        } else {
            dropdown
                .html("<p>"+settings.noResultsText+"</p>")
                .show();
        }
    }

    // Highlight an item in the results dropdown
    function custom_select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                decustom_select_dropdown_item($(selected_dropdown_item));
            }

            item.addClass(settings.classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function decustom_select_dropdown_item (item) {
        item.removeClass(settings.classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than settings.minChars
    function custom_do_search(immediate) {
        var query = input_box.val().toLowerCase();

        if (query && query.length) {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.AFTER);
            }
            if (query.length >= settings.minChars) {
                custom_show_dropdown_searching();
                if (immediate) {
                    custom_run_search(query);
                } else {
                    clearTimeout(timeout);
                    timeout = setTimeout(function(){custom_run_search(query);}, settings.searchDelay);
                }
            } else {
                custom_hide_dropdown();
            }
        }
    }

    // Do the actual search
    function custom_run_search(query) {
        var cached_results = cache.get(query);
        if(cached_results) {
            custom_populate_dropdown(query, cached_results);
        } else {
			var queryStringDelimiter = settings.url.indexOf("?") < 0 ? "?" : "&";
			var callback = function(results) {
			  if($.isFunction(settings.onResult)) {
			      results = settings.onResult.call(this, results);
			  }
              cache.add(query, settings.jsonContainer ? results[settings.jsonContainer] : results);
              custom_populate_dropdown(query, settings.jsonContainer ? results[settings.jsonContainer] : results);
            };
            
            if(settings.method == "POST") {
			    $.post(settings.url + queryStringDelimiter + settings.queryParam + "=" + query, {}, callback, settings.contentType);
		    } else {
		        $.get(settings.url + queryStringDelimiter + settings.queryParam + "=" + query, {}, callback, settings.contentType);
		    }
        }
    }
};

// Really basic cache for the results
$.TokenList.Cache = function (options) {
    var settings = $.extend({
        max_size: 50
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size++;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};

})(jQuery);


