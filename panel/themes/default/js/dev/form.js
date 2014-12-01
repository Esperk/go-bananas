/*
 * Go Bananas
 *
 * Form
 */
function Form(form) {
	this.form = form;
	this.init();
}

Form.prototype.init = function() {
	var self = this;
	// on submit event
	$(this.form).submit(function (event, done) {
		self.submit(event, done);
	});
};

Form.prototype.submit = function(event, done) {
	if (done) {
		return;
	} else {
		event.preventDefault();
	}
	var self = this,
		form = $(this.form),
		action = form.attr('action') || location.pathname,
		fields = {};

	// pretest
	if(this.isValid()) {
		form
			.find('input, select, textarea')
			.not(':input[type=button], :input[type=submit], :input[type=reset]')
			.each(function() {
				fields[this.getAttribute("name")] = this.value;
			});

		$.ajax(action, {
				contentType: 'application/json',
				type: 'POST',
				data: JSON.stringify(fields),
				dataType: "json"
			})
			.done(function(data) {
				if(data.success === true) {
					$(self.form).trigger('submit', [true]);
				} else {
					for(var key in data.fields) {
						var input = data.fields[key],
							item = self.form.querySelector('*[name="'+input.param+'"]');
						item.parentNode.classList.add('required');
						// TODO: add messages!
					}
				}
			});
	}
};

/**
 *
 */
Form.prototype.isValid = function() {
	var required = this.form.querySelectorAll("input[required]"),
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
};
