/*
	jsontools v1.0
	2015 // xavikortes
	https://github.com/xavikortes/jsontools
*/

$(document).ready(function() {
	$('.xkJson-stringEditor').on('change keyup paste', function() {

		var xkJsonParser_ = false;
		if(!xkJsonParser_)
			xkJsonParser_ = new xkJsonParser();

		let rawJson = $(this).val();
		let parsedJson = xkJsonParser_.parseJson(rawJson);
		$('.xkJson-objectEditor').html(parsedJson);

		$('.xkJson-objectEditor .xkJson-toggleButton').unbind('click').on('click', function() {
	        $(this).parent().toggleClass('xkJson-collapsed');
	        $(this).parent().find('.xkJson-object, .xkJson-array').toggle();
	        $(this).parent().find('.xkJson-placeholder').toggle();
	    });
	});
});

function xkJsonParser() {
	this.parseJson = function(json) {
		json = json.replace(/[\n\r\t]/g, '');
		json = $.trim(json);

		var fJson = '';
		fJson += parseObject(json);

		return fJson;
	};

	function parseObject(object) {		
		var fObject = '';
		var braceStart = object[0] == '{' ? formatBrace(object[0]) : formatError();

		var properties = object.substring(1,object.length-1);
		if(properties != '') {
			var aProperties = splitBy(properties, ',');
			var last = false;
			for(var i = 0; i < aProperties.length; i++) {
				if(i == aProperties.length-1)
					last = true;
				fObject += parseProperty(aProperties[i], last);
			}
		}

		var braceEnd = object[object.length-1] == '}' ? formatBrace(object[object.length-1]) : formatError();

		return formatToggle(braceStart + formatPlaceholder() + formatObject(fObject) + braceEnd);
	};

	function parseArray(array) {
		var fArray = '';
		var bracketStart = array[0] == '[' ? formatBracket(array[0]) : formatError();

		var elements = array.substring(1,array.length-1);
		if(elements != '') {
			var aElements = splitBy(elements, ',');
			var last = false;
			for(var i = 0; i < aElements.length; i++) {
				if(i == aElements.length-1)
					last = true;
				fArray += parseElement(aElements[i], last);
			}
		}

		var bracketEnd = array[array.length-1] == ']' ? formatBracket(array[array.length-1]) : formatError();

		return formatToggle(bracketStart + formatPlaceholder() + formatArray(fArray) + bracketEnd);
	};

	function parseProperty(property, last) {
		if(property == '')
			return formatError();

		var fProperty = '';
		var aKeyValue = splitBy(property, ':');

		if(aKeyValue.length != 2)
			return formatError();

		fProperty += parseKey(aKeyValue[0]);
		fProperty += formatSign(':') + ' ';
		fProperty += parseValue(aKeyValue[1]);

		if(!last)
			fProperty += formatSign(',');

		return formatProperty(fProperty);
	};

	function parseElement(element, last) {
		var fElement = '';
		fElement += parseValue(element);

		if(!last)
			fElement += formatSign(',');

		return formatElement(fElement);
	};

	function parseKey(key) {
		var fKey = '';
		if(key[0] != '"')
			return formatError();
		if(key[key.length-1] != '"')
			return formatError();

		if(key.substring(1,key.length-1).indexOf('"') != -1)
			return formatError();

		fKey += formatKey(key);

		return fKey;
	};

	function parseValue(value) {
		if(value == '')
			return formatError();

		var fValue = '';
		var start = value[0];
		var end = value[value.length-1];

		if(start == '"' && end == '"')
			fValue = parseString(value);
		else if(start == '{' && end == '}')
			fValue = parseObject(value);
		else if(start == '[' && end == ']')
			fValue = parseArray(value);
		else if(value == 'true' || value == 'false')
			fValue = formatBoolean(value);
		else if(value == 'null')
			fValue = formatNull(value);
		else if(!isNaN(value))
			fValue = formatNumber(value);
		
		if(fValue == '')
			return formatError();

		return formatValue(fValue);
	};

	function parseString(string) {
		if(string.substring(1,string.length-1).indexOf('"') != -1)
			return formatError();

		return formatString(string);
	};

	function splitBy(string, separator) {
		var aElements = [];
		var nString = '';
		var level = 0;
		var quoted = false;
		for(var i = 0; i < string.length; i++) {
			if(string[i] == '"')
				quoted = !quoted;
			else if((string[i] == '{' || string[i] == '[') && !quoted)
				level++;
			else if((string[i] == '}' || string[i] == ']') && !quoted)
				level--;
			else if(string[i] == ' ' && !quoted)
				continue;
			else if(string[i] == separator && level == 0 && !quoted) {
				aElements.push(nString);
				nString = '';
				continue;
			}
			nString += string[i];
		}
		aElements.push(nString);
		return aElements;
	};

	function formatObject(object) {
		return '<ul class="xkJson-object">' + object + '</ul>';
	};

	function formatArray(array) {
		return '<ol class="xkJson-array">' + array + '</ol>';
	};

	function formatProperty(property) {
		return '<li class="xkJson-property">' + property + '</li>';
	};

	function formatElement(element) {
		return '<li class="xkJson-element">' + element + '</li>';
	};

	function formatValue(value) {
		return '<span class="xkJson-value">' + value + '</span>';
	};

	function formatBrace(brace) {
		return '<span class="xkJson-brace">' + brace + '</span>';
	};

	function formatBracket(bracket) {
		return '<span class="xkJson-bracket">' + bracket + '</span>';
	};

	function formatSign(sign) {
		return '<span class="xkJson-sign">' + sign + '</span>';
	};

	function formatKey(key) {
		return '<span class="xkJson-key">' + key + '</span>';
	};

	function formatString(string) {
		return '<span class="xkJson-string">' + string + '</span>';
	};

	function formatBoolean(boolean) {
		return '<span class="xkJson-boolean">' + boolean + '</span>';
	};

	function formatNull(snull) {
		return '<span class="xkJson-null">' + snull + '</span>';
	};

	function formatNumber(number) {
		return '<span class="xkJson-number">' + number + '</span>';
	};

	function formatToggle(toggle) {
		return '<span class="xkJson-toggle"><span class="xkJson-toggleButton"></span>' + toggle + '</span>';
	};

	function formatPlaceholder() {
		return '<span class="xkJson-placeholder oculto"></span>';
	};

	function formatError() {
		return '<span class="xkJson-error">Error</span>';
	};
}
