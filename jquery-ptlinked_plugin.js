 /**
 * PTLINKED Plugin - Exercise Program Library
 * Customer: MDVIP
 * Version: 1.0.7
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
 *       2.10 Refresh the Custom Subcategories drop down filter
 *       2.11 Set the filters based on the loaded criteria
 *       2.12 Load the Custom Category Filter Block
 *       2.13 Add/Remove bubbles from filter breadcrumb
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
        var selected_filters = {} ;            // Selected Filters
        var __filter_timer ;                   // Filter timer variable
        var __filter_delay = 500 ;             // The set delay before the filter menu is displayed
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
        var __exercise_program_code = '' ;     // Currently selected exercise program code to display in viewer
        var __error_detected = false ;
        var __bodyregion_info = {} ;
		


// **********************************************************************************
// 1.0 CATEGORY SLIDER METHODS
// **********************************************************************************		

		// 1.1 Load Category Items in Sliderbar / Mobile Menu
		function loadCategories( ) {			
            var url = options["api_root_url"] + "/predesigned/bodyregions/html" ; 
            var s = getBootstrapDeviceSize( );
            if( s ) {
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
                    if( s ) {                                 
                        var mbodyregion = $("#predesigned_filters--bodyregion-mobile") ;                                
                        $.each( data, function( index, value ) {                    
                            mbodyregion.append( value ) ;
                        });                        
                        var highlight_image = options["assets_cdn"] + "bodyregion_highlights/bodyregion--empty.png" ;
                        var title_label = "All Programs" ;
                        $(".ptlinked--m_bodyregion_highlight").find( "img" ).attr( "src", highlight_image ) ;
                        $(".ptlinked--m_bodyregion_highlight").find( ".highlight-label" ).html( title_label ) ;     
                        $(".ptlinked--m_bodyregion_highlight").show( ) ;
                        mbodyregion.select2( ) ;                        
                        mbodyregion.unbind( "select2:select").on('select2:select', function(e){
                            var oid = $("#predesigned_filters--bodyregion-mobile").val( ) ;       
                            var custom_cat = $("#predesigned_filters--bodyregion-mobile").find( ":selected" ).data( "customcat" ) ;        
                            if( custom_cat > 0 ) {
                                oid = oid.replace( "c-", "" ) ;
                            }
                            var title = $("#predesigned_filters--bodyregion-mobile").find(":selected").data("title") ;
                            var type = $("#predesigned_filters--bodyregion-mobile").find(":selected").data("type") ;
                            var cur_c = __page_request_values["c"] ;
                            var cur_c1 = __page_request_values["c1"] ;
                            var cur_f1 = __page_request_values["f1"] ;                            
                            var cur_f4 = __page_request_values["f4"] ;       
                            if( cur_c != oid || cur_c1 != custom_cat ) {     
                                if( oid == 0 ) { filter_breadcrumb( cur_c, '', 'bodyregion', 'remove' ) ; }                             
                                setPageRequestValue( "c", oid ) ;
                                setPageRequestValue( "c1", custom_cat ) ;
                                if( custom_cat > 0 ) {
                                    filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;                        
                                    filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                                    if( cur_f1 > 0 ) { setPageRequestValue( "f1", 0 ) ; }
                                    if( cur_f4 > 0 ) { setPageRequestValue( "f4", 0 ) ; }
                                    $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                                    $("#predesigned_filters--types-mobile").val( 0 ).trigger( "change" ) ;                                    
                                    var highlight_image = options["assets_cdn"] + "bodyregion_highlights/bodyregion--empty.png" ;
                                    var title_label = title ;
                                    $(".ptlinked--m_bodyregion_highlight").find( "img" ).attr( "src", highlight_image ) ;
                                    $(".ptlinked--m_bodyregion_highlight").find( ".highlight-label" ).html( title_label ) ;     
                                    $(".ptlinked--m_bodyregion_highlight").show( ) ;   
                                } else {
                                    filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                                    if( cur_f4 > 0 ) { setPageRequestValue( "f4", 0 ) ; }
                                    var __item_found = false ;
                                    __bodyregion_info[oid]["types"].forEach( function(item, index, arr){
                                        if( item["type_id"] == cur_f1 ) {
                                            __item_found = true ;
                                        }
                                    });
                                    if( !__item_found ){ 
                                        // Remove BreadCrumb
                                        filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                                        if( cur_f1 > 0 ) { setPageRequestValue( "f1", 0 ) ; }
                                        $("#predesigned_filters--types-mobile").val( 0 ).trigger( "change" ) ;                                        
                                    }                        
                                    $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                                    __page_request_values["f4"] = 0 ;                                    
                                    // Update highlight and label
                                    var highlight_image = options["assets_cdn"] + "bodyregion_highlights/" + $("#predesigned_filters--bodyregion-mobile").find( ":selected" ).data( "highlight" ) ;
                                    var title_label = $("#predesigned_filters--bodyregion-mobile").find( ":selected" ).data( "title" ) ;
                                    $(".ptlinked--m_bodyregion_highlight").find( "img" ).attr( "src", highlight_image ) ;
                                    $(".ptlinked--m_bodyregion_highlight").find( ".highlight-label" ).html( title_label ) ;     
                                    $(".ptlinked--m_bodyregion_highlight").show( ) ;
                                }
                                filter_breadcrumb( oid, title, type, 'add' ) ;                                                                         
                                current_index = 0 ;                                
                                requestPrograms( ) ;                                                            
                                // Auto Close Mobile filter panel
                                if( $(".mobile-filter-panel").hasClass( "opened" ) ) {
                                    $(".mobile-filter-panel").removeClass( "opened" ) ;
                                }                                
                                // Display or hide clear all filters link
                                var clear = mbodyregion.parent( ).parent().find( ".mobile-filter--clear" ) ;
                                if( oid == 0 ) {
                                    if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                                    // Reset Body Highlight
                                    var highlight_image = options["assets_cdn"] + "bodyregion_highlights/bodyregion--empty.png" ;
                                    var title_label = "All Programs" ;
                                    $(".ptlinked--m_bodyregion_highlight").find( "img" ).attr( "src", highlight_image ) ;
                                    $(".ptlinked--m_bodyregion_highlight").find( ".highlight-label" ).html( title_label ) ;     
                                    $(".ptlinked--m_bodyregion_highlight").show( ) ;   
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
            $("ul.category-bubbles-list li").unbind( "hover" ).hover( function(event){
                event.stopPropagation( ) ;
                var $this = $(this) ;
                __filter_timer = setTimeout( function(){
                    calc_dropdown_position( $this ) ;
                }, __filter_delay ) ;
            }, function(){
                clearTimeout( __filter_timer ) ;                
            });

            $("ul.category-bubbles-list li").unbind( "click" ).on( "click", function(){
                var oid = $(this).data( "oid" ) ;                
                var custom_cat = $(this).data( "customcat" ) ;
                var title = $(this).data( "title" ) ;
                var type = $(this).data( "type" ) ;
                var cur_c = __page_request_values["c"] ;
                var cur_c1 = __page_request_values["c1"] ;
                var cur_f1 = __page_request_values["f1"] ;                
                var cur_f4 = __page_request_values["f4"] ;                                            
            	if( cur_c != oid || cur_c1 != custom_cat ) {
            		setPageRequestValue( "c", oid ) ;
                    setPageRequestValue( "c1", custom_cat ) ;
                    if( custom_cat > 0 ) {
                        filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;                        
                        filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        if( cur_f1 > 0 ) { setPageRequestValue( "f1", 0 ) ; }                        
                        if( cur_f4 > 0 ) { setPageRequestValue( "f4", 0 ) ; }                        
                        $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                        __page_request_values["f4"] = 0 ;                                                                    
                        $("#predesigned_filters--types li").removeClass( "selected" ) ;                        
                    } else {
                        filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                		if( cur_f4 > 0 ) { setPageRequestValue( "f4", 0 ) ; }                		                	                        
                        var __item_found = false ;
                        __bodyregion_info[oid]["types"].forEach( function(item, index, arr){
                            if( item["type_id"] == cur_f1 ) {
                                __item_found = true ;
                            }
                        });
                        if( !__item_found ){ 
                            // Remove BreadCrumb
                            filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                            if( cur_f1 > 0 ) { setPageRequestValue( "f1", 0 ) ; }
                            $("#predesigned_filters--types li").removeClass( "selected" ) ;                            
                            // Select View All element in the type list
                            $("ul.filter--item_list li[data-oid='0']").addClass( "selected" ) ;
                        }                        
                        $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                        __page_request_values["f4"] = 0 ;                        
                    }
                    filter_breadcrumb( oid, title, type, 'add' ) ;
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
                // if filter drop down is visible, hide it
                $(".ptlinked--filter_dropdown").removeClass( "show" ).delay( 500 ).removeClass( "display" ) ;
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
                // if filter drop down is visible, hide it
                $(".ptlinked--filter_dropdown").removeClass( "show" ).delay( 500 ).removeClass( "display" ) ;
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
            if( ( typeof __page_request_values["f4"] !== 'undefined' ) && __page_request_values["f4"] > 0 ) {
                require_clear_all = true ;
            }            
            if( ( typeof __page_request_values["c1"] !== 'undefined' ) && __page_request_values["c1"] > 1 ) {         
                    require_clear_all = true ;      
            }        
            if( _is_mobile ) {
                if( ( typeof __page_request_values["c"] !== 'undefined' ) && __page_request_values["c"] > 0 ) {         
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
        }

        // 2.4 Clear all Selected Filters
        function clearAllFilters( e ) {
            if( $(".navbar-mobile--search_panel").css( "display" ) != "none" ) {
                __page_request_values["c"] = 0 ;                
                __page_request_values["c1"] = 0 ;
            }
            if( __page_request_values["c1"] > 0 ) {
                __page_request_values["c1"] = 1 ;    
            } else {
                __page_request_values["c1"] = 0 ;
            }            
            __page_request_values["f1"] = 0 ;            
            __page_request_values["f4"] = 0 ;            
            current_index = 0 ;            
            selected_filters =  {
                                    bodyregion: {},
                                    type: {},                                    
                                    condition: {}
                                };
            var _p = $(".predesigned--filter_crumbtrail") ;
            var _p_m = $(".mobile-predesigned--filter_crumbtrail") ;
            _p.html( "" ) ; 
            _p_m.html( "" ) ;
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
			__page_request_values["f4"] = 0 ;	// Condition Filter			            
			//Cookies.remove('ptlinkedQueryState');
			Cookies.remove('ptlinkedQueryState', { path: '/', domain: '.ptlinked.com', secure: true } ) ;
			setFilters( ) ;
			routeQuery( ) ;	
        }

        // 2.6 Clear Filter Click Handler
        function handleClearFilter( e ) {
            var drop_down_id = $(this).parent( ).find( "select" ).attr( "id" ) ;
            var param_f = $(this).parent( ).find( ".mobile-filter--value").data( "f" ) ;          
            if( drop_down_id == "predesigned_filters--subcategories-mobile" || drop_down_id == "predesigned_filters--subcategories" ) {
                $("#" + drop_down_id).val( 1 ).trigger( "change" ) ;
            } else {                        
                $("#" + drop_down_id).val( 0 ).trigger( "change" ) ;
            }
            if( $(this).hasClass( "active" ) ) {
                $(this).removeClass( "active" ) ;
            }   
            __page_request_values[param_f] = 0 ;    
            if( param_f == 'c' ) {
                __page_request_values['c1'] = 0 ;    
            } else if( param_f == 'c1' ) {
                __page_request_values['c1'] = 1 ;    
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
            if( s ) {
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

        // 2.7b Load the Filters
        function loadFilterLookups( ) {            
            var url = options["api_root_url"] + "/predesigned/bodyregions/lookup" ;         
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
                    __bodyregion_info = data ;
                }        
            });
        }

        // 2.8 Render the Filter Components
        function renderFilters( html ) {
            // Types
            var types = $("ul.filter--item_list") ;                    
            var mtypes = $("#predesigned_filters--types-mobile") ;
            var $grid_filter = $("#grid-filter") ;
            var $mobile_filter_menu = $(".mobile-filter-panel") ;
            types.html( '<li data-oid="0" data-filter_label="View All" data-filter_type="type" class="selected"><span><i class="fa fa-angle-right mr-3 selection-hover"></i>View All</span></li>' ) ;
            mtypes.html( "<option selected value='0'>Type</option>" ) ;
            $.each( html["types"], function( index, value ) {
                types.append( value ) ;
                mtypes.append( value ) ;
            });
            var $types_li = $("ul.filter--item_list li") ;
            mtypes.select2( ) ; // Mobile Filter Drop Down            
            $types_li.unbind( "click" ).on( "click", function(){
                var oid = $(this).data( "oid" ) ;      
                var title = $(this).data( "filter_label" ) ;
                var type = $(this).data( "filter_type" ) ;          
                var bodyregion_id = $("#selected_bodyregion_id").val( ) ;                
                var bodyregion_title = __bodyregion_info[bodyregion_id]["title"] ;                
                filter_breadcrumb( __page_request_values["c"], "", "bodyregion", 'remove' ) ;
                $("ul.category-bubbles-list li").removeClass( "active-filter" ) ;
                filter_breadcrumb( bodyregion_id, bodyregion_title, "bodyregion", 'add' ) ;                                                
                $("ul.category-bubbles-list li[data-oid='"+bodyregion_id+"'][data-customcat='0']").addClass( "active-filter" ) ;
                __page_request_values["c"] = bodyregion_id ;
                if( __page_request_values["c1"] > 0 ) {
                    __page_request_values["c1"] = 0 ;
                }
                if( typeof __page_request_values["f1"] !== "undefined" ) {
                    if( __page_request_values["f1"] != oid ) {            
                        if( __page_request_values["f1"] == 1 ) {
                            filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                            $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                            __page_request_values["f4"] = 0 ;
                        }            
                        if( oid == 0 ) {
                            filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        } else {
                            filter_breadcrumb( oid, title, type, 'add' ) ;      
                        }
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
                            filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                            $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                            __page_request_values["f4"] = 0 ;
                        }
                        if( oid == 0 ) {
                            filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        } else {
                            filter_breadcrumb( oid, title, type, 'remove' ) ;      
                        }
                        __page_request_values["f1"] = 0 ;                           
                        $types_li.removeClass( "selected" ) ;  
                        $("ul.filter--item_list li[data-oid='0']").addClass( "selected" ) ;             
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }
                } else {
                    if( oid == 0 ) {
                        filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                    } else {
                        filter_breadcrumb( oid, title, type, 'add' ) ;   
                    }
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

            mtypes.unbind( "select2:select" ).on('select2:select', function(e){
                var oid = $("#predesigned_filters--types-mobile").val( ) ;
                var title = $("#predesigned_filters--types-mobile").find( ":selected" ).data( "filter_label" ) ;
                var type = $("#predesigned_filters--types-mobile").find( ":selected" ).data( "filter_type" ) ;
                var bodyregion_id = $("#predesigned_filters--bodyregion-mobile").val( ) ;
                var bodyregion_title = __bodyregion_info[bodyregion_id]["title"] ;
                //filter_breadcrumb( __page_request_values["c"], "", "bodyregion", 'remove' ) ;
                //filter_breadcrumb( bodyregion_id, bodyregion_title, "bodyregion", 'add' ) ;

                if( typeof __page_request_values["f1"] !== "undefined" ) {
                    if( __page_request_values["f1"] != oid ) {
                        if( __page_request_values["f1"] == 1 ) {     
                            filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;                                    
                            $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                            __page_request_values["f4"] = 0 ;                                           
                        }
                        if( oid == 0 ) {
                            filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        } else {
                            filter_breadcrumb( oid, title, type, 'add' ) ;      
                        }
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
                            filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;                                  
                            $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                            __page_request_values["f4"] = 0 ;                                           
                        }
                        if( oid == 0 ) {
                            filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        } else {
                            filter_breadcrumb( oid, title, type, 'remove' ) ;      
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
                    if( oid == 0 ) {
                        filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                    } else {
                        filter_breadcrumb( oid, title, type, 'add' ) ;   
                    }
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

            // Initialize the click handler for the Clear Icons
            $(".mobile-filter--clear").unbind( "click" ).on( "click", handleClearFilter ) ;    

            setFilters( ) ; // Set the newly loaded filters
        }

        /* 2.9 Refresh the Conditions drop down filter */
        function refreshConditionFilters( conditions_data ) {
            var conditions = $("#filter--condition_type") ;
            var mconditions = $("#predesigned_filters--conditions-mobile") ;
            var $grid_filter = $("#grid-filter") ;
            var $mobile_filter_menu = $(".mobile-filter-panel")                        
            if( typeof conditions_data == 'undefined' ) { $("#condition-filter").hide( ) ; conditions_data = false; } 
            else if( !conditions_data ) { $("#condition-filter").hide( ) ; }
            else { $("#condition-filter").show( ) ; }
            conditions.html( "<option selected value='0'>Filter by condition</option>" ) ;
            mconditions.html( "<option selected value='0'>Condition</option>" ) ;
            $.each( conditions_data, function( index, value ) {
                conditions.append( value ) ;
                mconditions.append( value ) ;
            }); 
            if( conditions_data.length < 1 || conditions_data == false ) {                
                $("#predesigned_filters--conditions-mobile").prop( "disabled", true ) ;                
            } else {                
                $("#predesigned_filters--conditions-mobile").prop( "disabled", false ) ;                
            }
            conditions.select2( ) ;
            mconditions.select2( ) ;
            conditions.unbind( "select2:select" ).on('select2:select', function(e){
                var oid = $("#filter--condition_type").val( ) ;        
                var title = $("#filter--condition_type").select2().find(":selected").data("title") ;
                var type = $("#filter--condition_type").select2().find(":selected").data("type") ; 
                var bodyregion_id = $("#selected_bodyregion_id").val( ) ;                
                var bodyregion_title = $(".ptlinked--dropdown_bodyregion_highlight").find( ".highlight-label" ).html( ) ;                
                // Auto-select body region bubble
                filter_breadcrumb( __page_request_values["c"], "", "bodyregion", 'remove' ) ;
                $("ul.category-bubbles-list li").removeClass( "active-filter" ) ;
                filter_breadcrumb( bodyregion_id, bodyregion_title, "bodyregion", 'add' ) ;                                                
                $("ul.category-bubbles-list li[data-oid='"+bodyregion_id+"'][data-customcat='0']").addClass( "active-filter" ) ;
                __page_request_values["c"] = bodyregion_id ;

                if( typeof __page_request_values["f4"] !== "undefined" ) {
                    if( __page_request_values["f4"] != oid ) {         
                        if( $(".clear-condition-filters").hasClass( "hide" ) ) {
                            $(".clear-condition-filters").removeClass( "hide" ) ;
                        }
                        __page_request_values["f4"] = oid ;
                        filter_breadcrumb( oid, title, type, 'add' ) ; 
                        // Make sure TYPE=Condition Specific
                        $("ul.filter--item_list li").removeClass( "selected" ) ;
                        $("ul.filter--item_list").find( "li[data-oid=1]" ).addClass( "selected" ) ;
                        filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        __page_request_values["f1"] = 1 ;
                        //filter_breadcrumb( 1, "Condition Specific", "type", 'add' ) ;
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }  else {                        
                        //__page_request_values["f4"] = 0 ;             
                        // Make sure TYPE=Condition Specific
                        $("ul.filter--item_list li").removeClass( "selected" ) ;
                        if( __page_request_values["f4"] > 0 ) {
                            $("ul.filter--item_list").find( "li[data-oid=1]" ).addClass( "selected" ) ;
                            __page_request_values["f1"] = 1 ;
                            //filter_breadcrumb( 1, "Condition Specific", "type", 'add' ) ;
                        }
                        if( $grid_filter.hasClass( "open" ) ) {
                            $grid_filter.removeClass( "open" ) ;
                        }
                        current_index = 0 ;
                        requestPrograms( ) ;
                    }
                } else {                    
                    __page_request_values["f4"] = oid ;        
                    if( $(".clear-condition-filters").hasClass( "hide" ) ) {
                        $(".clear-condition-filters").removeClass( "hide" ) ;
                    }
                    filter_breadcrumb( oid, title, type, 'add' ) ;   
                    // Make sure TYPE=Condition Specific            
                    $("ul.filter--item_list li").removeClass( "selected" ) ;
                    $("ul.filter--item_list").find( "li[data-oid=1]" ).addClass( "selected" ) ;
                    __page_request_values["f1"] = 1 ;
                    //filter_breadcrumb( 1, "Condition Specific", "type", 'add' ) ;
                    if( $grid_filter.hasClass( "open" ) ) {
                        $grid_filter.removeClass( "open" ) ;
                    }
                    current_index = 0 ;
                    requestPrograms( ) ;
                }   
            });

            mconditions.unbind( "select2:select" ).on('select2:select', function(e){
                var oid = $("#predesigned_filters--conditions-mobile").val( ) ;     
                var title = $("#predesigned_filters--conditions-mobile").select2().find(":selected").data("title") ;
                var type = $("#predesigned_filters--conditions-mobile").select2().find(":selected").data("type") ; 
                var bodyregion_id = $("#predesigned_filters--bodyregion-mobile").val( ) ;
                var bodyregion_title = __bodyregion_info[bodyregion_id]["title"] ;

                if( typeof __page_request_values["f4"] !== "undefined" ) {
                    if( __page_request_values["f4"] != oid ) {                                                                        
                        if( oid == 0 ) {                            
                            filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                        } else {
                            filter_breadcrumb( oid, title, type, 'add' ) ;
                        }                    
                        __page_request_values["f4"] = oid ;
                        filter_breadcrumb( __page_request_values["f1"], "", "type", 'remove' ) ;
                        __page_request_values["f1"] = 1 ; // Set Type to Condition Specific                        
                        $("#predesigned_filters--types-mobile").val( 0 ).trigger( "change" ) ;
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
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }
                    } else {                                
                        if( oid == 0 ) {                            
                            filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                        } else {
                            filter_breadcrumb( oid, title, type, 'add' ) ;
                        }
                        __page_request_values["f4"] = 0 ;           
                        __page_request_values["f1"] = 1 ; // Set Type to Condition Specific                        
                        $("#predesigned_filters--types-mobile").val( 0 ).trigger( "change" ) ;                                  
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
                        if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }
                    }
                } else {
                    if( oid == 0 ) {                        
                        filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                    } else {
                        filter_breadcrumb( oid, title, type, 'add' ) ;
                    }
                    __page_request_values["f4"] = oid ;                     
                    filter_breadcrumb( oid, title, type, 'add' ) ;   
                    __page_request_values["f1"] = 1 ; // Set Type to Condition Specific                    
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
                    if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }
                }               
            });

            $(".clear-condition-filters").unbind( "click" ).on( "click", function(){
                filter_breadcrumb( __page_request_values["f4"], "", "condition", 'remove' ) ;
                $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                __page_request_values["f4"] = 0 ;
                __page_request_values["f1"] = 0 ;
                $("ul.filter--item_list li").removeClass( "selected" ) ;
                $("ul.filter--item_list").find( "li[data-oid=0]" ).addClass( "selected" ) ;
                if( !$(".clear-condition-filters").hasClass( "hide" ) ) {
                    $(".clear-condition-filters").addClass( "hide" ) ;
                }
                if( $grid_filter.hasClass( "open" ) ) {
                    $grid_filter.removeClass( "open" ) ;
                }
                current_index = 0 ;
                requestPrograms( ) ;
            });

            //$("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;            
            if( ( typeof __page_request_values["f4"] !== 'undefined' ) && __page_request_values["f4"] > 0 ) {
                $("#filter--condition_type").val( __page_request_values["f4"] ).trigger( "change" ) ;          
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

        /* 2.10 Refresh the Custom Subcategories drop down filter */
        function refreshSubcategoriesFilters( subcategories_data ) {
            var subcategories = $("#predesigned_filters--subcategories") ;
            var msubcategories = $("#predesigned_filters--subcategories-mobile") ;
            var $grid_filter = $("#grid-filter") ;
            var $mobile_filter_menu = $(".mobile-filter-panel")
            subcategories.html( "<option selected value='1'>Filter by sub-category</option>" ) ;
            msubcategories.html( "<option selected value='1'>Filter by sub-category</option>" ) ;
            $.each( subcategories_data, function( index, value ) {
                subcategories.append( value ) ;
                msubcategories.append( value ) ;
            }); 
            subcategories.select2( ) ;
            msubcategories.select2( ) ;
            subcategories.on('select2:select', function(e){
                var oid = $("#predesigned_filters--subcategories").val( ) ;                                
                __page_request_values["c1"] = oid ;                         
                if( $grid_filter.hasClass( "open" ) ) {
                    $grid_filter.removeClass( "open" ) ;
                }
                current_index = 0 ;
                requestPrograms( ) ;                
            });

            msubcategories.on('select2:select', function(e){
                var oid = $("#predesigned_filters--subcategories-mobile").val( ) ;                     
                __page_request_values["c1"] = oid ;                                     
                current_index = 0 ;
                requestPrograms( ) ;
                // Close Filter Menu
                if( $mobile_filter_menu.hasClass( "opened" ) ) {
                    $mobile_filter_menu.removeClass( "opened" ) ;
                }
                // Clear button
                var clear = msubcategories.parent( ).parent().find( ".mobile-filter--clear" ) ;
                if( oid == 1 ) {
                    if( clear.hasClass( "active" ) ) { clear.removeClass( "active" ) ; }            
                } else {                                
                    if( !clear.hasClass( "active" ) ) { clear.addClass( "active" ) ; }
                }                
            });
            
            if( ( typeof __page_request_values["c1"] !== 'undefined' ) && __page_request_values["c1"] > 1 ) {
                $("#predesigned_filters--subcategories").val( __page_request_values["c1"] ).trigger( "change" ) ;          
            }
            $("#predesigned_filters--subcategories-mobile").val( __page_request_values["c1"] ).trigger( "change" ) ;
            if( __page_request_values["c1"] > 1 ) {
                if( !$("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                }
            } else {
                if( $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }
            }
        }

        /* 2.11 Set the filters based on the loaded criteria */
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
                    // Reset the Body Region Highlight graphic for mobile
                    var highlight_image = options["assets_cdn"] + "bodyregion_highlights/bodyregion--empty.png" ;
                    var title_label = "All Programs" ;
                    $(".ptlinked--m_bodyregion_highlight").find( "img" ).attr( "src", highlight_image ) ;
                    $(".ptlinked--m_bodyregion_highlight").find( ".highlight-label" ).html( title_label ) ;     
                    $(".ptlinked--m_bodyregion_highlight").show( ) ;
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

                // Set the SUB-CATEGORIES Filter
                $("#predesigned_filters--subcategories").val( 1 ).trigger( "change" ) ;
                if( ( typeof __page_request_values["c1"] !== 'undefined' ) && __page_request_values["c1"] > 0 ) {
                    $("#predesigned_filters--subcategories").val( __page_request_values["c1"] ).trigger( "change" ) ;          
                }
                
                $("#predesigned_filters--subcategories-mobile").val( __page_request_values["c1"] ).trigger( "change" ) ;
                if( __page_request_values["c1"] > 1 ) {
                    if( !$("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).addClass( "active" ) ;
                    }
                } else {
                    if( $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                        $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
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
                
                // Set the CONDITION Filter
                $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
                
                $("#predesigned_filters--conditions-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--conditions-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }

                // Set the SUBCATEGORIES Filter
                $("#predesigned_filters--subcategories").val( 0 ).trigger( "change" ) ;
                
                $("#predesigned_filters--subcategories-mobile").val( 0 ).trigger( "change" ) ;
                if( $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).hasClass( "active" ) ) {
                    $("#predesigned_filters--subcategories-mobile").parent().parent().find( ".mobile-filter--clear" ).removeClass( "active" ) ;
                }
            }
        }

        // 2.12 Load the Custom Category Filter Block
        function toggleCustomCategoryFilters( ) {
            var filter_drop_down = $(".grid-filter--drop_down") ;
            var mfilter_drop_down_list = $("ul.mobile-filter-panel_list") ;
            var c1 = __page_request_values["c1"] ;
            if( c1 > 0 ) { // Display Sub-Categories drop down
                // Desktop
                if( !filter_drop_down.hasClass( "custom-category-displayed" ) ) {
                    filter_drop_down.addClass( "custom-category-displayed" ) ;
                }
                if( !filter_drop_down.find( ".filter--drop_down_subcategories-wrapper" ).hasClass( "active" ) ) {
                    filter_drop_down.find( ".filter--drop_down_subcategories-wrapper" ).addClass( "active" ) ;
                }
                if( filter_drop_down.find( ".filter--drop_down_conditions-wrapper" ).hasClass( "active" ) ) {
                    filter_drop_down.find( ".filter--drop_down_conditions-wrapper" ).removeClass( "active" ) ;
                }                        
                // Mobile
                $("#predesigned_filters--types-mobile").prop("disabled", true ) ;
                $("#predesigned_filters--conditions-mobile").prop("disabled", true ) ;                                
            } else { // Display Conditions Drop Down
                // Desktop
                if( filter_drop_down.hasClass( "custom-category-displayed" ) ) {
                    filter_drop_down.removeClass( "custom-category-displayed" ) ;
                }
                if( filter_drop_down.find( ".filter--drop_down_subcategories-wrapper" ).hasClass( "active" ) ) {
                    filter_drop_down.find( ".filter--drop_down_subcategories-wrapper" ).removeClass( "active" ) ;
                }
                if( !filter_drop_down.find( ".filter--drop_down_conditions-wrapper" ).hasClass( "active" ) ) {
                    filter_drop_down.find( ".filter--drop_down_conditions-wrapper" ).addClass( "active" ) ;
                }                

                // Mobile                
                $("#predesigned_filters--types-mobile").prop("disabled", false ) ;                
                $("#predesigned_filters--conditions-mobile").prop("disabled", false ) ;                                
            }
        }
        
        // 2.13 Add/Remove bubbles from filter breadcrumb
        function filter_breadcrumb( oid, title, type, mode ) {                                    
            if( mode == "add" ) {
                var _atmp = {} ;
                _atmp["oid"] = oid ;
                _atmp["title"] = title ;
                _atmp["type"] = type ;
                selected_filters[type] = _atmp ;                
            } else if( mode == "remove" ) {
                var _atmp = {} ;
                _atmp["oid"] = oid ;
                _atmp["title"] = title ;
                _atmp["type"] = type ;
                remove_filter( oid, type ) ;     
            }            
            render_selected_filters( ) ;
        }

        // 2.14 Remove a filter click handler
        function remove_filter( oid, type ) {  
            if( selected_filters[type]["oid"] == oid ) {
                selected_filters[type] = {} ;
            }                           
            render_selected_filters( ) ;
        }
        
        // 2.15 Render Selected Filter Breadcrumb
        function render_selected_filters(){
            var _p = $(".predesigned--filter_crumbtrail") ;
            var _p_m = $(".mobile-predesigned--filter_crumbtrail") ;
            var _a = selected_filters ;

            _p.html( "" ) ; // Clear all bubbles
            _p_m.html( "" ) ;

            if( typeof _a["bodyregion"]["oid"] !== 'undefined' ) {
                if( _a["bodyregion"]["oid"] != 0 ) {
                    var _tmp = '<li class="service-bubble" data-oid="'+_a["bodyregion"]["oid"]+'" data-type="'+_a["bodyregion"]["type"]+'"><span class="bubble-button-label">'+_a["bodyregion"]["title"]+'</span><span class="remove_filter"><i class="fa fa-times"></i></span></li>' ;
                    _p.append( _tmp ) ;
                    _p_m.append( _tmp ) ;
                }
            }

            if( typeof _a["type"]["oid"] !== 'undefined' ) {
                var _tmp = '<li class="service-bubble" data-oid="'+_a["type"]["oid"]+'" data-type="'+_a["type"]["type"]+'"><span class="bubble-button-label">'+_a["type"]["title"]+'</span><span class="remove_filter"><i class="fa fa-times"></i></span></li>' ;
                _p.append( _tmp ) ;
                _p_m.append( _tmp ) ;
            }            

            if( typeof _a["condition"]["oid"] !== 'undefined' ) {
                var _tmp = '<li class="service-bubble" data-oid="'+_a["condition"]["oid"]+'" data-type="'+_a["condition"]["type"]+'"><span class="bubble-button-label">'+_a["condition"]["title"]+'</span><span class="remove_filter"><i class="fa fa-times"></i></span></li>' ;
                _p.append( _tmp ) ;
                _p_m.append( _tmp ) ;
            }

            $("ul.predesigned--filter_crumbtrail li.service-bubble span.remove_filter").unbind( "click" ).on( "click", remove_filter_bubble ) ;
            $("ul.mobile-predesigned--filter_crumbtrail li.service-bubble span.remove_filter").unbind( "click" ).on( "click", remove_filter_bubble ) ;
        }

        // 2.16 Render Selected Filter Breadcrumb
        function remove_filter_bubble( ) {
            var oid = $(this).parent().data( "oid" ) ;
            var type = $(this).parent().data( "type" ) ;            
            switch( type ) {
                case "bodyregion": {
                    __page_request_values["c"] = 0 ;    // Selected Category    
                    __page_request_values["c1"] = 0 ;    // Selected Category    
                    if( __page_request_values["f1"] == 1 ) {
                        remove_filter( __page_request_values["f4"], "condition" ) ;
                        __page_request_values["f4"] = 0 ;   
                        remove_filter( 1, "type" ) ;
                        __page_request_values["f1"] = 0 ;   
                    }           
                } break ;
                case "type": {
                    // type == condition specific, set condition filter to zero
                    __page_request_values["f1"] = 0 ;   // Type Filter
                    if( __page_request_values["f1"] == 1 ) {
                        remove_filter( __page_request_values["f4"], "condition" ) ;
                        __page_request_values["f4"] = 0 ;                   
                        remove_filter( 1, "type" ) ;
                        __page_request_values["f1"] = 0 ;   
                    }
                } break ;                
                case "condition": {
                    remove_filter( __page_request_values["f4"], "condition" ) ;
                    __page_request_values["f4"] = 0 ;   // Condition Filter
                    remove_filter( 1, "type" ) ;
                        __page_request_values["f1"] = 0 ;   
                } break ;                
            }
            remove_filter( oid, type ) ;
            setFilters( ) ;
            render_selected_filters( ) ;     
            requestPrograms( ) ;    
        };

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
                        current_index = 0 ;
                        routeQuery( ) ;
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
                        current_index = 0 ;
                        routeQuery( ) ;
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
            }   

            url += "&i=" + current_index + "&m=" + record_chunks ;

            $('#header-search').blur( ) ;
            $('#mheader-search').blur( ) ;
            $(".ui-menu.search-bar-autocomplete").blur( ) ; 

            $.ajax({
                type: "GET",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 
                            'ptlinked-utype-x': options["user_type"] }, 
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
                        toggleCustomCategoryFilters( ) ;
                        refreshConditionFilters( data["conditions"] ) ;   
                        refreshSubcategoriesFilters( data["subcategories"] ) ;
                        if( !__error_detected ) {
                            toggle_info_box( "predesigned--results_display" ) ;                        
                        }
                    } else if( status == 201 ) {                   
                        processLoadMore(0, 0);          
                        toggleCustomCategoryFilters( ) ;                   
                        refreshConditionFilters( data["conditions"] ) ;                                   
                        refreshSubcategoriesFilters( data["subcategories"] ) ;
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
            var exercise_program_code = $(this).data( "code" ) ;
            var exercise_program_title = $(this).find( ".cards--program_title").text( ) ;
            if( exercise_program_id > 0 ) {
                __exercise_program_id = exercise_program_id ;
                loadExerciseProgram( ) ;
                var data = [];
                data["title"] = exercise_program_title ;
                data["url"] =  options["app_root_url"] + "?e=" + exercise_program_code ;                
                hook('onViewExerciseProgram', data);
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
            var url = options["api_root_url"] + "/exerciseprogram/"+__exercise_program_id+"/html3" ;   

            $.ajax({
                type: "GET",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 
                            'ptlinked-utype-x': options["user_type"], 'ptlinked-videobg-x': options["video_bg"] }, 
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

        // 4.2 Load Exercise Program
        function loadExerciseProgramCode( ) {
            var url = options["api_root_url"] + "/exerciseprogram/resolve_code/"+__exercise_program_code ;   

            $.ajax({
                type: "GET",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 
                            'ptlinked-utype-x': options["user_type"] }, 
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
                        var id = data ;
                        if( id > 0 ) {
                            __exercise_program_id = id ;
                            loadExerciseProgram( ) ;
                        }                        
                    }
                }        
            });
        }

        // 4.3 Render the exercise Program
        function renderExerciseProgram( d ) {            
            $("h1.viewer--header__title").html( d["meta"]["title"] ) ;
            __exercise_program_code = d["meta"]["code"] ;
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

            if( !$(".mdvip--viewer_overaly").hasClass( "display" ) ) {
                $(".mdvip--viewer_overaly").addClass( "display" ) ;
            }

            calc_viewer_container_height( ) ; // Calculate the viewers container height

            viewer.find( "a#viewer--close_btn" ).unbind( "click" ).on( "click", function( ) {
                if( viewer.hasClass( "displayed" ) ) {
                    viewer.removeClass( "displayed" ) ;
                }                
                if( $(".mdvip--viewer_overaly").hasClass( "display" ) ) {
                    $(".mdvip--viewer_overaly").removeClass( "display" ) ;
                }
            });
            $("#viewer--exercise_container_wrapper").scrollTop( 0 ) ;
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
            if( s ) {
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
            var exercise_block_offset = $(".viewer--exercise_item[data-oid='"+id+"']").offset().top ;
            var container_offset = $("#viewer--exercise_container_wrapper").offset().top ;
            var container_scrollTop = $("#viewer--exercise_container_wrapper").scrollTop();
            var position = exercise_block_offset 
                - container_offset 
                + container_scrollTop ;
            $('#viewer--exercise_container_wrapper').animate({scrollTop: position },'slow');
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
            // reset scroll position
            if( $(_root).find(".left-arrow").hasClass( "show-arrow" ) ) {
                $(_root).find(".left-arrow").removeClass( "show-arrow" ) ;
            }
            scrollContainer.scrollLeft( 0 ) ;

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
                            var data = [];
                            data["exercise_program_link"] = options["app_root_url"] + "?e=" + __exercise_program_code ;
                            data["user_id"] = options["user_uid"] ;
                            data["exercise_program_title"] = $(".ptlinked--exercise_program_viewer").find("h1.viewer--header__title").text( ) ;                            
                            hook('onSaveProgram', data);
                            display_dialog( "Exercise Program Saved", "This exercise program has been successfully saved to your \"My Favorites\" folder." ) ;
                        } else if( status == 201 ) {                
                            display_dialog( "Exercise Program Already Saved", "This exercise program has already been saved to your \"My Favorites\" folder." ) ;
                        }
                    }        
                });
            });

            $(".btn-print_program").unbind( "click" ).on( "click", function(e) {                
                var url = options["api_root_url"] + "/exerciseprogram/print/" + __exercise_program_id + "-" + options["user_uid"] ;   
                var data = {} ;
                data["exercise_program_link"] = options["app_root_url"] + "?e=" + __exercise_program_code ;
                data["user_id"] = options["user_uid"] ;
                data["exercise_program_title"] = $(".ptlinked--exercise_program_viewer").find("h1.viewer--header__title").text( ) ;
                hook('onPrintProgram', data);
                //window.open( url, "PDF Viewer" ) ;         
                print_program( )
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
                        data["exercise_program_link"] = options["app_root_url"] + "?e=" + __exercise_program_code ;
                        data["exercise_program_title"] = $("h1.viewer--header__title").text( ) ;
                        hook('onSendProgram', data);
                    }        
                });                
            });
        }

        function print_program( ) {
            var url = options["api_root_url"] + "/exerciseprogram/print_program" ;
            var parameters = fetch_parameters( ) ;
            $.ajax({
                type: "POST",
                crossDomain: true,
                headers: { 'token-authorization-x': options["api_key"], 'ptlinked-uid-x': options["user_uid"], 'ptlinked-utype-x': options["user_type"] }, 
                url: url,
                data: { 'exercise_program_id': __exercise_program_id, 'parameters' : parameters },
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
                    window.open( data, "_blank" ) ;
                }        
            });   
        }

        function fetch_parameters( ) {
            var exercise_parameters = {} ;
            $(".viewer--exercise_item").each( function(){
                var oid = $(this).data( "oid" ) ;
                exercise_parameters[oid] = {} ;
                $(this).find( ".workout-exercise__param-set" ).find( "input.parameter-input").each( function(){
                    var _tmp = {} ;
                    var _p_index = $(this).data( "param_index" ) ;
                    _tmp["id"] = $(this).attr( "id" ).replace( "param-", "" ) ;
                    _tmp["value"] = $(this).val( ) ;
                    exercise_parameters[oid][_p_index] = _tmp ;
                });
            });
            return exercise_parameters ;
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
            $bel.append( __build_filter_dropdown( ) ) ;                    
        }

        // 5.2 Build mobile search panel HTML
        function __build_mobile_search_panel( ) {
            var mobile_search_panel_html = "" ;
            mobile_search_panel_html = '<div class="navbar-mobile--search_panel">' +
                '<div class="input-group search-input__outer-container">' +
                    //'<div class="input-group-prepend">' +
                    //    '<button class="btn btn-secondary search-input__search-button" id="ptl-mobile_filter_button" type="button">' +
                    //        '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sliders-h" class="svg-inline--fa fa-sliders-h fa-w-16 icon--search" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"></path></svg>' +
                    //    '</button>' +
                    //'</div>' +                                      
                    '<input label="search" type="text" class="form-control search-input__search-container" id="mheader-search" placeholder="Find an exercise program">' +
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
                '<div id="mobile-predesigned--filter_link">' +
                    '<div class="mobile-filter-link"><i class="fa fa-sliders"></i>FILTERS</div>' +
                '</div>' +
                '<div id="mobile-predesigned--crumbtrail_bubbles">' +
                    '<ul class="mobile-predesigned--filter_crumbtrail"></ul>' +                                    
                '</div>' +
            '</div>' ;

            return mobile_search_panel_html ;
        }

        // 5.3 Build Category Slider HTML
        function __build_category_slider( ) {
            var mode = "" ;
            if( options["category_slider_style"] == "mdvip" ) {
                mode = "mdvip" ;
            }
            var category_slider_html = "" ;
            category_slider_html = '<div class="scroll-container '+mode+'">' +
                '<div class="divider-line"></div>' +
                '<div class="left-arrow"><svg class="icon icon--mdvip-arrow-left" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="chevron-left" class="svg-inline--fa fa-chevron-left fa-w-8" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path fill="currentColor" d="M238.475 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L50.053 256 245.546 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L10.454 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path></svg><svg class="icon icon--arrow-left" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"></path></svg></div>' +
                '<ul class="category-bubbles-list container-fluid"></ul>' +
                '<div class="right-arrow show-arrow"><svg class="icon icon--mdvip-arrow-right" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="chevron-right" class="svg-inline--fa fa-chevron-right fa-w-8" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path fill="currentColor" d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z"></path></svg><svg class="icon icon--arrow-right" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path></svg></div>' +
            '</div>' ;

            return category_slider_html ;
        }

        // 5.4 Build Filter/Search Bar and Drop Downs HTML
        function __build_filter_block( ) {
            var filter_block_html = "" ;

            filter_block_html = '<div id="grid-filter" class="">' +
                        '<div class="grid-filter--wrapper">' +
                            '<div class="grid-filter--inner_wrapper">' +     
                                '<div id="predesigned--crumbtrail_bubbles">' +
                                    '<ul class="predesigned--filter_crumbtrail"></ul>' +                                    
                                '</div>' +
                                '<div class="grid-filter--search_wrapper">' +
                                    '<div class="input-group search-input__outer-container">' +
                                        '<input label="search" type="text" class="form-control search-input__search-container" id="header-search" placeholder="Find an exercise program">' +
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
                    '<div id="load-more-records" class="loading-more-wrapper"><div class="btn-load_more_records"><svg aria-hidden="true" focusable="false" data-prefix="fa" data-icon="spinner-third" class="svg-inline--fa fa-spinner-third fa-w-16 fa-spin margin-right-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>Loading...</div></div>' +
                    '<div id="predesigned--no_results_display" class="cards--grid_container info-box-item">' +
                        '<div class="no_results--wrapper container text-left">' +
                            '<div class="no_results-flex_box">' +
                                '<i class="fa fa-exclamation-triangle"></i>' +
                                '<h1 class="no_results--title">No Results</h1>' +
                                '<p>Sorry, we are unable to find any exercise programs with the filters and/or search terms you are using.<br /><br />Please try a different combination of filters and/or search terms.</p>' +                                
                            '</div>' +
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
                    '<li class="double-divider" id="mbtn-close_filter_menu"><span class="mobile-grid_filter_title">Filters</span><span class="mobile--grid_filter_clear" id="mobile--filter_clear">Clear All Filters</span><span class="mobile--grid_filter_close"><i class="fa fa-times-circle"></i></span></li>' +
                    '<li class="single-divider"><div class="mobile-filter--value" data-f="c"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--bodyregion-mobile"></select></div></li>' +
                    '<li class="single-divider types-mobile_dropdown"><div class="mobile-filter--value" data-f="f1"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--types-mobile"></select></div></li>' +
                    '<li class="single-divider conditions-mobile_dropdown active"><div class="mobile-filter--value" data-f="f4"><select style="width: 100%; font-size: 1.4rem; height: 2.5rem;" id="predesigned_filters--conditions-mobile"></select></div></li>' +
                '</ul>' +
                '<input type="hidden" id="selected_bodyregion_id__m" value="" />' +
                '<div class="ptlinked--m_bodyregion_highlight"><div class="highlight-label">Hip</div><img src="'+options["assets_cdn"] + 'bodyregion_highlights/bodyregion--hip.png" /></div>' +
            '</div>' ;

            return results_container_html ;
        }

        // 5.7 Build the Exercise Program Viewer Container
        function __build_exercise_program_viewer( ) {
            var mode = "" ;
            if( options["exercise_program_viewer"] == "modal" ) {
                mode = "mdvip-modal" ;
            }
            var results_container_html = "" ;            
            results_container_html = '<div class="ptlinked--exercise_program_viewer '+mode+'">' +
                '<div class="viewer--header">' +
                    '<div class="viewer--header_inner">' +
                        '<div class="viewer--header_main">' +
                            '<div class="metadata-block-wrapper">' ;                            
                              results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-print_program"><i class="fa fa-print"></i>Print</span>' ;
                            if( !options["training_mode"] && options["save_favorites"] ) {
                                results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-save_program"><i class="fa fa-save"></i>Save</span>' ;
                            }
                            if( !options["training_mode"] && options["secure_messaging"] && ( options["user_type"] == "physician" || options["user_type"] == "staff" )  ) {
                              results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-share_program"><i class="fa fa-share-square"></i>Send</span>' ;
                            }
            results_container_html += '</div>' +
                        '</div>' +  
                          '<div class="viewer--metadata-block-mobile-wrapper">';
                            results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-print_program" data-code="QDG081"><i class="fa fa-print"></i><span class="label">Print</span></span>' ;
                            if( !options["training_mode"] && options["save_favorites"] ) {
                                results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-save_program" data-code="QDG081"><i class="fa fa-save"></i>Save</span></span>' ;
                            }
                            if( !options["training_mode"] && options["secure_messaging"] && ( options["user_type"] == "physician" || options["user_type"] == "staff" ) ) {
                              results_container_html += '<span class="metadata-block text-right margin-left-20 is-clickable btn-share_program" data-code="QDG081"><i class="fa fa-share-square"></i><span class="label">Send</span></span>' ;
                            }
    results_container_html += '</div>' +
                              '<div class="viewer--close_button">' +
                                '<a href="javascript:;" id="viewer--close_btn">' +
                                    '<i class="fa fa-times-circle"></i>' +
                                '</a>' +
                              '</div>' +
                        '</div>' +
                        '<div class="viewer--header__title-wrapper">' +
                          '<h1 class="viewer--header__title viewer--program_title"></h1>' +                          
                    '</div>' +
                '</div>' +
                '<div id="viewer--header" class="viewer--header_bar">' +
                    '<div id="viewer--filmstrip" class="viewer--filmstrip_container">' +
                        '<div class="workout-preview__filmstrip">' +
                            '<div class="left-arrow"><i class="fa fa-chevron-left"></i></div>' +
                            '<ul class="workout-preview__thumbs" id="workout-preview__thumbslider"></ul>' +
                            '<div class="right-arrow"><i class="fa fa-chevron-right"></i></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="viewer--exercise_container" id="viewer--exercise_container_wrapper"></div>' +
            '</div>' ;

            results_container_html += '<div class="mdvip--viewer_overaly"></div>' ;

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

        // 5.9 Build Filter Drop Down
        function __build_filter_dropdown( ) {
            var __filter_dropdown = '<div class="ptlinked--filter_dropdown">' +
                                        '<i class="arrow up left"></i>' +
                                        '<div class="ptlinked-dropdown_wrapper">' +
                                        '<input type="hidden" id="selected_bodyregion_id" value="" />' +
                                            '<div class="ptlinked--dropdown_bodyregion_highlight"><div class="highlight-label">Hip</div><img src="'+options["assets_cdn"] + 'bodyregion_highlights/bodyregion--hip.png" /></div>' +
                                            '<div class="ptlinked--dropdown_filters" id="type-filter">' +
                                                '<div class="ptlinked--filter_group">' +
                                                    '<div class="filter-label">View By Type</div>' +
                                                    '<ul class="filter--item_list">' +                                                        
                                                    '</ul>' +
                                                '</div>' +
                                                '<div class="ptlinked--filter_group" id="condition-filter">' +
                                                    '<div class="filter-label">View By Condition</div>' +
                                                    '<select id="filter--condition_type">' +
                                                        '<option value="0">Select a condition or diagnosis here</option>' +
                                                    '</select>' +
                                                    '<div class="clear-condition-filters hide" title="clear condition filter"><svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="times" class="svg-inline--fa fa-times fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"></path></svg></div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' ;

            return __filter_dropdown ;
        }

		function start( ) {
            if( options["debug_mode"] ) { console.log( "----- Rendering User Interface") ; }
            render( ) ; // Render Interface
            
            if( options["debug_mode"] ) { console.log( "----- Register User Session") ; }
            registerUser( ) ;  
        }

		// Initialize plugin.		
		function init() {
			if( options["debug_mode"] ) { console.log( "::::: Plugin Initialization :::::") ; }
            // Reset all page request flags
            __page_request_values["c"] = 0 ;    // Selected Category
            __page_request_values["c1"] = 0 ;   // Category Type (0='reg' or 1='custom')
            __page_request_values["v"] = "" ;   // Search String
            __page_request_values["f1"] = 0 ;   // Type Filter            
            __page_request_values["f4"] = 0 ;   // Condition Filter            
            current_index = 0 ; // Current Index Count
            record_chunks = 25 ; // Total Records to load                 
            selected_filters =  {
                                    bodyregion: {},
                                    type: {},                                    
                                    condition: {},
                                    myfavorites: {},
                                    customcat: {}
                                };                 

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
            loadFilterLookups( ) ;
            
            if( options["debug_mode"] ) { console.log( "----- Requesting Initial Search Results") ; }
            routeQuery( ) ; // Initiate Search
            
            if( options["debug_mode"] ) { console.log( "----- Initialize Scroll Monitor") ; }
            initScrollMonitor( ) ; // Initialize ScrollMonitor

            if( options["debug_mode"] ) { console.log( "----- Initialize Hover Monitor") ; }
            mouseHoverEventMonitor( ) ;
            
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
			$("#mobile-predesigned--filter_link").unbind( "click" ).on( "click", function(){		
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

            const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;
            if( options["debug_mode"] ) { if( isMobile ) { console.log( "----- Mobile Device Detected" ) ; } else { console.log( "----- Desktop Device Detected" ) ; } }
            return isMobile ;            
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
                        init( ) ;
                    } else if( status == 201 ) {                
                        
                    }
                }        
            });
        }
        
        // 6.8 Process URL Query Variables
        function process_url_query( ) {            
            if( Object.keys(__page_request_query_values).length > 0 ) {                
                if( typeof __page_request_query_values["e"] != 'undefined' ) {
                    var code = __page_request_query_values["e"] ;                    
                    if( code != '' ) {
                        __exercise_program_code = code ;
                        loadExerciseProgramCode( ) ;
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
            var h_page_header = 0.0 ;
            var hdr_classes = options["header_element_class"].split( "," ) ;
            /*
            if( hdr_classes.length > 1 ) {
                var tmpH =  0.0 ;
                for( var i = 0 ; i < hdr_classes.length ; i++ ) {
                    var tmp_hdr = $("#" + hdr_classes[i].trim() ) ;
                    if( tmp_hdr.length ) {
                        tmpH += Math.round( tmp_hdr.outerHeight( ) ) ;
                    }
                }
                h_page_header = tmpH ;
            } else {
                
            }*/
            h_page_header = Math.round( $("#block-siteheader").outerHeight( ) ) ;
            if( options["debug_mode"] ) { console.log( "----- Calculated Page Header Height: " + h_page_header ) ; }
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
            //var h_full_page = Math.round( $(".ptlinked--exercise_program_viewer.mdvip-modal").outerHeight( ) ) ;            
            var h_full_page = Math.round( $(window).height() ) ;            
            //var h_full_page = 955; //Math.round( $(".ptlinked--exercise_program_viewer.mdvip-modal").outerHeight() ) ;
            var h_viewer_header = Math.round( $(el_viewer_header).outerHeight( ) ) ;
            var el_viewer_thumb_bar = $("."+options["viewer_thumb_scroller_class"]) ;
            var h_viewer_thumb_bar = Math.round( $(el_viewer_thumb_bar).outerHeight( ) ) ;            
            if( options["debug_mode"] ) { console.log( "----- Calculated Viewer Container Height: " + h_full_page + " - ( " + h_viewer_header + " + " + h_viewer_thumb_bar + " )" ) ; }
            $(".viewer--exercise_container").css( "height", Math.round( h_full_page - ( h_viewer_header + h_viewer_thumb_bar ) ) ) ;
            $(".viewer--exercise_container").on( "scroll", function(){
                $("#workout-preview__thumbslider li.exercise-thumb").removeClass( "selected" ) ;
                $("#workout-preview__thumbslider li.exercise-thumb").each( function(){
                    var id = $(this).data("wrkitem") ;
                    if( isScrolledIntoView( id ) ) {
                        $(this).addClass( "selected" ) ;
                    }
                });
            });
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

        // 6.12 Calculate Drop Down Position
        function calc_dropdown_position( obj ) {                                              
            if( obj.data( "customcat") > 0 ) {            
                $(".ptlinked--filter_dropdown").removeClass( "display show" ) ;                    
                return ;
            }            
            var highlight_image = options["assets_cdn"] + "bodyregion_highlights/" + obj.data( "highlight" ) ;
            var title_label = obj.data( "title" ) ;
            var oid = obj.data( "oid" ) ;             
            $("#selected_bodyregion_id").val( oid ) ;            
            var __offset_plus_height_sliderbar = $(".scroll-container").offset().top + $(".scroll-container").height() - 12;
            var __item_offset_x = obj.offset().left ;
            var viewport_width = $("#ptlinked--application_container").width( ) ;
            var filter_popup_width = $(".ptlinked--filter_dropdown").width( ) ;
            var bubble_width = obj.outerWidth() ;            
            
            
            // Set filter Box TOP position
            $(".ptlinked--filter_dropdown").css( "top", __offset_plus_height_sliderbar ) ;
                
            // Update highlight and label
            $(".ptlinked--dropdown_bodyregion_highlight").find( "img" ).attr( "src", highlight_image ) ;
            $(".ptlinked--dropdown_bodyregion_highlight").find( ".highlight-label" ).html( title_label ) ;     

            // Show/Hide Types based on body region
            var arr_types = __bodyregion_info[oid]["types"] ;
            $("ul.filter--item_list li").each(function(){
                if( !$(this).hasClass( "hidden" ) ) {
                    $(this).addClass( "hidden" ) ;
                }    
            }) ;
            $("ul.filter--item_list li").removeClass( "selected" ) ;
            for( var j = 0 ; j < arr_types.length ; j ++ ) {
                if( $("ul.filter--item_list").find( "li[data-oid='"+arr_types[j]["type_id"]+"']" ).hasClass( "hidden" ) ) {
                    $("ul.filter--item_list").find( "li[data-oid='"+arr_types[j]["type_id"]+"']" ).removeClass( "hidden" ) ;
                }
            }
            if( $("ul.filter--item_list").find( "li[data-oid='0']" ).hasClass( "hidden" ) ) {
                $("ul.filter--item_list").find( "li[data-oid='0']" ).removeClass( "hidden" ) ;
            }
            $("ul.filter--item_list li").removeClass( "selected" ) ;
            $("ul.filter--item_list li[data-oid='"+__page_request_values["f1"]+"']").addClass( "selected" ) ;
            

            // Show/Hide Conditions based on body region
            var arr_conditions = __bodyregion_info[oid]["conditions"] ;
            refreshConditionFilters( arr_conditions ) ;
            if( __page_request_values["f4"] == 0 ) {
                if( !$(".clear-condition-filters").hasClass( "hide" ) ) {
                    $(".clear-condition-filters").addClass( "hide" ) ;
                }
                $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
            } else if( $("#selected_bodyregion_id").val() != __page_request_values["c"] ) {
                if( !$(".clear-condition-filters").hasClass( "hide" ) ) {
                    $(".clear-condition-filters").addClass( "hide" ) ;
                }
                $("#predesigned_filters--conditions").val( 0 ).trigger( "change" ) ;
            } else {
                if( $(".clear-condition-filters").hasClass( "hide" ) ) {
                    $(".clear-condition-filters").removeClass( "hide" ) ;
                }
                $("#predesigned_filters--conditions").val( __page_request_values["f4"] ).trigger( "change" ) ;
            }

            // Calculate off page display and adjust orientation
            if( ( __item_offset_x + filter_popup_width ) > viewport_width ) {                
                $(".ptlinked--filter_dropdown").css( "left", ( __item_offset_x - filter_popup_width ) + bubble_width ) ;
                // Right Arrow
                if( $(".ptlinked--filter_dropdown .arrow").hasClass( "left" ) ) {
                    $(".ptlinked--filter_dropdown .arrow").removeClass( "left" ).addClass( "right" ) ;
                }
                var right_arrow_position = filter_popup_width - ( bubble_width / 2 ) - 10 ;
                $(".ptlinked--filter_dropdown .arrow").css( "left", right_arrow_position + "px" ) ;
            } else {                
                $(".ptlinked--filter_dropdown").css( "left", __item_offset_x ) ;
                // Left Arrow
                if( $(".ptlinked--filter_dropdown .arrow").hasClass( "right" ) ) {
                    $(".ptlinked--filter_dropdown .arrow").removeClass( "right" ).addClass( "left" ) ;
                }
                var left_arrow_position = ( bubble_width / 2 ) - 10 ;
                $(".ptlinked--filter_dropdown .arrow").css( "left", left_arrow_position + "px" ) ;
            }            
            $(".ptlinked--filter_dropdown").addClass( "display show" );                
            //$(".ptlinked--filter_dropdown").addClass( "show" );                    
        }

        // 6.13 Monitor application mouse cursor and hide filter menu if it's displayed
        function mouseHoverEventMonitor( ) {            
            $(document).mousemove(function(){
                var isIE11 = !!navigator.userAgent.match(/Trident.*rv\:11\./);
                if($(".ptlinked--filter_dropdown:hover").length != 0 || $(".scroll-container:hover").length != 0 || $(".select2-container:hover").length != 0 ){
                    
                } else{                    
                    if( !isIE11 ) {
                        if( $(".ptlinked--filter_dropdown").hasClass( "display" ) ) {                        
                            if( $(".select2-container--open").length != 0 ) {
                                $("#filter--condition_type").select2( "close" ) ;
                            }
                            $(".ptlinked--filter_dropdown").removeClass( "show display" );
                        }
                    }
                }
            });
        }

        // 6.14 Is the exercise scrolled into view
        function isScrolledIntoView( elem_id ) {
            var containerHeight = $("#viewer--exercise_container_wrapper").height();
            var elem_position = $(".viewer--exercise_item[data-oid='"+elem_id+"']").offset().top ;
            if( elem_position < containerHeight && ( elem_position > -170 ) ) {
                return true ;
            } else {
                return false ;
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
		start();

		// Expose methods of Plugin we wish to be public.
		return {
			option: option,            
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
        assets_cdn: 'https://0e7822f9ecb8551cd298-03053818a8848e389259d1c57ba1747f.ssl.cf2.rackcdn.com/',
        video_bg: 'white',                                          // The BG color of the exercise video and images (white, grey, blue)        
        header_element_class: 'block-siteheader',                   // Plugin page header class
        viewer_header_element_class: 'viewer--header',              // Plugin exercise program viewer header class
        viewer_thumb_scroller_class: 'viewer--header_bar',          // Plugin exercise program viewer thumbnail slider class
        dialog_box_type: 'bootstrap',                               // Dialog plugin/component to use (bootstrap, jQuery)
        exercise_program_viewer: 'modal',                      // What Exercise Program viewer mode to use (fullscreen, modal)
        category_slider_style: 'mdvip',                          // Category slider style (ptlinked || mdvip)

		onInit: function() {},                                      // On plugin initialization callback
		onDestroy: function() {},                                   // On plugin destroy callback
        onSendProgram: function(data) {},                           // On Send Exercise Program callback
        onSaveProgram: function(data) {},                           // On Save Exercise Program callback
        onPrintProgram: function(data) {},                          // On Print Exercise Program callback
        onShowDialog: function(data) {},                            // Triggered when a dialog box needs to be displayed
        onViewExerciseProgram: function(data) {}                    // Triggered when a user clicks on an exercise program to view it

	};
	
})(jQuery);