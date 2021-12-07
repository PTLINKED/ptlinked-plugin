<?php
	// SET BY DEFAULT NOT TO CACHE THE PAGES
    header("Cache-Control: no-cache, must-revalidate"); //HTTP 1.1
    header("Pragma: no-cache"); //HTTP 1.0
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past    
    define( "__LIBRARY_LAST_CHANGE__", time() ) ;
?>
<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8"> <![endif]-->
<!--[if !IE]><!-->
<html lang="en">
<!--<![endif]-->
<head>
	<title>MDVIP Test - 1.0.1</title>
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
    <meta name="robots" content="noindex">
	<!-- ================== BEGIN BASE CSS STYLE ================== -->
	<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css" rel="stylesheet" />
	<link href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" >
	<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.13.0/css/all.css" integrity="sha384-IIED/eyOkM6ihtOiQsX2zizxFBphgnv1zbe1bKA+njdFzkr6cDNy16jfIKWu4FNH" crossorigin="anonymous">
	<!--<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">-->
	<link rel="stylesheet" href="css/mdvip-styles.css?d=<?= __LIBRARY_LAST_CHANGE__ ;?>" crossorigin="anonymous">
	<!--<link rel="stylesheet" href="../TEST/vendor/ptlinked/ptlinked-plugin/dist/ptlinked_plugin.min.css?d=<?= __LIBRARY_LAST_CHANGE__ ;?>" crossorigin="anonymous">-->
	<link rel="stylesheet" href="../../src/v1.0.1/ptlinked_plugin.css?d=<?= __LIBRARY_LAST_CHANGE__ ;?>" crossorigin="anonymous">
	<!-- ================== END BASE CSS STYLE ================== -->
</head>
<body>

	<!-- PAGE CONTAINER -->
	<div id="page-container" class="page-header-fixed">		

		<!-- MDVIP TEST HEADER BLOCK -->
		<?php include( "html_includes/header.inc.php" ) ; ?>
		<!-- END MDVIP TEST HEADER BLOCK -->

		<!-- PTLINKED APPLICATION CONTAINER -->
		<div id="ptlinked--application_container" class="ptlinked--application_container"></div>
		<!-- END PTLINKED APPLICATION CONTAINER -->

	</div>
	<!-- END PAGE CONTAINER -->

<!-- ================== BEGIN BASE JS ================== -->
	<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js"></script>
	<!-- PTLINKED PLUGIN -->
	<!--<script src="../TEST/vendor/ptlinked/ptlinked-plugin/dist/jquery-ptlinked_plugin.min.js?d=<?= __LIBRARY_LAST_CHANGE__ ;?>" crossorigin="anonymous"></script>-->
	<script src="../../src/v1.0.1//jquery-ptlinked_plugin.js?d=<?= __LIBRARY_LAST_CHANGE__ ;?>" crossorigin="anonymous"></script>
	<!-- TEST JS -->
	<script src="js/main.js?d=<?= __LIBRARY_LAST_CHANGE__ ;?>" crossorigin="anonymous"></script>
<!-- ================== END BASE JS ================== -->	
	
	<!-- BEGIN SCREEN SIZE INDICATOR -->
	<div id="users-device-size">
	  <div id="xs" class="d-xl-none d-lg-none d-md-none d-sm-none d-block"></div>
	  <div id="sm" class="d-xl-none d-lg-none d-md-none d-sm-block d-none"></div>
	  <div id="md" class="d-xl-none d-lg-none d-md-block d-sm-none d-none"></div>
	  <div id="lg" class="d-xl-none d-lg-block d-md-none d-sm-none d-none"></div>
	  <div id="xl" class="d-xl-block d-lg-none d-md-none d-sm-none d-none"></div>
	</div>
	<!-- END SCREEN SIZE INDICATOR -->
</body>
</html>