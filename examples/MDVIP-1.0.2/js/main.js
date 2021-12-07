
var ptlinked_app = null ;
$(document).ready( function(){
	
	ptlinked_app = $("#ptlinked--application_container").ptlinkedLibrary({
		api_key: '',
		api_root_url: 'https://api-mdvip.ptlinked.com',
		app_root_url: 'https://mdvip-plugin.ptlinked.com/examples/MDVIP-1.0.1',		
		save_favorites: true,
		secure_messaging: true,		
		training_mode: false,
		debug_mode: true,
		//category_slider_style: 'mdvip', // ptlinked || mdvip
		//exercise_program_viewer: 'modal', // fullscreen || modal
		video_bg: 'white',		
		user_type: 'physician',
		user_uid: '00544000008eQ06AAE',				
        header_element_class: 'block-siteheader',
        viewer_header_element_class: 'viewer--header',
        viewer_thumb_scroller_class: 'viewer--header_bar',
        dialog_box_type: 'jquery', // jquery or hook
		onInit: function(){
			console.log( "Plugin has been initialized" ) ;
		},
		onSendProgram: function( data ) {
			console.log( "Send Program" ) ;
			console.dir( data ) ;
		},
		onPrintProgram: function( data ) {
			console.log( "Print Program" ) ;
			console.dir( data ) ;	
		},
		onSaveProgram: function( data ) {
			console.log( "Save Program" ) ;
			console.dir( data ) ;	
		},
		onViewExerciseProgram: function( data ) {
			console.log( "View Program" ) ;
			console.log( "Title: " + data["title"] ) ;
			console.log( "URL: " + data["url"] ) ;
		},
		onShowDialog: function( data ) {
			console.log( "SHOW DIALOG BOX" ) ;
			console.log( "Title: " + data["title"] ) ;
			console.log( "Content: " + data["content"] ) ;
		}
	}) ;	

});