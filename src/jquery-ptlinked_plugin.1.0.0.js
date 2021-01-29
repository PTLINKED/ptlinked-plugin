 /**
 * PTLINKED Plugin - Exercise Program Library
 * Customer: MDVIP
 * Version: 1.0.0
 * Author: Mike Frank (PTLINKED, LLC.) - mfrank@ptlinked.com
 * 
 * Table of Contents
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 *  1.0 CATEGORY SLIDER METHODS
 *       1.1 Load Category Items in Sliderbar / Mobile Menu
 *       1.2 Render Category Items
 *       1.3 Set a Page Request Value
 *       1.4 Clear Category Slider Html
 *       1.5 Initialize Category Slider Mechanics
 *  2.0 FILTER DROP DOWN METHODS
 *       2.1 Initialize the Filter Drop Down Block
 *       2.2 Initialize Clear Filters Handlers
 *       2.3 Clear the Filter DOM Containers
 *       2.4 Clear all Selected Filters
 *       2.5 Clear all filters and search click handler
 *       2.6 Clear Filter Click Handler
 *       2.7 Load the Filters
 *       2.8 Render the Filter Components
 *       2.9 Refresh the Conditions drop down filter
 *       2.10 Set the filters based on the loaded criteria
 *  3.0 SEARCH / SEARCH BAR METHODS
 *       3.1 Initialize the textual search bar
 *       3.2 Request Exercise Programs
 *       3.3 Request Search Results from API End-Point
 *       3.4 Render the returned exercise programs
 *       3.5 Open selected exercise program
 *       3.6 Process the Load More
 *  4.0 EXERCISE VIEWER METHODS
 *       4.1 Clear/Reset Viewer
 *       4.2 Load Exercise Program
 *       4.3 Render the exercise Program
 *       4.4 Initialize the thumbnail bar
 *       4.5 Initialize video source
 *       4.6 Vide Player Click Handler
 *       4.7 Thumbnail Anchor handler
 *       4.8 Initialize the Hor. scroll mechanices
 *       4.9 Initialize the Viewer Toolbar
 *  5.0 RENDER METHODS
 *       5.1 Render the plugin sections
 *       5.2 Build mobile search panel HTML
 *       5.3 Build Category Slider HTML
 *       5.4 Build Filter/Search Bar and Drop Downs HTML
 *       5.5 Build the plugin containers
 *       5.6 Build the mobile filter menu
 *       5.7 Build the Exercise Program Viewer Container
 *  6.0 UTILITY METHODS
 *       6.1 Toggle the mobile filter menu
 *       6.2 Calculate the Exercise Program Card Placeholders
 *       6.3 Toggle the info box
 *       6.4 Initialize the content scroll monitor
 *       6.5 Get Bootstrap Device Size
 *       6.6 Load Page Request Parameters
 *       6.7 Register the user/plugin with the API
 *       6.8 Process URL Query Variables
 */

;(function($) {

  	var pluginName = 'ptlinkedLibrary';
 
    /**
    * Plugin object constructor.
    * Implements the Revealing Module Pattern.
    */
	function Plugin(element, options) {
		// References to DOM and jQuery versions of element.
		var el = element;
		var $el = $(element);

		// Extend default options with those supplied by user.
		options = $.extend({}, $.fn[pluginName].defaults, options);

		var selected_category_filter = 0 ;     // Selected category Filter
        var __page_request_values = {} ;       // Page URL Parameters Array
        var __page_request_query_values = {} ;
        var __use_url_to_load = false ;        // Flag to use URL loading of search and filters *** REMOVE ***
        var __append_results = false ;         // Flag to either append results from server to the result list, or clear and display result list
        var __scroll_more = true ;             // Flag that toggles the scroll more mechanics
        var __save_state_cookie = true ;       // Flag to save the search state (filters, category, query) in a cookie
        var __processing = false ;             // Flag that ensures not multiple service calls will be made at the same time
        var __use_vanity_url = true ;          // Vanity URL Flag *** NEED TO REMOVE ***
        var current_index = 0 ;                // Current page index
        var record_chunks = 25 ;               // Number of records to return
        var __exercise_program_id = 0 ;        // Currently selected exercise program id to display in viewer

        var __error_detected = false ;
		


// **********************************************************************************
// 1.0 CATEGORY SLIDER METHODS
// **********************************************************************************		

		// 1.1 Load Category Items in Sliderbar / Mobile Menu
		function loadCategories( ) {			
            var url = options["api_root_url"] + "/predesigned/bodyregions/html" ; 
            var s = getBootstrapDeviceSize( );
            if( s == "xs" || s == "sm" || s == "md" ) {
                url = options["api_root_url"] + "/predesigned/bodyregions/html2" ; 
            }
            $.ajax({
                type: "GET",                                                
                url: url,
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] },                                
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Load Categories AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "CAT" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {                      
                    var s = getBootstrapDeviceSize( ) ;
                    if( s == "xs" || s == "sm" || s == "md" ) {                                 
                        var mbodyregion = $("#predesigned_filters--bodyregion-mobile") ;                                
                        $.each( data, function( index, value ) {                    
                            mbodyregion.append( value ) ;
                        });                        
                        mbodyregion.select2( ) ;
                        $("#predesigned_filters--sortby-mobile").select2( ) ;

                        mbodyregion.on('select2:select', function(e){
                            var oid = $("#predesigned_filters--bodyregion-mobile").val( ) ;       
                            var custom_cat = $("#predesigned_filters--bodyregion-mobile").find( ":selected" ).data( "customcat" ) ;        
                            if( custom_cat > 0 ) {
                                oid = oid.replace( "c-", "" ) ;
                            }
                            var cur_c = __page_request_values["c"] ;
                            var cur_c1 = __page_request_values["c1"] ;
                            var cur_f1 = __page_request_values["f1"] ;
                            var cur_f4 = __page_request_values["f4"] ;                                                                
                            if( cur_c != oid || cur_c1 != custom_cat ) {  
                                setPageRequestValue( "c", oid ) ;    
                                setPageRequestValue( "c1", custom_cat ) ; 
                                current_index = 0 ;
                                requestPrograms( ) ;                                                            
                                if( $(".mobile-filter-panel").hasClass( "opened" ) ) {
                                    $(".mobile-filter-panel").removeClass( "opened" ) ;
                                }                                
                                var clear = mbodyregion.parent( ).parent().find( ".mobile-filter--clear" ) ;
                                if( oid == 0 ) {
                                    if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                                } else {                                
                                    if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                                }
                            }                            
                        });
                    } else {                              
                        renderCategories( data ) ;
                    }
                }        
            });
		}

		// 1.2 Render Category Items
		function renderCategories( html ) {
			var category_filter_container = $("ul.category-bubbles-list") ;            
            $.each( html, function( index, value ) {
                category_filter_container.append( value ) ;
            });
            var selected_item = category_filter_container.find( "li[data-oid=" + selected_category_filter + "]" ) ;
            if( !selected_item.hasClass( "active-filter" ) ) {
                selected_item.addClass( "active-filter" ) ;
            }            
            initCategoryScrollMechanics( ) ; // Initialize the Scroll Mechanics
            $("ul.category-bubbles-list li").unbind( "click" ).on( "click", function(){
                var oid = $(this).data( "oid" ) ;                
                var custom_cat = $(this).data( "customcat" ) ;
                var cur_c = __page_request_values["c"] ;
                var cur_c1 = __page_request_values["c1"] ;
                var cur_f1 = __page_request_values["f1"] ;
                var cur_f4 = __page_request_values["f4"] ;                            
            	if( cur_c != oid || cur_c1 != custom_cat ) {
            		setPageRequestValue( "c", oid ) ;    
                    setPageRequestValue( "c1", custom_cat ) ;    
            		if( cur_f4 > 0 ) { setPageRequestValue( "f4", 0 ) ; }
            		if( cur_f1 > 0 ) { setPageRequestValue( "f1", 0 ) ; }
            		$("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                    $("#predesigned_filters--types li").removeClass( "selected" ) ;
                    current_index = 0 ;
                    requestPrograms( ) ;
                    $("ul.category-bubbles-list li").removeClass( "active-filter" ) ;
                    $(this).addClass( "active-filter" ) ;
            	}
            });
		}

		// 1.3 Set a Page Request Value
		function setPageRequestValue( key,value ) {
			__page_request_values[key] = value ;
		}

		// 1.4 Clear Category Slider Html
		function clearCategories( ) {
			$("ul.category-bubbles-list").html( "" ) ;
		}

		// 1.5 Initialize Category Slider Mechanics
		function initCategoryScrollMechanics( ) {
            var _root = $(".scroll-container") ;
			var scrollIncrement = 400 ;
            var scrollContainer = $(_root).find( "ul.category-bubbles-list" ) ;
            var leftScrollArrow = $(".scroll-container").find( ".left-arrow" ) ;
            var rightScrollArrow = $(".scroll-container").find( ".right-arrow" ) ;
            var scrollPosition = scrollContainer.scrollLeft( ) ;
            var totalScrollWidth = scrollContainer.get(0).scrollWidth ;
            var farRightOffset = 0 ;

            $(rightScrollArrow).click(function() {
                event.preventDefault();
                scrollContainer.animate({
                    scrollLeft: "+="+scrollIncrement+"px"
                }, "slow", function(){
                    // Animation Complete
                    var scrollPosition = scrollContainer.scrollLeft( ) ;
                    var totalScrollWidth = scrollContainer.get(0).scrollWidth ;                 
                    if( scrollPosition > 0 ) {
                        if( !$(leftScrollArrow).hasClass( "show-arrow" ) ) {
                            $(leftScrollArrow).addClass( "show-arrow" ) ;
                        }
                        if( scrollPosition % scrollIncrement > 0 ) {
                            if( $(rightScrollArrow).hasClass( "show-arrow" ) ) {
                                $(rightScrollArrow).removeClass( "show-arrow" ) ;
                            }   
                            farRightOffset = scrollPosition % scrollIncrement ;
                        }
                    }
                });
            });

            $(leftScrollArrow).click(function() {
                event.preventDefault();
                scrollContainer.animate({
                    scrollLeft: "-="+( scrollIncrement + farRightOffset )+"px"
                }, "slow", function(){
                    // Animation Complete
                    farRightOffset = 0 ;
                    var scrollPosition = scrollContainer.scrollLeft( ) ;
                    var totalScrollWidth = scrollContainer.get(0).scrollWidth ;                     
                    if( scrollPosition <= 0 ) {
                        if( $(leftScrollArrow).hasClass( "show-arrow" ) ) {
                            $(leftScrollArrow).removeClass( "show-arrow" ) ;
                        }
                        if( !$(rightScrollArrow).hasClass( "show-arrow" ) ) {
                            $(rightScrollArrow).addClass( "show-arrow" ) ;
                        }   
                    } else if( scrollPosition < (totalScrollWidth - scrollIncrement ) ) {
                        if( !$(rightScrollArrow).hasClass( "show-arrow" ) ) {
                            $(rightScrollArrow).addClass( "show-arrow" ) ;
                        }
                    }
                });
            });
		}

// **********************************************************************************
// 2.0 FILTER DROP DOWN METHODS
// **********************************************************************************

        // 2.1 Initialize the Filter Drop Down Block
        function initFilterDropDown( ) {
            $(".card--grid_filter").unbind( "click" ).on( "click", function(){
                var $gf = $("#grid-filter") ;
                if( $gf.hasClass( "open" ) ) {
                    $gf.removeClass( "open" ) ;
                } else {
                    $gf.addClass( "open" ) ;
                }
            }); 
        }

        // 2.2 Initialize Clear Filters Handlers
        function initClearFilters( ) {
            var require_clear_all = false ;
            var require_clear_all_mobile = false ;
            var _is_mobile = false ;
            if( $(".mobile-filter-panel").css( "display" ) != "none" ) {
                _is_mobile = true ;
            }

            if( ( typeof __page_request_values["f1"] !== 'undefined' ) && __page_request_values["f1"] > 0 ) {
                require_clear_all = true ;
            }
            if( ( typeof __page_request_values["f2"] !== 'undefined' ) && __page_request_values["f2"] > 0 ) {
                require_clear_all = true ;
            }
            if( ( typeof __page_request_values["f3"] !== 'undefined' ) && __page_request_values["f3"] > 0 ) {
                require_clear_all = true ;
            }
            if( ( typeof __page_request_values["f4"] !== 'undefined' ) && __page_request_values["f4"] > 0 ) {
                require_clear_all = true ;
            }
            if( ( typeof __page_request_values["f5"] !== 'undefined' ) && __page_request_values["f5"] > 0 ) {
                require_clear_all = true ;
            }            
            if( _is_mobile ) {
                if( ( typeof __page_request_values["c"] !== 'undefined' ) && __page_request_values["c"] > 0 ) {         
                        require_clear_all = true ;      
                }
                if( ( typeof __page_request_values["c1"] !== 'undefined' ) && __page_request_values["c1"] > 0 ) {         
                        require_clear_all = true ;      
                }
            }    

            var $grid_filter_clear = $(".card--grid_filter_clear") ;        
            var $m_grid_filter_clear = $(".mobile--grid_filter_clear") ;

            if( require_clear_all ) {
                if( !$grid_filter_clear.hasClass( "active" ) ) {
                    $grid_filter_clear.addClass( "active" ) ;
                }
                $grid_filter_clear.unbind( "click" ).on( "click", clearAllFilters ) ;

                if( !$m_grid_filter_clear.hasClass( "active" ) ) {
                    $m_grid_filter_clear.addClass( "active" ) ;
                }
                $m_grid_filter_clear.unbind( "click" ).on( "click", clearAllFilters ) ;                
                if( !$("#ptl-mobile_filter_button").hasClass( "active" ) ) {
                    $("#ptl-mobile_filter_button").addClass( "active" ) ;
                }       
            } else {
                if( $grid_filter_clear.hasClass( "active" ) ) {
                    $grid_filter_clear.removeClass( "active" ) ;
                }
                $grid_filter_clear.unbind( "click" ) ;

                if( $m_grid_filter_clear.hasClass( "active" ) ) {
                    $m_grid_filter_clear.removeClass( "active" ) ;
                }
                $m_grid_filter_clear.unbind( "click" ) ;
                if( $("#ptl-mobile_filter_button").hasClass( "active" ) ) {
                    $("#ptl-mobile_filter_button").removeClass( "active" ) ;
                }
            }
        }

        // 2.3 Clear the Filter DOM Containers
        function clearFilters( ) {
            $("#predesigned_filters--types").html( "" ) ;
            $("#predesigned_filters--difficulty").html( "" ) ;
            $("#predesigned_filters--duration").html( "" ) ;
        }

        // 2.4 Clear all Selected Filters
        function clearAllFilters( e ) {
            if( $(".navbar-mobile--search_panel").css( "display" ) != "none" ) {
                __page_request_values["c"] = 0 ;    
                __page_request_values["c1"] = 0 ;    

            }
            __page_request_values["f1"] = 0 ;
            __page_request_values["f2"] = 0 ;
            __page_request_values["f3"] = 0 ;
            __page_request_values["f4"] = 0 ;
            __page_request_values["f5"] = 0 ;
            current_index = 0 ;            
            setFilters( ) ;
            requestPrograms( ) ;
        }

        // 2.5 Clear all filters and search click handler
        function clearAllSearchState( e ) {
        	predesigned_controller.clear_category_filters( ) ;
			predesigned_controller.clear_filters( ) ;
			predesigned_controller.load_body_regions( ) ;	
			predesigned_controller.load_filters( ) ;	
			$("#header-search").val( "" ) ;
			$("#mheader-search").val( "" ) ;
			if( $(".header-search-bar-clear").hasClass( "active" ) ) {
				$(".header-search-bar-clear").removeClass( "active" ) ;
			}
			if( $(".card--grid_filter_clear").hasClass( "active" ) ) {
				$(".card--grid_filter_clear").removeClass( "active" ) ;
			}
			if( $(".ptl-mobile_search_button").hasClass( "active" ) ) {
				$(".ptl-mobile_search_button").removeClass( "active" ) ;
			}
			if( $(".mheader-search-bar-clear").hasClass( "active" ) ) {
				$(".mheader-search-bar-clear").removeClass( "active" ) ;
			}
			$(".card--grid_filter_clear").unbind( "click" ) ;
			// Reset all page request flags
			__page_request_values["c"] = 0 ;	// Selected Category
            __page_request_values["c1"] = 0 ;   // Is custom category 
			__page_request_values["v"] = "" ;	// Search String
			__page_request_values["f1"] = 0 ;	// Type Filter
			__page_request_values["f2"] = 0 ;	// Difficulty Filter
			__page_request_values["f3"] = 0 ;	// Duration Filter
			__page_request_values["f4"] = 0 ;	// Condition Filter
			__page_request_values["f5"] = 0 ;	// Equipment Filter	
			//Cookies.remove('ptlinkedQueryState');
			Cookies.remove('ptlinkedQueryState', { path: '/', domain: '.ptlinked.com', secure: true } ) ;
			predesigned_controller.set_filters( ) ;
			predesigned_controller.route_query( ) ;	
        }

        // 2.6 Clear Filter Click Handler
        function handleClearFilter( e ) {
            var drop_down_id = $(this).parent( ).find( "select" ).attr( "id" ) ;
            var param_f = $(this).parent( ).find( ".mobile-filter--value").data( "f" ) ;                        

            $("#" + drop_down_id).val( 0 ).trigger( "change" ) ;
            if( $(this).hasClass( "active" ) ) {
                $(this).removeClass( "active" ) ;
            }   
            __page_request_values[param_f] = 0 ;    
            if( param_f == 'c' ) {
                __page_request_values['c1'] = 0 ;    
            }

            if( drop_down_id == "predesigned_filters--conditions-mobile" ) {
                $("#predesigned_filters--types-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--types-mobile").parent().parent().find(".mobile-filter--clear").hasClass( "active" ) ) {
                    $("#predesigned_filters--types-mobile").parent().parent().find(".mobile-filter--clear").removeClass( "active" ) ;
                }   
                __page_request_values["f1"] = 0 ;
            } else if( drop_down_id == "predesigned_filters--types-mobile" ) {
                $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--conditions-mobile").parent().parent().find(".mobile-filter--clear").hasClass( "active" ) ) {
                    $("#predesigned_filters--conditions-mobile").parent().parent().find(".mobile-filter--clear").removeClass( "active" ) ;
                }   
                __page_request_values["f4"] = 0 ;
            }
            current_index = 0 ;            
            if( $(".mobile-filter-panel").hasClass( "opened" ) ) {
                $(".mobile-filter-panel").removeClass( "opened" ) ;
            }
            requestPrograms( ) ;
        }

        // 2.7 Load the Filters
        function loadFilters( ) {            
            var url = options["api_root_url"] + "/predesigned/filters/html" ; 
            var s = getBootstrapDeviceSize( );
            if( s == "xs" || s == "sm" || s == "md" ) {
                url = options["api_root_url"] + "/predesigned/filters/html2" ; 
            }
            $.ajax({
                type: "GET",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,                
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Load Filters AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "FIL" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {     
                    renderFilters( data ) ;                         
                }        
            });
        }

        // 2.8 Render the Filter Components
        function renderFilters( html ) {
            // Types
            var types = $("#predesigned_filters--types") ;                    
            var mtypes = $("#predesigned_filters--types-mobile") ;
            var $grid_filter = $("#grid-filter") ;
            var $mobile_filter_menu = $(".mobile-filter-panel") ;
            types.html( "" ) ;
            mtypes.html( "<option selected value='0'>Filter by type...</option>" ) ;
            $.each( html["types"], function( index, value ) {
                types.append( value ) ;
                mtypes.append( value ) ;
            });
            var $types_li = $("#predesigned_filters--types li") ;
            mtypes.select2( ) ; // Mobile Filter Drop Down            
            $types_li.unbind( "click" ).on( "click", function(){
                var oid = $(this).data( "oid" ) ;
                console.log( "Type Clicked" ) ;
                if( typeof __page_request_values["f1"] !== "undefined" ) {
                    if( __page_request_values["f1"] != oid ) {
                        __page_request_values["f1"] = oid ;             
                        $types_li.removeClass( "selected" ) ;
                        $(this).addClass( "selected" ) ;
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    } else {                
                        if( __page_request_values["f1"] == 1 ) {
                            $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                            __page_request_values["f4"] = 0 ;                   
                        }
                        __page_request_values["f1"] = 0 ;                               
                        $types_li.removeClass( "selected" ) ;             
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }
                } else {
                    __page_request_values["f1"] = oid ;         
                    $types_li.removeClass( "selected" ) ;
                    $(this).addClass( "selected" ) ;
                    if( $grid_filter.hasClass( "open" ) ) {
                        $grid_filter.removeClass( "open" ) ;
                    }
                    current_index = 0 ;
                    requestPrograms( ) ;
                }                   
            });

            mtypes.on('select2:select', function(e){
                var oid = $("#predesigned_filters--types-mobile").val( ) ;      
                if( typeof __page_request_values["f1"] !== "undefined" ) {
                    if( __page_request_values["f1"] != oid ) {
                        __page_request_values["f1"] = oid ;                             
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mtypes.parent( ).parent().find( ".mobile-filter--clear" ) ;             
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }               
                    } else {                
                        if( __page_request_values["f1"] == 1 ) {
                            $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                            __page_request_values["f4"] = 0 ;                   
                        }
                        __page_request_values["f1"] = 0 ;                                               
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mtypes.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }
                    }
                } else {
                    __page_request_values["f1"] = oid ;                     
                    current_index = 0 ;
                    requestPrograms( ) ;
                    // Close Filter Menu
                    if( $mobile_filter_menu.hasClass( "opened" ) ) {
                        $mobile_filter_menu.removeClass( "opened" ) ;
                    }
                    // Clear button
                    var clear = mtypes.parent( ).parent().find( ".mobile-filter--clear" ) ;
                    if( oid == 0 ) {
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                    } else {                                
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    }
                    
                }               
            });

            // Difficulty
            var difficulty = $("#predesigned_filters--difficulty") ;
            var mdifficulty = $("#predesigned_filters--difficulty-mobile") ;                        
            difficulty.html( "" ) ;
            mdifficulty.html( "<option selected value='0'>Filter by difficulty...</option>" ) ;
            $.each( html["difficulty"], function( index, value ) {
                difficulty.append( value ) ;
                mdifficulty.append( value ) ;
            });
            var $difficulty_li = $("#predesigned_filters--difficulty li") ;
            mdifficulty.select2( ) ;
            $difficulty_li.unbind( "click" ).on( "click", function(){
                var oid = $(this).data( "oid" ) ;
                if( typeof __page_request_values["f2"] !== "undefined" ) {
                    if( __page_request_values["f2"] != oid ) {
                        __page_request_values["f2"] = oid ;             
                        $difficulty_li.removeClass( "selected" ) ;
                        $(this).addClass( "selected" ) ;
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }  else {
                        __page_request_values["f2"] = 0 ;               
                        $difficulty_li.removeClass( "selected" ) ;                
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }
                } else {
                    __page_request_values["f2"] = oid ;         
                    $difficulty_li.removeClass( "selected" ) ;
                    $(this).addClass( "selected" ) ;
                    if( $grid_filter.hasClass( "open" ) ) {
                        $grid_filter.removeClass( "open" ) ;
                    }
                    current_index = 0 ;
                    requestPrograms( ) ;
                }           
            });

            mdifficulty.on('select2:select', function(e){
                var oid = $("#predesigned_filters--difficulty-mobile").val( ) ;     
                if( typeof __page_request_values["f2"] !== "undefined" ) {
                    if( __page_request_values["f2"] != oid ) {
                        __page_request_values["f2"] = oid ;                             
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mdifficulty.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }               
                    } else {                                
                        __page_request_values["f2"] = 0 ;                                               
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mdifficulty.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }               
                    }
                } else {
                    __page_request_values["f2"] = oid ;                     
                    current_index = 0 ;
                    requestPrograms( ) ;
                    // Close Filter Menu
                    if( $mobile_filter_menu.hasClass( "opened" ) ) {
                        $mobile_filter_menu.removeClass( "opened" ) ;
                    }
                    // Clear button
                    var clear = mdifficulty.parent( ).parent().find( ".mobile-filter--clear" ) ;
                    if( oid == 0 ) {
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                    } else {                                
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    }
                }               
            });

            // Duration
            var duration = $("#predesigned_filters--duration") ;
            var mduration = $("#predesigned_filters--duration-mobile") ;            
            duration.html( "" ) ;
            mduration.html( "<option selected value='0'>Filter by duration...</option>" ) ;
            $.each( html["duration"], function( index, value ) {
                duration.append( value ) ;
                mduration.append( value ) ;
            });
            var $duration_li = $("#predesigned_filters--duration li") ;
            mduration.select2( ) ;
            $duration_li.unbind( "click" ).on( "click", function(){
                var oid = $(this).data( "oid" ) ;
                if( typeof __page_request_values["f3"] !== "undefined" ) {
                    if( __page_request_values["f3"] != oid ) {
                        __page_request_values["f3"] = oid ;             
                        $duration_li.removeClass( "selected" ) ;
                        $(this).addClass( "selected" ) ;
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }  else {
                        __page_request_values["f3"] = 0 ;               
                        $duration_li.removeClass( "selected" ) ;              
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }
                } else {
                    __page_request_values["f3"] = oid ;         
                    $duration_li.removeClass( "selected" ) ;
                    $(this).addClass( "selected" ) ;
                    if( $grid_filter.hasClass( "open" ) ) {
                        $grid_filter.removeClass( "open" ) ;
                    }
                    current_index = 0 ;
                    requestPrograms( ) ;
                }           
            });

            mduration.on('select2:select', function(e){
                var oid = $("#predesigned_filters--duration-mobile").val( ) ;       
                if( typeof __page_request_values["f3"] !== "undefined" ) {
                    if( __page_request_values["f3"] != oid ) {
                        __page_request_values["f3"] = oid ; 
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mduration.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }               
                    } else {                                
                        __page_request_values["f3"] = 0 ;                                               
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mduration.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }               
                    }
                } else {
                    __page_request_values["f3"] = oid ;                     
                    current_index = 0 ;
                    requestPrograms( ) ;
                    // Close Filter Menu
                    if( $mobile_filter_menu.hasClass( "opened" ) ) {
                        $mobile_filter_menu.removeClass( "opened" ) ;
                    }
                    // Clear button
                    var clear = mduration.parent( ).parent().find( ".mobile-filter--clear" ) ;
                    if( oid == 0 ) {
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                    } else {                                
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    }
                }               
            });

            // Equipment
            var equipment = $("#predesigned_filters--equipment") ;
            var mequipment = $("#predesigned_filters--equipment-mobile") ;
            equipment.html( "<option selected value='0'>Filter by equipment...</option>" ) ;
            mequipment.html( "<option selected value='0'>Filter by equipment...</option>" ) ;
            $.each( html["equipment"], function( index, value ) {
                equipment.append( value ) ;
                mequipment.append( value ) ;
            }); 
            equipment.select2( ) ;
            mequipment.select2( ) ;
            equipment.on('select2:select', function(e){
                var oid = $("#predesigned_filters--equipment").val( ) ;
                if( typeof __page_request_values["f5"] !== "undefined" ) {
                    if( __page_request_values["f5"] != oid ) {
                        __page_request_values["f5"] = oid ;
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Make sure TYPE=Condition Specific
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                    }  else {
                        __page_request_values["f5"] = 0 ;
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Make sure TYPE=Condition Specific
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                    }
                } else {
                    __page_request_values["f5"] = oid ;
                    current_index = 0 ;
                    requestPrograms( ) ;
                    // Make sure TYPE=Condition Specific            
                    if( $grid_filter.hasClass( "open" ) ) {
                        $grid_filter.removeClass( "open" ) ;
                    }
                }   
            });

            mequipment.on('select2:select', function(e){
                var oid = $("#predesigned_filters--equipment-mobile").val( ) ;      
                if( typeof __page_request_values["f5"] !== "undefined" ) {
                    if( __page_request_values["f5"] != oid ) {
                        __page_request_values["f5"] = oid ;                     
                        current_index = 0 ;  
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mequipment.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }
                    } else {                                
                        __page_request_values["f5"] = 0 ;                           
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mequipment.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }
                    }
                } else {
                    __page_request_values["f5"] = oid ; 
                    current_index = 0 ;                  
                    requestPrograms( ) ;
                    // Close Filter Menu
                    if( $mobile_filter_menu.hasClass( "opened" ) ) {
                        $mobile_filter_menu.removeClass( "opened" ) ;
                    }
                    // Clear button
                    var clear = mequipment.parent( ).parent().find( ".mobile-filter--clear" ) ;
                    if( oid == 0 ) {
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                    } else {                                
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    }
                }               
            });

            // Initialize the click handler for the Clear Icons
            $(".mobile-filter--clear").unbind( "click" ).on( "click", handleClearFilter ) ;    

            setFilters( ) ; // Set the newly loaded filters
        }

        /* 2.9 Refresh the Conditions drop down filter */
        function refreshConditionFilters( conditions_data ) {
            var conditions = $("#predesigned_filters--conditions") ;
            var mconditions = $("#predesigned_filters--conditions-mobile") ;
            var $grid_filter = $("#grid-filter") ;
            var $mobile_filter_menu = $(".mobile-filter-panel")
            conditions.html( "<option selected value='0'>Filter by condition...</option>" ) ;
            mconditions.html( "<option selected value='0'>Filter by condition...</option>" ) ;
            $.each( conditions_data, function( index, value ) {
                conditions.append( value ) ;
                mconditions.append( value ) ;
            }); 
            conditions.select2( ) ;
            mconditions.select2( ) ;
            conditions.on('select2:select', function(e){
                var oid = $("#predesigned_filters--conditions").val( ) ;        
                if( typeof __page_request_values["f4"] !== "undefined" ) {
                    if( __page_request_values["f4"] != oid ) {                        
                        __page_request_values["f4"] = oid ;             
                        // Make sure TYPE=Condition Specific
                        $("#predesigned_filters--types li").removeClass( "selected" ) ;
                        $("#predesigned_filters--types").find( "li[data-oid=1]" ).addClass( "selected" ) ;
                        __page_request_values["f1"] = 1 ;               
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }  else {                        
                        //__page_request_values["f4"] = 0 ;             
                        // Make sure TYPE=Condition Specific
                        $("#predesigned_filters--types li").removeClass( "selected" ) ;
                        if( __page_request_values["f4"] > 0 ) {
                            $("#predesigned_filters--types").find( "li[data-oid=1]" ).addClass( "selected" ) ;
                            __page_request_values["f1"] = 1 ;
                        }
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }
                } else {                    
                    __page_request_values["f4"] = oid ;         
                    // Make sure TYPE=Condition Specific            
                    $("#predesigned_filters--types li").removeClass( "selected" ) ;
                    $("#predesigned_filters--types").find( "li[data-oid=1]" ).addClass( "selected" ) ;
                    __page_request_values["f1"] = 1 ;
                    if( $grid_filter.hasClass( "open" ) ) {
                        $grid_filter.removeClass( "open" ) ;
                    }
                    current_index = 0 ;
                    requestPrograms( ) ;
                }   
            });

            mconditions.on('select2:select', function(e){
                var oid = $("#predesigned_filters--conditions-mobile").val( ) ;     
                if( typeof __page_request_values["f4"] !== "undefined" ) {
                    if( __page_request_values["f4"] != oid ) {
                        __page_request_values["f4"] = oid ;                             
                        __page_request_values["f1"] = 1 ; // Set Type to Condition Specific
                        $("#predesigned_filters--types-mobile").val( 1 ).trigger( "change" ) ;
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mconditions.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }
                        // Types Clear button
                        var clear = $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ) ;
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    } else {                                
                        __page_request_values["f4"] = 0 ;           
                        __page_request_values["f1"] = 1 ; // Set Type to Condition Specific
                        $("#predesigned_filters--types-mobile").val( 1 ).trigger( "change" ) ;                                  
                        current_index = 0 ;
                        requestPrograms( ) ;
                        // Close Filter Menu
                        if( $mobile_filter_menu.hasClass( "opened" ) ) {
                            $mobile_filter_menu.removeClass( "opened" ) ;
                        }
                        // Clear button
                        var clear = mconditions.parent( ).parent().find( ".mobile-filter--clear" ) ;
                        if( oid == 0 ) {
                            if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                        } else {                                
                            if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                        }
                        // Types Clear button
                        var clear = $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ) ;
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    }
                } else {
                    __page_request_values["f4"] = oid ;                     
                    __page_request_values["f1"] = 1 ; // Set Type to Condition Specific
                    $("#predesigned_filters--types-mobile").val( 1 ).trigger( "change" ) ;
                    current_index = 0 ;
                    requestPrograms( ) ;
                    // Close Filter Menu
                    if( $mobile_filter_menu.hasClass( "opened" ) ) {
                        $mobile_filter_menu.removeClass( "opened" ) ;
                    }
                    // Clear button
                    var clear = mconditions.parent( ).parent().find( ".mobile-filter--clear" ) ;
                    if( oid == 0 ) {
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                    } else {                                
                        if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                    }
                    // Types Clear button
                    var clear = $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ) ;
                    if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                }               
            });

            //$("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;            
            if( ( typeof __page_request_values["f4"] !== 'undefined' ) && __page_request_values["f4"] > 0 ) {
                $("#predesigned_filters--conditions").val( __page_request_values["f4"] ).trigger( "change" ) ;          
            }
            $("#predesigned_filters--conditions-mobile").val( __page_request_values["f4"] ).trigger( "change" ) ;
            if( __page_request_values["f4"] > 0 ) {
                if( !$("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                }
            } else {
                if( $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }
            }
        }

        /* 2.10 Set the filters based on the loaded criteria */
        function setFilters( ) {
            if( Object.keys( __page_request_values).length > 0 ) {
                // Set the Body Region / Category bubbles
                $(".category-bubbles-list li").removeClass( "active-filter" ) ;             
                if( ( typeof __page_request_values["c"] !== 'undefined' ) && __page_request_values["c"] > 0 ) {                     
                    $(".category-bubbles-list").find( "li[data-oid='"+__page_request_values["c"]+"'][data-customcat='"+__page_request_values["c1"]+"']").addClass( "active-filter" ) ;
                } else if( ( typeof __page_request_values["c"] !== 'undefined' ) && __page_request_values["c"] == -1 ) {
                    $(".category-bubbles-list").find( "li[data-oid='-1']").addClass( "active-filter" ) ;
                } else {
                    $(".category-bubbles-list").find( "li[data-oid='0']").addClass( "active-filter" ) ;
                }
                                
                if( __page_request_values["c1"] > 0 ) {
                    $("#predesigned_filters--bodyregion-mobile").val( "c-" + __page_request_values["c"] ).trigger( "change" ) ;
                } else {
                    $("#predesigned_filters--bodyregion-mobile").val( __page_request_values["c"] ).trigger( "change" ) ;
                }
                if( __page_request_values["c"] > 0 ) {
                    if( !$("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else if( __page_request_values["c"] == -1 ) {
                    if( !$("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                    }
                } 

                // Set the TYPES Filter
                $("#predesigned_filters--types li").removeClass( "selected" ) ;             
                if( ( typeof __page_request_values["f1"] !== 'undefined' ) && __page_request_values["f1"] > 0 ) {                       
                    $("#predesigned_filters--types").find( "li[data-oid='"+__page_request_values["f1"]+"']").addClass( "selected" ) ;
                }
                
                $("#predesigned_filters--types-mobile").val( __page_request_values["f1"] ).trigger( "change" ) ;
                if( __page_request_values["f1"] > 0 ) {
                    if( !$("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                    }
                }

                // Set the DIFFICULTY Filter
                $("#predesigned_filters--difficulty li").removeClass( "selected" ) ;                
                if( ( typeof __page_request_values["f2"] !== 'undefined' ) && __page_request_values["f2"] > 0 ) {                       
                    $("#predesigned_filters--difficulty").find( "li[data-oid='"+__page_request_values["f2"]+"']").addClass( "selected" ) ;
                }
                
                $("#predesigned_filters--difficulty-mobile").val( __page_request_values["f2"] ).trigger( "change" ) ;
                if( __page_request_values["f2"] > 0 ) {
                    if( !$("#predesigned_filters--difficulty-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--difficulty-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--difficulty-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--difficulty-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                    }
                }

                // Set the DURATION Filter
                $("#predesigned_filters--duration li").removeClass( "selected" ) ;              
                if( ( typeof __page_request_values["f3"] !== 'undefined' ) && __page_request_values["f3"] > 0 ) {
                    $("#predesigned_filters--duration").find( "li[data-oid='"+__page_request_values["f3"]+"']").addClass( "selected" ) ;
                }
                
                $("#predesigned_filters--duration-mobile").val( __page_request_values["f3"] ).trigger( "change" ) ;
                if( __page_request_values["f3"] > 0 ) {
                    if( !$("#predesigned_filters--duration-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--duration-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--duration-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--duration-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                    }
                }

                // Set the CONDITION Filter
                $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                if( ( typeof __page_request_values["f4"] !== 'undefined' ) && __page_request_values["f4"] > 0 ) {
                    $("#predesigned_filters--conditions").val( __page_request_values["f4"] ).trigger( "change" ) ;          
                }
                
                $("#predesigned_filters--conditions-mobile").val( __page_request_values["f4"] ).trigger( "change" ) ;
                if( __page_request_values["f4"] > 0 ) {
                    if( !$("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                    }
                }

                // Set the EQUIPMENT Filter
                $("#predesigned_filters--equipment").val( 0 ).trigger( "change" ) ;
                if( ( typeof __page_request_values["f5"] !== 'undefined' ) && __page_request_values["f5"] > 0 ) {
                    $("#predesigned_filters--equipment").val( __page_request_values["f5"] ).trigger( "change" ) ;           
                }       
                
                $("#predesigned_filters--equipment-mobile").val( __page_request_values["f5"] ).trigger( "change" ) ;
                if( __page_request_values["f5"] > 0 ) {
                    if( !$("#predesigned_filters--equipment-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--equipment-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--equipment-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--equipment-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                    }
                }

            } else {
                // Set the Body Region / Category bubbles
                $(".category-bubbles-list li").removeClass( "active-filter" ) ;     
                $(".category-bubbles-list").find( "li[data-oid='0']").addClass( "active-filter" ) ;     

                
                $("#predesigned_filters--bodyregion-mobile").val( "" ).trigger( "change" ) ;
                if( $("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--bodyregion-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

                // Set the TYPES Filter
                $("#predesigned_filters--types li").removeClass( "active-filter" ) ;                
                
                $("#predesigned_filters--types-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--types-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

                // Set the DIFFICULTY Filter
                $("#predesigned_filters--difficulty li").removeClass( "active-filter" ) ;       
                
                $("#predesigned_filters--difficulty-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--difficulty-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--difficulty-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

                // Set the DURATION Filter
                $("#predesigned_filters--duration li").removeClass( "active-filter" ) ;                     
                
                $("#predesigned_filters--duration-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--duration-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--duration-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

                // Set the CONDITION Filter
                $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                
                $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

                // Set the EQUIPMENT Filter
                $("#predesigned_filters--equipment").val( 0 ).trigger( "change" ) ;
                
                $("#predesigned_filters--equipment-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--equipment-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--equipment-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

            }
        }

// **********************************************************************************
// 3.0 SEARCH / SEARCH BAR METHODS
// **********************************************************************************

        // 3.1 Initialize the textual search bar
        function initSearchBar( ) {
            var inp = $("#header-search") ;
            var m_inp = $("#mheader-search") ;
            var h_search_bar_clear = $(".header-search-bar-clear") ;
            var mh_search_bar_clear = $(".mheader-search-bar-clear") ;
            inp.val( "" ) ;
            m_inp.val( "" ) ;

            inp.unbind( "keypress").on( "keypress", function(e){                
                if( e.keyCode == 13 ) {                	                    
                    __page_request_values["v"] = $.trim( inp.val( ) ) ;                    
                    if( __page_request_values["v"] == "" ) {
                        inp.val( "" ) ;
                        if( h_search_bar_clear.hasClass( "active" ) ) {
                            h_search_bar_clear.removeClass( "active" ) ;
                        }
                    } else {
                        current_index = 0 ;
                        routeQuery( ) ;
                        if( !h_search_bar_clear.hasClass( "active" ) ) {
                            h_search_bar_clear.addClass( "active" ) ;
                        }
                    }
                }
            });
            
            m_inp.unbind( "keypress").on( "keypress", function(e){
                if( e.keyCode == 13 ) {         
                    __page_request_values["v"] = $.trim( m_inp.val( ) ) ;
                    if( __page_request_values["v"] == "" ) {
                        m_inp.val( "" ) ;
                        if( mh_search_bar_clear.hasClass( "active" ) ) {
                            mh_search_bar_clear.removeClass( "active" ) ;
                        }
                    } else {
                        current_index = 0 ;
                        routeQuery( ) ;
                        if( !mh_search_bar_clear.hasClass( "active" ) ) {
                            mh_search_bar_clear.addClass( "active" ) ;
                        }
                        if( $(".navbar-mobile--search_panel").hasClass( "displayed" ) ) {
                            $(".navbar-mobile--search_panel").removeClass( "displayed" ) ;
                        }
                        if( !$(".ptl-mobile_search_button").hasClass( "active" ) ) {
                            $(".ptl-mobile_search_button").addClass( "active" ) ;
                        }
                    }
                }
            });

            // Also bind the search button
            $("#search-icon-legacy").unbind( "click" ).on( "click", function(e){
                var inpv = $("#header-search").val( ) ;
                if( inpv.length > 2 ) {
                    __page_request_values["v"] = inp.val( ) ;
                    if( __page_request_values["v"] == "" ) {
                        inp.val( "" ) ;
                        if( h_search_bar_clear.hasClass( "active" ) ) {
                            h_search_bar_clear.removeClass( "active" ) ;
                        }
                    } else {
                        current_index = 0 ;
                        routeQuery( ) ;
                        if( !h_search_bar_clear.hasClass( "active" ) ) {
                            h_search_bar_clear.addClass( "active" ) ;
                        }
                    }           
                }
            });

            // Bind the search clear
            $(".header-search-bar-clear").unbind( "click" ).on( "click", function(e){
                var inpv = $("#header-search").val( ) ;
                if( inpv.length > 0 ) {
                    $("#header-search").val( "" ) ;
                    __page_request_values["v"] = "" ;
                    current_index = 0 ;
                    routeQuery( ) ; 
                    if( h_search_bar_clear.hasClass( "active" ) ) {
                        h_search_bar_clear.removeClass( "active" ) ;
                    }
                } else {            
                    if( h_search_bar_clear.hasClass( "active" ) ) {
                        h_search_bar_clear.removeClass( "active" ) ;
                    }
                }
            }); 
            
            // Bind the mobile search icon
            $("#ptl-mobile_search_button").unbind( "click" ).on( "click", function(e){
                var inpv = $("#mheader-search").val( ) ;
                if( inpv.length > 2 ) {
                    __page_request_values["v"] = inpv ;
                    if( __page_request_values["v"] == "" ) {
                        $("#mheader-search").val( "" ) ;
                        if( mh_search_bar_clear.hasClass( "active" ) ) {
                            mh_search_bar_clear.removeClass( "active" ) ;
                        }                    
                    } else {
                        current_index = 0 ;
                        routeQuery( ) ;
                        if( !mh_search_bar_clear.hasClass( "active" ) ) {
                            mh_search_bar_clear.addClass( "active" ) ;
                        }
                        if( $(".navbar-mobile--search_panel").hasClass( "displayed" ) ) {
                            $(".navbar-mobile--search_panel").removeClass( "displayed" ) ;
                        }       
                        if( !$(".ptl-mobile_search_button").hasClass( "active" ) ) {
                            $(".ptl-mobile_search_button").addClass( "active" ) ;
                        }
                    }           
                } else if( __page_request_values["v"].length > 0 && inpv.length > 2 ) {
                    __page_request_values["v"] = "" ;
                    current_index = 0 ;
                    routeQuery( ) ;
                    if( mh_search_bar_clear.hasClass( "active" ) ) {
                        mh_search_bar_clear.removeClass( "active" ) ;
                    }
                }
            });

            // Bind the mobile search clear
            $(".mheader-search-bar-clear").unbind( "click" ).on( "click", function(e){
                var inpv = $("#mheader-search").val( ) ;
                if( inpv.length > 0 ) {
                    $("#mheader-search").val( "" ) ;
                    __page_request_values["v"] = "" ;
                    current_index = 0 ;
                    routeQuery( ) ; 
                    if( mh_search_bar_clear.hasClass( "active" ) ) {
                        mh_search_bar_clear.removeClass( "active" ) ;
                    }
                    if( $(".navbar-mobile--search_panel").hasClass( "displayed" ) ) {
                        $(".navbar-mobile--search_panel").removeClass( "displayed" ) ;
                    }
                    if( $(".ptl-mobile_search_button").hasClass( "active" ) ) {
                        $(".ptl-mobile_search_button").removeClass( "active" ) ;
                    }
                } else {            
                    if( mh_search_bar_clear.hasClass( "active" ) ) {
                        mh_search_bar_clear.removeClass( "active" ) ;
                    }
                }
            });
        }


        // 3.2 Request Exercise Programs
        function requestPrograms( ) {
            var url = "" ;            
            routeQuery( ) ;                 
            initClearFilters( ) ;
        }


        // 3.3 Request Search Results from API End-Point
        function routeQuery( ) {
            var __proc = __processing ;
            if( __proc ) {
                return ;
            }            
            __processing = true ;
            var url = options["api_root_url"] + "/predesigned/html" ;            
            if( Object.keys( __page_request_values).length > 0 ) {      
                url += "?" ;
                $.each( __page_request_values, function( key, value ) {         
                    url += key + "=" + $.trim( value ) + "&" ;          
                });
                url = url.substring(0, url.length - 1);
                //if( __save_state_cookie ) {
                //    Cookies.set('ptlinkedQueryState', url, { domain: '.ptlinked.com', secure: true } ) ;        
                //}
            }   

            url += "&i=" + current_index + "&m=" + record_chunks ;

            $('#header-search').blur( ) ;
            $('#mheader-search').blur( ) ;
            $(".ui-menu.search-bar-autocomplete").blur( ) ; 

            $.ajax({
                type: "GET",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,                
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Library Query AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "LIB" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {                      
                    var status = jqXHR["status"] ;
                    if( status == 200 ) {
                        renderPrograms( data );                        
                        refreshConditionFilters( data["conditions"] ) ;   
                        if( !__error_detected ) {
                            toggle_info_box( "predesigned--results_display" ) ;                        
                        }
                    } else if( status == 201 ) {                   
                        processLoadMore(0, 0);                             
                        refreshConditionFilters( data["conditions"] ) ;                                   
                        if( !__error_detected ) {
                            toggle_info_box( "predesigned--no_results_display" ) ;                        
                        }
                        __processing = false ;
                    }
                }        
            });
        }

        /* 3.4 Render the returned exercise programs */
        function renderPrograms( html ) {            
            var results_container = $("#predesigned--results_display") ;
            if( !__append_results ) {
                results_container.html( "" ) ;
            } else {
                __append_results = false ;
            }
            results_container.find(".cards--grid_placeholder").remove( ) ;
            $.each( html, function( index, value ) {
                if( index != "total_records" && index != "total_returned" && index != "conditions" ) {
                    results_container.append( value ) ;
                }
            }); 
            setTimeout( function(){
                calculateCardPlaceholders( ) ;
                processLoadMore( html["total_returned"], html["total_records"] ) ;                
                __processing = false ;
            }, 200 ) ;

            if( current_index == 0 ) { $(".ptlinked--application_container > .scroll-on-hover").scrollTop(0); }                        
            $(".cards--grid_container_item").not( ".cards--grid_placeholder").unbind( "click" ).on( "click", open_exercise_program ) ;            
            if( __page_request_values["c"] == -1 ) {                
                $(".cards--grid_container_item .btn-remove-favorite" ).unbind( "click" ).on( "click", function(e){
                    e.stopPropagation( ) ;
                    var __exercise_program_id_to_remove = $(this).data( "exercise_program_id" ) ;
                    $("#ptlinked--dialog-message").data("exercise_program_id", __exercise_program_id_to_remove ) ;
                    display_dialog( "Are you sure?", "This action cannot be undone. Are you sure you want to remove this favorite exercise program?", "Yes, Remove", __remove_program ) ;                    
                });
            }         
        }


        /* 3.4.1 Remove the selected exercise program */        
        function __remove_program( ) {
            var url = options["api_root_url"] + "/users/remove_favorite" ;   
            var __exercise_program_id_to_remove = $("#ptlinked--dialog-message").data( "exercise_program_id" ) ;            

            $.ajax({
                type: "POST",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,
                data: { 'exercise_program_id': __exercise_program_id_to_remove },
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Remove Favorite Program AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "USR" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {                      
                    var status = jqXHR["status"] ;
                    if( status == 200 ) {
                        routeQuery( ) ;
                    } else if( status == 201 ) {                
                        display_dialog( "Error", "There was an error trying to remove the exercise program. Please refresh and try again." ) ;                                
                    }
                }        
            });
        }


        /* 3.5 Open selected exercise program */
        function open_exercise_program( e ) {
            var exercise_program_id = $(this).data( "epid" ) ;
            if( exercise_program_id > 0 ) {
                __exercise_program_id = exercise_program_id ;
                loadExerciseProgram( ) ;
            }            
        }

        /* 3.6 Process the Load More */
        function processLoadMore( num_ret_records, num_total_records ) {        	
            var _current_index = current_index ;
            var current_rec_return = record_chunks ;
            var num_records_rendered = _current_index + current_rec_return ;                    
            if( num_records_rendered >= num_total_records ) {                
                $("#load-more-records").hide( ) ;              
                __scroll_more = false ;                
            } else {                
                __scroll_more = true ;
            }               
        }        

// **********************************************************************************
// 4.0 EXERCISE VIEWER METHODS
// **********************************************************************************        

        // 4.1 Clear/Reset Viewer
        function clearViewer( ) {            
            $("#workout-preview__thumbslider").html( "" ) ;
            $("#viewer--exercise_container_wrapper").html( "" ) ;
        }

        // 4.2 Load Exercise Program
        function loadExerciseProgram( ) {
            var url = options["api_root_url"] + "/exerciseprogram/"+__exercise_program_id+"/html2" ;   

            $.ajax({
                type: "GET",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,                
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Load Exercise Program AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "PROG" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {                      
                    var status = jqXHR["status"] ;
                    if( status == 200 ) {
                        renderExerciseProgram( data ) ;             
                    } else if( status == 201 ) {                
                        var results_container = $("#predesigned--results_display") ;
                        results_container.html( "No Results" ) ;
                    }
                }        
            });
        }

        // 4.3 Render the exercise Program
        function renderExerciseProgram( d ) {            
            $("h1.viewer--header__title").html( d["meta"]["title"] ) ;
            $("#workout-preview__thumbslider").html( d["thumbnails"] ) ;
            $("#viewer--exercise_container_wrapper").html( "" ) ;
            for( var i = 0 ; i < d["exercises"].length ; i ++ ) {
                $("#viewer--exercise_container_wrapper").append( d["exercises"][i] ) ;      
            }
            $(".viewer-item--exercise_video_player").unbind( "click" ).on( "click", videoClickHandler ) ;       
            initThumbnailBar( ) ;
            initVideoSource( ) ;
            init_viewer_toolbar( ) ;
            initThumbnailScrollMechanics( ) ;

            var viewer = $(".ptlinked--exercise_program_viewer") ;

            if( !viewer.hasClass( "displayed" ) ) {
                viewer.addClass( "displayed" ) ;
            }

            calc_viewer_container_height( ) ; // Calculate the viewers container height

            viewer.find( "a#viewer--close_btn" ).unbind( "click" ).on( "click", function( ) {
                if( viewer.hasClass( "displayed" ) ) {
                    viewer.removeClass( "displayed" ) ;
                }                
            });
        }

        // 4.4 Initialize the thumbnail bar
        function initThumbnailBar( ) {
            $(".exercise-thumb").unbind( "click touchstart" ).bind( "click touchstart", function(){     
                if( $(this).hasClass( "selected" ) ) {
                    
                } else {
                    $(".exercise-thumb").each( function(){
                        if( $(this).hasClass( "selected" ) ) {
                            $(this).removeClass( "selected" ) ;
                        }
                    });         
                    $(this).addClass( "selected" ) ;
                    var id = $(this).data( "wrkitem" ) ;            
                    scrollToAnchor( "exercise-" + id ) ;            
                }
            });
        }

        // 4.5 Initialize video source
        function initVideoSource( ) {
            var s = getBootstrapDeviceSize( );
            if( s == "xs" || s == "sm" ) {
                // Set source to SD
                $(".viewer-item--exercise_video_player").find( "video" ).each(function(){
                    var sd = $(this).data( "sd" ) ;
                    var hd = $(this).data( "hd" ) ;
                    $(this).attr( "src", sd ) ;
                });
            } else {
                // Set source to HD
                $(".viewer-item--exercise_video_player").find( "video" ).each(function(){
                    var sd = $(this).data( "sd" ) ;
                    var hd = $(this).data( "hd" ) ;
                    $(this).attr( "src", hd ) ;
                });
            }
        }

        // 4.6 Vide Player Click Handler
        function videoClickHandler( e ) {
            var html5VideoId = $(this).find( "video" ).attr( "id" ) ;            
            var videoHead = document.getElementById( html5VideoId ) ;
            if( $(this).find( "video" ).hasClass( "hide" ) ) {
                $(this).find( "video" ).removeClass( "hide" ) ;
            }
            if( !$(this).find( ".video-play-button" ).hasClass( "hide" ) ) {
                $(this).find( ".video-play-button" ).addClass( "hide" )
            }
            videoHead.play( ) ;
        }

        // 4.7 Thumbnail Anchor handler
        function scrollToAnchor(aid){
            var aTag = $("div[name='"+ aid +"']");
            var id = parseInt( aid.replace( "exercise-", "" ) ) ;
            var offset = ( ( id  ) * 543 ) ;//+ 505;        
            $('#viewer--exercise_container_wrapper').animate({scrollTop: offset },'slow');
        }

        // 4.8 Initialize the Hor. scroll mechanices
        function initThumbnailScrollMechanics( ) {
            var _root = $("#viewer--filmstrip") ;
            var scrollIncrement = 400 ;
            var scrollContainer = $(_root).find( "ul.workout-preview__thumbs" ) ;
            var leftScrollArrow = $(_root).find(".workout-preview__filmstrip").find( ".left-arrow" ) ;
            var rightScrollArrow = $(_root).find(".workout-preview__filmstrip").find( ".right-arrow" ) ;
            var scrollWindowWidth = $(_root).find(".workout-preview__filmstrip").get(0).offsetWidth ;
            var scrollPosition = scrollContainer.scrollLeft( ) ;
            var totalScrollWidth = scrollContainer.get(0).scrollWidth + 80 ;
            var farRightOffset = 0 ;    

            if( totalScrollWidth > scrollWindowWidth ) {
                if( !$(_root).find(".right-arrow").hasClass( "show-arrow" ) ) {
                    $(_root).find(".right-arrow").addClass( "show-arrow" ) ;
                }
            }

            $(_root).find('.right-arrow').unbind( "click" ).on( "click", function() {
                event.preventDefault();
                scrollContainer.animate({
                    scrollLeft: "+="+scrollIncrement+"px"
                }, "slow", function(){
                    // Animation Complete
                    var scrollPosition = scrollContainer.scrollLeft( ) ;
                    var totalScrollWidth = scrollContainer.get(0).scrollWidth ;         
                    if( scrollPosition > 0 ) {
                        if( !$(_root).find(".left-arrow").hasClass( "show-arrow" ) ) {
                            $(_root).find(".left-arrow").addClass( "show-arrow" ) ;
                        }
                        if( scrollPosition % scrollIncrement > 0 ) {
                            if( $(_root).find(".right-arrow").hasClass( "show-arrow" ) ) {
                                $(_root).find(".right-arrow").removeClass( "show-arrow" ) ;
                            }   
                            farRightOffset = scrollPosition % scrollIncrement ;
                        }
                    }
                });
            });

            $(_root).find('.left-arrow').unbind( "click" ).on( "click", function() {
                event.preventDefault();
                scrollContainer.animate({
                    scrollLeft: "-="+scrollIncrement+"px"
                }, "slow", function(){
                    // Animation Complete
                    farRightOffset = 0 ;
                    var scrollPosition = scrollContainer.scrollLeft( ) ;
                    var totalScrollWidth = scrollContainer.get(0).scrollWidth ;         
                    if( scrollPosition <= 0 ) {
                        if( $(_root).find(".left-arrow").hasClass( "show-arrow" ) ) {
                            $(_root).find(".left-arrow").removeClass( "show-arrow" ) ;
                        }
                        if( !$(_root).find(".right-arrow").hasClass( "show-arrow" ) ) {
                            $(_root).find(".right-arrow").addClass( "show-arrow" ) ;
                        }   
                    } else if( scrollPosition < (totalScrollWidth - scrollIncrement ) ) {
                        if( !$(_root).find(".right-arrow").hasClass( "show-arrow" ) ) {
                            $(_root).find(".right-arrow").addClass( "show-arrow" ) ;
                        }
                    }
                });
            });
        }

        // 4.9 Initialize the Viewer Toolbar
        function init_viewer_toolbar( ) {

            $(".btn-save_program").unbind( "click" ).on( "click", function(e){
                var url = options["api_root_url"] + "/users/save_favorite" ;   
                $.ajax({
                    type: "POST",
                    crossDomain: true,
                    headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                    url: url,
                    data: { 'exercise_program_id': __exercise_program_id },
                    dataType: "json",
                    error: function( jqXHR, textStatus, errorThrown ) {
                        if( options["debug_mode"] ) {
                            console.log( "::::: Save Favorite Program AJAX :::::" ) ;
                            console.log( "Request Error or Timeout" ) ;               
                            console.log( "Status Code: " + jqXHR["status"] ) ;
                            console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                            console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                            console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                        }
                        __error_detected = true ;
                        toggle_info_box( "predesigned--sys_error", "USR" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                    },
                    success: function( data, textStatus, jqXHR ) {                      
                        var status = jqXHR["status"] ;                        
                        if( status == 200 ) {
                            display_dialog( "Program Saved", "The exercise program has been successfully saved to your \"My Favorites\" folder." ) ;
                        } else if( status == 201 ) {                
                            display_dialog( "Program Already Saved", "The exercise program has already been saved to your \"My Favorites\" folder." ) ;
                        }
                    }        
                });
            });

            $(".btn-print_program").unbind( "click" ).on( "click", function(e) {                
                var url = options["api_root_url"] + "/exerciseprogram/print/" + __exercise_program_id + "-" + options["user_uid"] ;   
                var data = {} ;
                data["exercise_program_link"] = options["app_root_url"] + "?e=" + __exercise_program_id ;
                data["user_id"] = options["user_uid"] ;
                data["exercise_program_title"] = $("h1.viewer--header__title").text( ) ;
                hook('onPrintProgram', data);
                window.open( url, "PDF Viewer" ) ;         
                track_print( ) ;       
            });

            $(".btn-share_program").unbind( "click" ).on( "click", function(e) {
                var url = options["api_root_url"] + "/users/track_send" ;   
                $.ajax({
                    type: "POST",
                    crossDomain: true,
                    headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                    url: url,
                    data: { 'exercise_program_id': __exercise_program_id },
                    dataType: "json",
                    error: function( jqXHR, textStatus, errorThrown ) {
                        if( options["debug_mode"] ) {
                            console.log( "::::: Save Favorite Program AJAX :::::" ) ;
                            console.log( "Request Error or Timeout" ) ;               
                            console.log( "Status Code: " + jqXHR["status"] ) ;
                            console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                            console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                            console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                        }
                        __error_detected = true ;
                        toggle_info_box( "predesigned--sys_error", "USR" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                    },
                    success: function( data, textStatus, jqXHR ) {                      
                        var status = jqXHR["status"] ;                                                
                        var data = {} ;
                        data["exercise_program_link"] = options["app_root_url"] + "?e=" + __exercise_program_id ;
                        data["exercise_program_title"] = $("h1.viewer--header__title").text( ) ;
                        hook('onSendProgram', data);
                    }        
                });                
            });

        }

        // 4.10 Send a tracking signal to the server for the print
        function track_print( ) {
            var url = options["api_root_url"] + "/users/track_print" ;   
            $.ajax({
                type: "POST",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,
                data: { 'exercise_program_id': __exercise_program_id },
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Save Favorite Program AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "USR" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {                      
                    var status = jqXHR["status"] ;                                                
                }        
            });
        }

// **********************************************************************************
// 5.0 RENDER METHODS
// **********************************************************************************        
        
        // 5.1 Render the plugin sections
        function render( ) {                        
            $el.append( __build_mobile_search_panel( ) )
                .append( __build_category_slider( ) )
                .append( __build_results_conatainer( ) );                
            var $elGrid = $el.find( ".cards--grid_renderer" ) ;
            $elGrid.prepend( __build_filter_block( ) ) ;
            $bel = $( "body" ) ;
            $bel.append( __build_exercise_program_viewer() ) ;
            $bel.append( __build_mobile_filter_menu( ) ) ;     
            $bel.append( __build_dialogbox_templates( ) ) ;                   
        }

        // 5.2 Build mobile search panel HTML
        function __build_mobile_search_panel( ) {
            var mobile_search_panel_html = "" ;
            mobile_search_panel_html = '<div class="navbar-mobile--search_panel">' +
                '<div class="input-group search-input__outer-container">' +
                    '<div class="input-group-prepend">' +
                        '<button class="btn btn-secondary search-input__search-button" id="ptl-mobile_filter_button" type="button">' +
                            '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sliders-h" class="svg-inline--fa fa-sliders-h fa-w-16 icon--search" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"></path></svg>' +
                        '</button>' +
                    '</div>' +                                      
                    '<input label="search" type="text" class="form-control search-input__search-container" id="mheader-search" placeholder="Find an exercise program...">' +
                    '<div class="mheader-search-bar-clear" title="Clear search">X</div>' +
                    '<div class="input-group-append">' +
                        '<button class="btn btn-secondary search-input__search-button" id="ptl-mobile_search_button" type="button">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="icon icon--search">' +
                                '<title>search</title>' +
                                '<path d="M11,11a4.66,4.66,0,0,1-3.42,1.42A4.67,4.67,0,0,1,4.19,11,4.66,4.66,0,0,1,2.77,7.62,4.67,4.67,0,0,1,4.19,4.19,4.67,4.67,0,0,1,7.62,2.77,4.66,4.66,0,0,1,11,4.19a4.67,4.67,0,0,1,1.42,3.43A4.66,4.66,0,0,1,11,11m6.56,4.6-3.71-3.71a7.43,7.43,0,0,0,1.34-4.31,7.46,7.46,0,0,0-.6-3A7.65,7.65,0,0,0,13,2.22,7.54,7.54,0,0,0,10.57.6,7.58,7.58,0,0,0,4.66.6,7.4,7.4,0,0,0,.6,4.66a7.58,7.58,0,0,0,0,5.91A7.54,7.54,0,0,0,2.22,13a7.65,7.65,0,0,0,2.44,1.62,7.46,7.46,0,0,0,3,.6,7.43,7.43,0,0,0,4.31-1.34l3.71,3.7a1.38,1.38,0,0,0,2-1.95" fill="#c54905" fill-rule="evenodd" />' +
                            '</svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' ;

            return mobile_search_panel_html ;
        }

        // 5.3 Build Category Slider HTML
        function __build_category_slider( ) {
            var category_slider_html = "" ;
            category_slider_html = '<div class="scroll-container">' +
                '<div class="left-arrow"><svg class="icon icon--arrow-left" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"></path></svg></div>' +
                '<ul class="category-bubbles-list container-fluid"></ul>' +
                '<div class="right-arrow show-arrow"><svg class="icon icon--arrow-right" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path></svg></div>' +
            '</div>' ;

            return category_slider_html ;
        }

        // 5.4 Build Filter/Search Bar and Drop Downs HTML
        function __build_filter_block( ) {
            var filter_block_html = "" ;

            filter_block_html = '<div id="grid-filter" class="">' +
                        '<div class="grid-filter--wrapper">' +
                            '<div class="grid-filter--inner_wrapper">' +
                                '<div class="grid-filter--activator_wrapper">' +
                                    '<span class="card--grid_filter" id="mmenu--filter"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="sliders-h" class="svg-inline--fa fa-sliders-h fa-w-16 mr-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M496 72H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v24H16C7.2 72 0 79.2 0 88v16c0 8.8 7.2 16 16 16h208v24c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-24h208c8.8 0 16-7.2 16-16V88c0-8.8-7.2-16-16-16zm0 320H160v-24c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v24H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h80v24c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-24h336c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16zm0-160h-80v-24c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v24H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h336v24c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-24h80c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16z"></path></svg>Filter</span>' +
                                    '<span class="card--grid_filter_clear" id="mmenu--filter_clear">Clear filters&nbsp;&nbsp;X</span>' +
                                '</div>' +
                                '<div class="grid-filter--drop_down">' +
                                    '<div class="container">' +
                                        '<div class="grid-filter--option_wrapper">' +
                                            '<div class="col-6 padding-right-50">' +
                                                '<select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--conditions"></select>' +
                                            '</div>' +
                                            '<div class="col-6 padding-right-50">' +
                                                '<select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--equipment"></select>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="grid-filter--filter_label_wrapper">' +
                                            '<div class="col-4 padding-right-50 padding-left-20">' +
                                                '<span class="grid-filter--column_header">Type</span>' +
                                            '</div>' +
                                            '<div class="col-4 padding-right-50 padding-left-20">' +
                                                '<span class="grid-filter--column_header">Difficulty</span>' +
                                            '</div>' +
                                            '<div class="col-4 padding-right-50 padding-left-20">' +
                                                '<span class="grid-filter--column_header">Duration</span>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="grid-filter--filter_options_wrapper">' +
                                            '<div class="col-4 padding-right-50">' +
                                                '<div class="grid-filter--column_options">' +
                                                    '<ul id="predesigned_filters--types"></ul>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="col-4 padding-right-50">' +
                                                '<div class="grid-filter--column_options">' +
                                                    '<ul id="predesigned_filters--difficulty"></ul>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="col-4 padding-right-50">' +
                                                '<div class="grid-filter--column_options">' +
                                                    '<ul id="predesigned_filters--duration"></ul>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="grid-filter--search_wrapper">' +
                                    '<div class="input-group search-input__outer-container">' +
                                        '<input label="search" type="text" class="form-control search-input__search-container" id="header-search" placeholder="Find an exercise program...">' +
                                        '<div class="header-search-bar-clear" title="Clear search">X</div>' +
                                        '<div class="input-group-append">' +
                                            '<button class="btn btn-secondary search-input__search-button" id="search-icon-legacy" type="button">' +
                                                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="icon icon--search">' +
                                                    '<title>search</title>' +
                                                    '<path d="M11,11a4.66,4.66,0,0,1-3.42,1.42A4.67,4.67,0,0,1,4.19,11,4.66,4.66,0,0,1,2.77,7.62,4.67,4.67,0,0,1,4.19,4.19,4.67,4.67,0,0,1,7.62,2.77,4.66,4.66,0,0,1,11,4.19a4.67,4.67,0,0,1,1.42,3.43A4.66,4.66,0,0,1,11,11m6.56,4.6-3.71-3.71a7.43,7.43,0,0,0,1.34-4.31,7.46,7.46,0,0,0-.6-3A7.65,7.65,0,0,0,13,2.22,7.54,7.54,0,0,0,10.57.6,7.58,7.58,0,0,0,4.66.6,7.4,7.4,0,0,0,.6,4.66a7.58,7.58,0,0,0,0,5.91A7.54,7.54,0,0,0,2.22,13a7.65,7.65,0,0,0,2.44,1.62,7.46,7.46,0,0,0,3,.6,7.43,7.43,0,0,0,4.31-1.34l3.71,3.7a1.38,1.38,0,0,0,2-1.95" fill="#c54905" fill-rule="evenodd" />' +
                                                '</svg>' +
                                            '</button>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +                      
                    '</div>' ;
                    return filter_block_html ;
        }

        // 5.5 Build the plugin containers
        function __build_results_conatainer( ) {
            var results_container_html = "" ;

            results_container_html = '<div class="container-fluid scroll-on-hover">' +
                '<div class="cards--grid_renderer">' +
                    '<div id="predesigned--results_display" class="cards--grid_container"></div>' +
                    '<div id="load-more-records" class="loading-more-wrapper"><div class="btn-load_more_records"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="spinner-third" class="svg-inline--fa fa-spinner-third fa-w-16 fa-spin margin-right-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>Loading...</div></div>' +
                    '<div id="predesigned--no_results_display" class="cards--grid_container info-box-item">' +
                        '<div class="no_results--wrapper container text-center">' +
                            '<h1 class="no_results--title">No Results</h1>' +
                            '<p>Sorry, we are unable to find any exercise programs with the filters and search terms you are using.</p>' +
                            '<p>Please try a different combination of filters and/or search terms.</p>' +               
                            '<p class="subtext"><br /><br /><strong>NOTE:</strong>  Every exercise program published on this site has been created and reviewed by a team of licensed physical therapists.</p>' +
                        '</div>' +
                    '</div>' +                    
                    '<div id="predesigned--sys_error" class="cards--grid_container info-box-item">' +
                        '<div class="no_results--wrapper container text-center">' +
                            '<h1 class="no_results--title">Something Went Wrong</h1>' +
                            '<p>Sorry, there seems to be an issue loading this component. Please refresh your browser.</p><p>If this problem persists, please contact technical support and provide them with the following error number:</p>' +
                            '<p class="error-number">#ERR010203</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' ;

            return results_container_html ;
        }

        // 5.6 Build the mobile filter menu
        function __build_mobile_filter_menu( ) {
            var results_container_html = "" ;
            results_container_html = '<div class="mobile-filter-panel">' +
                '<ul class="mobile-filter-panel_list">' +
                    '<li class="double-divider" id="mbtn-close_filter_menu">X&nbsp;&nbsp;Filter<span class="mobile--grid_filter_clear float-right" id="mobile--filter_clear">Clear filters<i class="fas fa-times-circle ml-3 mr-0"></i></span></li>' +
                    '<li class="single-divider"><div class="mobile-filter--label">Body Region:</div><div class="mobile-filter--value" data-f="c"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--bodyregion-mobile"></select></div><div class="mobile-filter--clear" title="Clear body region filter" data-toggle="tooltip">X</div></li>' +
                    '<li class="single-divider"><div class="mobile-filter--label">Condition:</div><div class="mobile-filter--value" data-f="f4"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--conditions-mobile"></select></div><div class="mobile-filter--clear" title="Clear condition filter" data-toggle="tooltip">X</div></li>' +
                    '<li class="single-divider"><div class="mobile-filter--label">Type:</div><div class="mobile-filter--value" data-f="f1"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--types-mobile"></select></div><div class="mobile-filter--clear" title="Clear type filter" data-toggle="tooltip">X</div></li>' +
                    '<li class="single-divider"><div class="mobile-filter--label">Difficulty:</div><div class="mobile-filter--value" data-f="f2"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--difficulty-mobile"></select></div><div class="mobile-filter--clear" title="Clear difficulty filter" data-toggle="tooltip">X</div></li>' +
                    '<li class="single-divider"><div class="mobile-filter--label">Equipment:</div><div class="mobile-filter--value" data-f="f5"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--equipment-mobile"></select></div><div class="mobile-filter--clear" title="Clear equipment filter" data-toggle="tooltip">X</div></li>' +
                    '<li class="single-divider"><div class="mobile-filter--label">Duration:</div><div class="mobile-filter--value" data-f="f3"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--duration-mobile"></select></div><div class="mobile-filter--clear" title="Clear duration filter" data-toggle="tooltip">X</div></li>' +                    
                '</ul>' +
            '</div>' ;

            return results_container_html ;
        }

        // 5.7 Build the Exercise Program Viewer Container
        function __build_exercise_program_viewer( ) {
            var results_container_html = "" ;
            results_container_html = '<div class="ptlinked--exercise_program_viewer">' +
                '<div class="viewer--header">' +
                    '<div class="viewer--header_inner">' +
                        '<div class="viewer--header_main">' +
                            '<div class="viewer--site-logo">' +
                                '<a href="https://mdvip.com" rel="home" class="site-logo__container" title="MDVIP Connect Portal">' +
                                  '<svg viewBox="0 0 744.56 183.45" xmlns="http://www.w3.org/2000/svg" class="icon icon--mdvip-logo-white">' +
                                    '<g fill="#fff">' +
                                      '<path d="m608.84 7.41h21v165.89h-22.91v6.15h72.55v-6.15h-23.72v-74.13h12.8c56 0 76-28.56 76-50.42 0-23.46-15.45-47.46-64.78-47.46h-70.94zm46.92 0h7.45c36 0 53.08 2.95 53.08 40.28 0 29.61-8 45.34-51.49 45.34h-9z"></path>' +
                                      '<path d="m546.2 173.3h-22.97v6.15h71.73v-6.15h-22.93v-165.88h22.93v-6.13h-72.71v6.13h23.95z"></path>' +
                                      '<path d="m500.19 1.29h-1.68-31.73v6.13h24.26l-42.92 133.09h-.55l-44.79-133.09h20.77v-6.13h-67.45v6.13h19.47l59.74 176.03h6.66l56.54-176.03h1.68 16.08v-6.13z"></path>' +
                                      '<path d="m213 1.29h76.64c54.66 0 87.36 33.21 87.36 88.38 0 58.43-33.2 89.87-87.38 89.87h-76.62zm46.43 138.31h22c35.19-.76 49.18-14.48 49.18-50.18 0-32.46-17.48-48.19-49.18-48.19h-22z"></path>' +
                                      '<path d="m117.32 83.89c0-6.72-5.48-12.34-12.95-14.21l-1.71 28.85c8.34-1.37 14.66-7.41 14.66-14.64z"></path>' +
                                      '<path d="m81.41 83.89c0 7.23 6.3 13.27 14.65 14.64l-1.71-28.85c-7.46 1.87-12.94 7.49-12.94 14.21z"></path>' +
                                      '<path d="m154.68 0c-1 1.9-3.05 5.92-3.79 7.34l-16.89-6.41-1.09 2.86 13.55 5.15c-.94 1.75-2.52 4.74-3.2 6l-23.81-9.43-1.11 2.87 20.22 8c-.92 1.82-2.54 4.95-3.2 6.25-1.65-.68-17.54-7.21-27.44-11.3l-3.22 52.67c9.75-2.07 17-9.3 17-17.9 0-7-4.81-13.17-11.9-16.28l.85-7.28c10.25 3.71 18.33 11.83 18 23.57-.25 9.54-7.9 17.75-18.25 21.28 6.88 3.23 11.54 9.29 11.54 16.22 0 7.77-5.81 14.4-14.06 17.22 5.27 2.25 8.9 6.68 8.9 11.89 0 6.6-5.79 12.07-13.45 13.26l.27-2.87c5.67-1.26 9.84-5.41 9.84-10.41 0-5.37-4.78-9.77-11-10.63l-3 37.69-3-37.69c-6.26.86-11 5.26-11 10.63 0 5 4.19 9.15 9.85 10.41l.27 2.87c-7.81-1.23-13.56-6.7-13.56-13.3 0-5.21 3.63-9.64 8.89-11.89-8.27-2.79-14.1-9.45-14.1-17.22 0-6.93 4.66-13 11.55-16.22-10.34-3.53-18-11.74-18.24-21.28-.32-11.74 7.77-19.86 18-23.57l.9 7.28c-7.13 3.11-11.94 9.22-11.94 16.28 0 8.6 7.21 15.83 17 17.9l-3.26-52.65c-9.89 4.09-25.8 10.62-27.43 11.3-.66-1.3-2.29-4.43-3.21-6.25l20.22-8-1.11-2.85-23.84 9.42c-.66-1.25-2.27-4.24-3.19-6l13.54-5.14-1.09-2.86-16.85 6.41c-.73-1.42-2.84-5.44-3.84-7.34h-44v178.27h43.68v-135.27h.5l37.46 135.27h35.44l37.46-135.27h.46v135.27h43.58v-178.27z"></path>' +
                                    '</g>' +
                                  '</svg>' +
                                '</a>' +
                              '</div>' +
                              '<div class="viewer--metadata-block-mobile-wrapper">';
                                results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-print_program" data-code="QDG081"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="print" class="svg-inline--fa fa-print fa-w-16 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M400 264c-13.25 0-24 10.74-24 24 0 13.25 10.75 24 24 24s24-10.75 24-24c0-13.26-10.75-24-24-24zm32-88V99.88c0-12.73-5.06-24.94-14.06-33.94l-51.88-51.88c-9-9-21.21-14.06-33.94-14.06H110.48C93.64 0 80 14.33 80 32v144c-44.18 0-80 35.82-80 80v128c0 8.84 7.16 16 16 16h64v96c0 8.84 7.16 16 16 16h320c8.84 0 16-7.16 16-16v-96h64c8.84 0 16-7.16 16-16V256c0-44.18-35.82-80-80-80zM128 48h192v48c0 8.84 7.16 16 16 16h48v64H128V48zm256 416H128v-64h256v64zm80-112H48v-96c0-17.64 14.36-32 32-32h352c17.64 0 32 14.36 32 32v96z"></path></svg><span class="label">Print</span></span>' ;
                                if( !options["training_mode"] && options["save_favorites"] ) {
                                    results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-save_program" data-code="QDG081"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="save" class="svg-inline--fa fa-save fa-w-14 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z"></path></svg><span class="label">Save</span></span>' ;
                                }
                                if( !options["training_mode"] && options["secure_messaging"] && options["user_type"] == "physician" ) {
                                  results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-share_program" data-code="QDG081"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="share" class="svg-inline--fa fa-share fa-w-18 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M561.938 190.06L385.94 14.107C355.79-16.043 304 5.327 304 48.047v80.703C166.04 132.9 0 159.68 0 330.05c0 73.75 38.02 134.719 97.63 173.949 37.12 24.43 85.84-10.9 72.19-54.46C145.47 371.859 157.41 330.2 304 321.66v78.28c0 42.64 51.73 64.15 81.94 33.94l175.997-175.94c18.751-18.74 18.751-49.14.001-67.88zM352 400V272.09c-164.521 1.79-277.44 33.821-227.98 191.61C88 440 48 397.01 48 330.05c0-142.242 160.819-153.39 304-154.02V48l176 176-176 176z"></path></svg><span class="label">Send</span></span>' ;
                                }
    results_container_html += '</div>' +
                              '<div class="viewer--close_button">' +
                                '<a href="javascript:;" id="viewer--close_btn">' +
                                    '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="times-circle" class="svg-inline--fa fa-times-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>' +
                                '</a>' +
                              '</div>' +
                        '</div>' +
                        '<div class="viewer--header__title-wrapper">' +
                          '<h1 class="viewer--header__title viewer--program_title"></h1>' +
                          '<div class="metadata-block-wrapper">' ;                            
                              results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-print_program"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="print" class="svg-inline--fa fa-print fa-w-16 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M400 264c-13.25 0-24 10.74-24 24 0 13.25 10.75 24 24 24s24-10.75 24-24c0-13.26-10.75-24-24-24zm32-88V99.88c0-12.73-5.06-24.94-14.06-33.94l-51.88-51.88c-9-9-21.21-14.06-33.94-14.06H110.48C93.64 0 80 14.33 80 32v144c-44.18 0-80 35.82-80 80v128c0 8.84 7.16 16 16 16h64v96c0 8.84 7.16 16 16 16h320c8.84 0 16-7.16 16-16v-96h64c8.84 0 16-7.16 16-16V256c0-44.18-35.82-80-80-80zM128 48h192v48c0 8.84 7.16 16 16 16h48v64H128V48zm256 416H128v-64h256v64zm80-112H48v-96c0-17.64 14.36-32 32-32h352c17.64 0 32 14.36 32 32v96z"></path></svg>Print</span>' ;
                            if( !options["training_mode"] && options["save_favorites"] ) {
                                results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-save_program"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="save" class="svg-inline--fa fa-save fa-w-14 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z"></path></svg>Save</span>' ;
                            }
                            if( !options["training_mode"] && options["secure_messaging"] && options["user_type"] == "physician"  ) {
                              results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-share_program"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="share" class="svg-inline--fa fa-share fa-w-18 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M561.938 190.06L385.94 14.107C355.79-16.043 304 5.327 304 48.047v80.703C166.04 132.9 0 159.68 0 330.05c0 73.75 38.02 134.719 97.63 173.949 37.12 24.43 85.84-10.9 72.19-54.46C145.47 371.859 157.41 330.2 304 321.66v78.28c0 42.64 51.73 64.15 81.94 33.94l175.997-175.94c18.751-18.74 18.751-49.14.001-67.88zM352 400V272.09c-164.521 1.79-277.44 33.821-227.98 191.61C88 440 48 397.01 48 330.05c0-142.242 160.819-153.39 304-154.02V48l176 176-176 176z"></path></svg>Send</span>' ;
                            }
            results_container_html += '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div id="viewer--header" class="viewer--header_bar">' +
                    '<div id="viewer--filmstrip" class="viewer--filmstrip_container">' +
                        '<div class="workout-preview__filmstrip">' +
                            '<div class="left-arrow"><svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="angle-left" class="svg-inline--fa fa-angle-left fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M25.1 247.5l117.8-116c4.7-4.7 12.3-4.7 17 0l7.1 7.1c4.7 4.7 4.7 12.3 0 17L64.7 256l102.2 100.4c4.7 4.7 4.7 12.3 0 17l-7.1 7.1c-4.7 4.7-12.3 4.7-17 0L25 264.5c-4.6-4.7-4.6-12.3.1-17z"></path></svg></div>' +
                            '<ul class="workout-preview__thumbs" id="workout-preview__thumbslider"></ul>' +
                            '<div class="right-arrow"><svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="angle-right" class="svg-inline--fa fa-angle-right fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path></svg></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="viewer--exercise_container" id="viewer--exercise_container_wrapper"></div>' +
            '</div>' ;

            return results_container_html ;
        }

        // 5.8 Build dialogbox templates
        function __build_dialogbox_templates( ) {
            var __j_dialog = '<div id="ptlinked--dialog-message" title="" data-exercise_program_id="">' +                            
                              '<p class="ptlinked-dialog--message">' +                                                                
                              '</p>' +                              
                            '</div>' ;

            var __b_dialog = '<div class="modal fade" id="ptlinked--modal-dialog">' +
                                '<div class="modal-dialog min-width-600">' +
                                    '<div class="modal-content">' +
                                        '<div class="modal-header">' +
                                            '<h4 class="modal-title"></h4>' +
                                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                                        '</div>' +
                                        '<div class="modal-body">' +
                                            '<div class="row mb-3 justify-content-center">' +
                                                '<div class="col-10 text-center">' +
                                                    '<p class="ptlinked-dialog--message"></p>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="modal-footer">' +
                                            '<a href="javascript:;" class="btn btn-white" data-dismiss="modal">Close</a>' +
                                            '<a href="javascript:;" class="btn btn-success" id="ptlinked-modal--action_btn">Action Button</a>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' ;
            if( options["dialog_box_type"] == "bootstrap" ) {
                return __b_dialog ;
            } else {
                return __j_dialog ;
            }            
        }


		
		// Initialize plugin.		
		function init() {
			if( options["debug_mode"] ) { console.log( "::::: Plugin Initialization :::::") ; }
            // Reset all page request flags
            __page_request_values["c"] = 0 ;    // Selected Category
            __page_request_values["c1"] = 0 ;   // Category Type (0='reg' or 1='custom')
            __page_request_values["v"] = "" ;   // Search String
            __page_request_values["f1"] = 0 ;   // Type Filter
            __page_request_values["f2"] = 0 ;   // Difficulty Filter
            __page_request_values["f3"] = 0 ;   // Duration Filter
            __page_request_values["f4"] = 0 ;   // Condition Filter
            __page_request_values["f5"] = 0 ;   // Equipment Filter 
            current_index = 0 ; // Current Index Count
            record_chunks = 25 ; // Total Records to load          

            if( options["debug_mode"] ) { console.log( "----- Register User Session") ; }
            registerUser( ) ;  
            
            if( options["debug_mode"] ) { console.log( "----- Rendering User Interface") ; }
            render( ) ; // Render Interface

            if( options["debug_mode"] ) { console.log( "----- Calculate Plugin Container Height") ; }
            calc_plugin_container_height( ) ; // Calculate Container Height for library
            
            if( options["debug_mode"] ) { console.log( "----- Process Page Request Parameters") ; }
            __page_request_query_values = loadPageRequest( ) ;            
            
            if( options["debug_mode"] ) { console.log( "----- Initializing the Filter Drop Down") ; }
            initFilterDropDown( ) ; // Initialize the Filter Drop Down Block

            if( options["debug_mode"] ) { console.log( "----- Initializing the Mobile Filter Menu") ; }
            init_mobile_filter_menu( ) ; // Initialize the mobile Filter Drop Down Block
            
            if( options["debug_mode"] ) { console.log( "----- Initializing Search Bar") ; }
            initSearchBar( ) ; // initialize Search Bar
            
            if( options["debug_mode"] ) { console.log( "----- Loading Categories") ; }
            clearCategories( ) ; // Clear Categories Slider Bar            
            loadCategories( ) ; // Load Categories Slider Bar
            
            if( options["debug_mode"] ) { console.log( "----- Loading Filters") ; }
            clearFilters( ) ; // Clear the Filters            
            loadFilters( ) ; // Load Filters
            
            if( options["debug_mode"] ) { console.log( "----- Requesting Initial Search Results") ; }
            routeQuery( ) ; // Initiate Search
            
            if( options["debug_mode"] ) { console.log( "----- Initialize Scroll Monitor") ; }
            initScrollMonitor( ) ; // Initialize ScrollMonitor
            
            if( options["debug_mode"] ) { console.log( "----- Process URL Query") ; }
            process_url_query( ) ; // Check page request query string

            if( options["debug_mode"] ) { console.log( "----- Trigger OnInit Callback") ; }
			hook('onInit');
		}

// **********************************************************************************
// 6.0 UTILITY METHODS
// **********************************************************************************
		
		// 6.1 Toggle the mobile filter menu
		function init_mobile_filter_menu( ) {
			$("#ptl-mobile_filter_button").unbind( "click" ).on( "click", function(){		
				if( !$(".mobile-filter-panel").hasClass( "opened" ) ) {
					$(".mobile-filter-panel").addClass( "opened" ) ;
				} else {
					$(".mobile-filter-panel").removeClass( "opened" )
				}
			});	

			$("#mbtn-close_filter_menu").unbind( "click" ).on( "click", function(){
				if( $(".mobile-filter-panel").hasClass( "opened" ) ) {
					$(".mobile-filter-panel").removeClass( "opened" ) ;
				}
			});
		}
		        
        // 6.2 Calculate the Exercise Program Card Placeholders
        function calculateCardPlaceholders( ) {
            var card_width = $(".cards--grid_container_item").width() + 10 + 10 ;
            var container_width = $("#predesigned--results_display").width() ;
            var num_cards_in_row = Math.floor( container_width / card_width ) ;
            var num_cards = $(".cards--grid_container_item").length ;   
            var placeholders_needed = num_cards_in_row - ( num_cards - ( Math.floor( num_cards / num_cards_in_row ) * num_cards_in_row ) ) ;
            if( placeholders_needed == num_cards_in_row ) {
                placeholders_needed = 0 ;
            }   
            var placeholder = '<div class="cards--grid_container_item cards--grid_placeholder"></div>' ;
            var results_container = $("#predesigned--results_display") ;
            for( $i = 0 ; $i < placeholders_needed ; $i ++ ) {      
                results_container.append( placeholder ) ;
            }
        }

        // 6.3 Toggle the info box
        function toggle_info_box( info_box_id, err_code ) {            
			if( info_box_id == "predesigned--results_display" ) {
				if( $(".info-box-item").hasClass( "active" ) ) {
					$(".info-box-item").removeClass( "active" ) ;
				}
				if( $("#predesigned--results_display").hasClass( "display_info_box" ) ) {
					$("#predesigned--results_display").removeClass( "display_info_box" ) ;
				}            
			} else {                        
                if( info_box_id == "predesigned--sys_error" ) {
                    $(".info-box-item").find( "p.error-number" ).html( "#" + err_code ) ;
                    // Disable Category, Filter/search elements
                    $el.find( ".scroll-container").hide( ) ;
                    $el.find( "#grid-filter" ).hide( ) ;
                }
				if( !$("#predesigned--results_display").hasClass( "display_info_box" ) ) {
					$("#predesigned--results_display").addClass( "display_info_box" ) ;
				}
				if( $(".info-box-item").hasClass( "active" ) ) {
					$(".info-box-item").removeClass( "active" ) ;
				}                
				$("#" + info_box_id ).addClass( "active" ) ;
				$("#load-more-records").hide( ) ;
			}
		}

        // 6.4 Initialize the content scroll monitor
        function initScrollMonitor( ) {
            $(".scroll-on-hover").scroll(function() {
                var __can_scroll = __scroll_more ;
                if( __can_scroll ) {
                    $("#load-more-records").show( ) ;
                    if( $(".scroll-on-hover").scrollTop() == Math.round($(".cards--grid_renderer").height() - $(".scroll-on-hover").height() ) ) {                                     
                           current_index += record_chunks ;
                           __append_results = true ;
                           routeQuery( ) ;
                    }
                } else {
                    $("#load-more-records").hide( ) ;
                }
            });
        }

        // 6.5 Get Bootstrap Device Size
        function getBootstrapDeviceSize() {
            if( $("#users-device-size").find( "#xl" ).css( "display" ) == "block" ) {
              return "xl" ;
            } else if( $("#users-device-size").find( "#lg" ).css( "display" ) == "block" ) {
              return "lg" ;
            } else if( $("#users-device-size").find( "#md" ).css( "display" ) == "block" ) {
              return "md" ;
            } else if( $("#users-device-size").find( "#sm" ).css( "display" ) == "block" ) {
              return "sm" ;
            } else if( $("#users-device-size").find( "#xs" ).css( "display" ) == "block" ) {
              return "xs" ;
            }            
        }

        // 6.6 Load Page Request Parameters
        function loadPageRequest( ) {
            var $_GET = {}; 
            document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
                function decode(s) {
                    return decodeURIComponent(s.split("+").join(" "));
                }

                $_GET[decode(arguments[1])] = decode(arguments[2]);
            });
            return $_GET ;
        }

        // 6.7 Register the user/plugin with the API
        function registerUser( ) {
            var url = options["api_root_url"] + "/users/register_plugin" ;   

            $.ajax({
                type: "POST",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,                
                dataType: "json",
                error: function( jqXHR, textStatus, errorThrown ) {
                    if( options["debug_mode"] ) {
                        console.log( "::::: Register User AJAX :::::" ) ;
                        console.log( "Request Error or Timeout" ) ;               
                        console.log( "Status Code: " + jqXHR["status"] ) ;
                        console.log( "Status Msg: " + jqXHR["statusText"] ) ;             
                        console.log( "Response Msg: " + jqXHR["responseText"] ) ;
                        console.log( "::::: ===== ===== ===== ===== :::::" ) ;
                    }
                    __error_detected = true ;
                    toggle_info_box( "predesigned--sys_error", "REG" + jqXHR["status"] + " - " + jqXHR["statusText"] ) ;
                },
                success: function( data, textStatus, jqXHR ) {                      
                    var status = jqXHR["status"] ;                    
                    if( status == 200 ) {
                        
                    } else if( status == 201 ) {                
                        
                    }
                }        
            });
        }
        
        // 6.8 Process URL Query Variables
        function process_url_query( ) {            
            if( Object.keys(__page_request_query_values).length > 0 ) {                
                if( typeof __page_request_query_values["e"] != 'undefined' ) {
                    var epid = __page_request_query_values["e"] ;                    
                    if( epid > 0 ) {
                        __exercise_program_id = epid ;
                        loadExerciseProgram( ) ;
                    }
                }
            }
        }

        // 6.9 Calculate the plugin container height
        function calc_plugin_container_height( ) {
            // Get page header EL from options (default is header.site-header)
            // Make sure page header EL passed/set actually exists
            // If page header EL option doesn't exist, and either does the default EL, then use a fixed header size as fallback
            // Return the height in PX that the plugin container needs to be (.scroll-on-hover, .ptlinked--application_container)
            var el_page_header = $("."+options["header_element_class"]) ;
            if( !el_page_header.length ) {
                // Header element doesn't exist - do something
            }

            var h_page_header = Math.round( $(el_page_header).outerHeight( ) ) ;
            var h_full_page = Math.round( $("body").outerHeight( ) ) ;
            var h_plugin_container = Math.round( h_full_page - h_page_header ) ;
            $el.css( "height", h_plugin_container ) ;
            var el_page_scroll_container = $(".scroll-container") ;
            var h_category_slider = Math.round( $(el_page_scroll_container).outerHeight() ) ;
            $(".scroll-on-hover").css( "height", Math.round( h_plugin_container - h_category_slider ) ) ;
        }

        // 6.10 Calculate the Exercise Program Viewer container height (scrollable area)
        function calc_viewer_container_height( ) {
            // Get viewer header EL from options (default is .viewer--header + .viewer--header_bar)
            // If the thumb slider bar is displayed, add that to the header height
            // Make sure viewer header EL passed/set actually exists
            // If viewer header EL option doesn't exist, and either does the default EL, then use a fixed header size as fallback
            // Return the height in PX that the viewer container needs to be (.viewer--exercise_container)
            var el_viewer_header = $("."+options["viewer_header_element_class"]) ;
            if( !el_viewer_header.length ) {
                // Header element does not exist - do something
            }
            var h_full_page = Math.round( $("body").outerHeight( ) ) ;
            var h_viewer_header = Math.round( $(el_viewer_header).outerHeight( ) ) ;
            var el_viewer_thumb_bar = $("."+options["viewer_thumb_scroller_class"]) ;
            var h_viewer_thumb_bar = Math.round( $(el_viewer_thumb_bar).outerHeight( ) ) ;
            $(".viewer--exercise_container").css( "height", Math.round( h_full_page - ( h_viewer_header + h_viewer_thumb_bar ) ) ) ;
        }

        // 6.11 Display a Dialog Box
        function display_dialog( title, content, confirmation_btn, confirmation_callback ) {
            if( options["dialog_box_type"] == "jquery" ) {
                var _dialog = $("#ptlinked--dialog-message") ;
                _dialog.attr( "title", title ) ;
                _dialog.find( "p.ptlinked-dialog--message" ).html( content ) ;
                if( confirmation_btn && confirmation_callback ) {                    
                    _dialog.find( "#ptlinked-modal--action_btn").html( confirmation_btn ) ;
                    _dialog.dialog({
                        modal: true,
                        title: title,
                        buttons: [ 
                            {
                                text: confirmation_btn,                                
                                click: function() { 
                                    $( this ).dialog( "close" );
                                    confirmation_callback( ) ;
                                }
                            },
                            {
                                text: "Cancel",                                
                                click: function() { 
                                    $( this ).dialog( "close" );
                                }
                            }
                        ]                        
                    });
                } else {
                    _dialog.dialog({
                        modal: true,
                        title: title,
                        buttons: [ 
                            {
                                text: "Ok",                                
                                click: function() { 
                                    $( this ).dialog( "close" );                                    
                                }
                            }
                        ]                        
                    });
                }
            } else {
                var data = [];
                data["title"] = title ;
                data["content"] = content ;
                data["confirmation_btn"] = confirmation_btn ;
                data["confirmation_callbackn"] = confirmation_callback ;
                hook('onShowDialog', data);
            }
        }


		/**
		* Get/set a plugin option.
		* Get usage: $('#el').demoplugin('option', 'key');
		* Set usage: $('#el').demoplugin('option', 'key', value);
		*/
		function option (key, val) {
			if (val) {
				options[key] = val;
			} else {
				return options[key];
			}
		}

		/**
		* Destroy plugin.
		* Usage: $('#el').demoplugin('destroy');
		*/
		function destroy() {
			// Iterate over each matching element.
			$el.each(function() {
				var el = this;
				var $el = $(this);

				// Add code to restore the element to its original state...

				hook('onDestroy');
				// Remove Plugin instance from the element.
				$el.removeData('plugin_' + pluginName);
			});
		}

		/**
		* Callback hooks.
		* Usage: In the defaults object specify a callback function:
		* hookName: function() {}
		* Then somewhere in the plugin trigger the callback:
		* hook('hookName');
		*/
		function hook(hookName, params) {
			if (options[hookName] !== undefined) {
				// Call the user defined function.
				// Scope is set to the jQuery element we are operating on.                
				options[hookName].call(el, params);
			}
		}

		// Initialize the plugin instance.
		init();

		// Expose methods of Plugin we wish to be public.
		return {
			option: option,
            toggle_info_box: toggle_info_box,
			destroy: destroy
		};
	}

	/**
	* Plugin definition.
	*/
	$.fn[pluginName] = function(options) {
		// If the first parameter is a string, treat this as a call to a public method.
		if (typeof arguments[0] === 'string') {
			var methodName = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			var returnVal;
			this.each(function() {
				// Check that the element has a plugin instance, and that the requested public method exists.
				if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
				// Call the method of the Plugin instance, and Pass it the supplied arguments.
					returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
				} else {
					throw new Error('Method ' +  methodName + ' does not exist on jQuery.' + pluginName);
				}
			});

			if (returnVal !== undefined){
				// If the method returned a value, return the value.
				return returnVal;
			} else {
				// Otherwise, returning 'this' preserves chainability.
				return this;
			}
			
		// If the first parameter is an object (options), or was omitted,
		// instantiate a new instance of the plugin.
		} else if (typeof options === "object" || !options) {
			return this.each(function() {
				// Only allow the plugin to be instantiated once.
				if (!$.data(this, 'plugin_' + pluginName)) {
					// Pass options to Plugin constructor, and store Plugin
					// instance in the elements jQuery data object.
					$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
				}
			});
		}
	};

	// Default plugin options.
	// Options can be overwritten when initializing plugin, by
	// passing an object literal, or after initialization:
	// $('#el').demoplugin('option', 'key', value);
	$.fn[pluginName].defaults = {
        user_uid: 0,                                                // Unique User Identifier
        user_type: 'physician',                                     // User Tyle (physician, patient, support, etc.)
        secure_messaging: false,                                    // Toggle Send Exercise Program via SecureMessaging
        training_mode: false,                                       // Toggle training mode (print, save, send)        
        save_favorites: false,                                      // Toggle Save program to favorites
        debug_mode: false,                                          // Toggle debug mode (allows console.log)
        api_root_url: '',                                           // The root URL to the PTLINKED api
        api_key: '',                                                // Customer (MDVIP) API Key
        app_root_url: 'https://mdvip-plugin.ptlinked.com/test',     // URL of where plugin is being used        
        header_element_class: 'site-header',                        // Plugin page header class
        viewer_header_element_class: 'viewer--header',              // Plugin exercise program viewer header class
        viewer_thumb_scroller_class: 'viewer--header_bar',          // Plugin exercise program viewer thumbnail slider class
        dialog_box_type: 'bootstrap',                               // Dialog plugin/component to use (bootstrap, jQuery)

		onInit: function() {},                                      // On plugin initialization callback
		onDestroy: function() {},                                   // On plugin destroy callback
        onSendProgram: function(data) {},                               // On Send Exercise Program callback
        onSaveProgram: function() {},                               // On Save Exercise Program callback
        onPrintProgram: function() {},                              // On Print Exercise Program callback
        onShowDialog: function(data) {}                                 // Triggered when a dialog box needs to be displayed
	};
	
})(jQuery);