/**
 *
 *
 * authentication specific javascript
 */


$(function() {
	var auth = new Form(document.getElementById('authentication'), false),
		form = $(auth.form),
		errors = form.find('.field.error');

	if (errors.length > 0) {
		errors.each(function() {
			var input = form.find('*[name="' + this.dataset['field'] + '"]'),
				field = input[0].parentNode,
				addon = auth.getAddon(field);

			if (addon) {
				auth.addInlineError(field, addon, this.innerText);
				field.classList.add('required');
				this.parentNode.removeChild(this);
			} else {
				this.style.display = 'block';
			}
		});
	}
});
