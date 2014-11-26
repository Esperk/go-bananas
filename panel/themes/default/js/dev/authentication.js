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
		if(item.value === '' && !item.classList.contains('.required')) {
			item.classList.add('required');
			errors++;
		} else {
			item.classList.remove('required');
		}
	}
	if (errors === 0) {
		return true;
	}
	return false;
}