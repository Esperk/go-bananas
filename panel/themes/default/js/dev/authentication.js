/*
 * Go Bananas
 *
 * Authentication functions.. maybe global.. but first things first
 */

function validateForm(form) {
	var required = form.querySelectorAll("input[required]"),
		errors = 0;

	for (var i=0,l=required.length;i<l;i++) {
		var item = required[i];
		if(item.value === '' && !item.parentNode.classList.contains('.required')) {
			item.parentNode.classList.add('required');
			errors++;
		} else {
			item.parentNode.classList.remove('required');
		}
	}
	if (errors === 0) {
		return true;
	}
	return false;
}