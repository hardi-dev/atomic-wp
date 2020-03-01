<?php 
include_once( get_stylesheet_directory()  . '/vendor/autoload.php' );

function awp_resources() {
  add_action( 'wp_enqueue_scripts', 'awp_resources' );
	wp_enqueue_style( 'style', get_stylesheet_uri() );
	wp_enqueue_script( 'header_js', get_template_directory_uri() . '/js/header-bundle.js', null, 1.0, false );
  wp_enqueue_script( 'footer_js', get_template_directory_uri() . '/js/footer-bundle.js', null, 1.0, true );
}


// Run the theme setup.
add_filter(
	'loader_directories',
	function ( $directories ) {
		$directories[] = get_template_directory() . '/frontend/components';
		return $directories;
	}
);

add_filter(
	'loader_alias',
	function ( $alias ) {
		$alias['atom']     = 'atoms';
		$alias['molecule'] = 'molecules';
		$alias['organism'] = 'organisms';
		$alias['template'] = 'templates';

		return $alias;
	}
);
