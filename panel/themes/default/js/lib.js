/**
 * panel theme lib
 * 
 * do stuff on document ready
 */

$(function() {
	$('form.validate').each(function() {
		new Form(this);
	});
});

