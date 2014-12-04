/**
 * Represents Form
 * @constructor
 */
function Form(form, init) {
	var init = init || true;
	this.form = form;

	if (init) {
		this.init();
	}
}

/**
 * init
 *
 * binds events on the form
 */
Form.prototype.init = function() {
	var self = this;
	
	// on submit event
	$(this.form).submit(function (event, done) {
		self.submit(event, done);
	});
};

/**
 * submit
 *
 * @param {object} event
 * @param {boolean} done
 */
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
	if (this.isValid()) {
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
				if (data.success === true) {
					$(self.form).trigger('submit', [true]);
				} else {
					var language = $.cookie('language');
					if (typeof language !== 'undefined') {
						$.getJSON('/panel/translations/'+language+'/package.json', function(translation) {
							self.parseErrors(translation, data);
						});
					}
				}
			});
	}
};

/**
 * isValid
 * 
 * Precheck form before making an ajax call for server sided validation
 */
Form.prototype.isValid = function() {
	var required = this.form.querySelectorAll("input[required]"),
		errors = 0;

	for (var i=0,l=required.length;i<l;i++) {
		var item = required[i],
			field = item.parentNode;

		if (item.value === '' && !field.classList.contains('.required')) {
			field.classList.add('required');
			errors++;
		} else {
			field.classList.remove('required');
		}
	}
	if (errors === 0) {
		return true;
	}
	return false;
};

/**
 * parseErrors
 *
 * @param {json} translation
 * @param {object} errors
 */
Form.prototype.parseErrors = function(translation, errors) {
	for(var key in errors.fields) {
		var input = errors.fields[key],
			item = this.form.querySelector('*[name="'+input.param+'"]'),
			field = item.parentNode,
			addon = this.getAddon(field);

		if (addon) {
			this.addInlineError(field, addon, translation[errors.translation].errors[input.msg]);
		} else {
			var errorField = document.createElement('div'),
				errorMessage = document.createElement('span'),
				errorText = document.createTextNode(translation[errors.translation].errors[input.msg]);
			
			errorMessage.appendChild(errorText);
			errorField.appendChild(errorMessage);
			errorField.classList.add('field error')
			this.form.insertBefore(errorField, this.form.firstChild);
			errorField.style.display = 'block';
		}
		field.classList.add('required');
	}
};

/**
 *
 */
Form.prototype.getAddon = function(field) {
	if(field instanceof jQuery) {
		field = field[0];
	}
	var elm = field.firstChild;
	while (elm.nodeType !== 1 && elm.nextSibling) {
		elm = elm.nextSibling;
	}
	if (elm.nodeType === 1 && elm.tagName.toLowerCase() === 'span') {
		return elm;
	}
	return false;
};

/**
 *
 */
Form.prototype.addInlineError = function(field, addon, message) {
	var errorMessage = document.createElement('span'),
		errorText = document.createTextNode(message);

	errorMessage.appendChild(errorText);
	errorMessage.classList.add('error-message');
	field.insertBefore(errorMessage, addon);
	$(addon).bind({
		mouseenter: function() {
			var message = $(this).prev(),
				width = getRealWidth(message);
			message.animate({
				width: width+'px'
			}, 200);
		},
		mouseleave: function() {
			var message = $(this).prev();
			message.animate({
				width: '0px'
			}, 200);
		}
	});
};

/**
 * getRealWidth
 * 
 * helper function
 */
function getRealWidth(elm) {
	var current_width = elm.width();
	elm.css('width', 'auto');
	var width = elm.width();
	elm.css('width', current_width+'px');
	return width;
}