
var ptlinked_app = null ;
$(document).ready( function(){

	console.log( "... Initialize Plugin" ) ;
	ptlinked_app = $("#ptlinked--application_container").ptlinkedLibrary({
		api_key: 'e7ae8a7a7be9491c063674a79a657de9',
		api_root_url: 'https://api-mdvip.ptlinked.com',
		app_root_url: 'https://mdvip-plugin.ptlinked.com/test',		
		save_favorites: true,
		secure_messaging: true,		
		training_mode: false,
		debug_mode: true,
		user_type: 'physician',
		user_uid: 'mdvip-phy001',		
		style_sheet: '',
        header_element_class: 'site-header',
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
		onShowDialog: function( data ) {
			console.log( "SHOW DIALOG BOX" ) ;
			console.log( "Title: " + data["title"] ) ;
			console.log( "Content: " + data["content"] ) ;
		}
	}) ;	

});