<?php 
include_once( get_stylesheet_directory()  . '/vendor/autoload.php' );

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
