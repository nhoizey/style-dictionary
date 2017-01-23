$(function () {

	var debounceSearchTimeout;
	var debounceSearch = function () {
		clearTimeout(debounceSearchTimeout);
		debounceSearchTimeout = setTimeout(doSearch, 300);
	};
	var doSearch = function () {
		if(!$('.use_path')[0].checked && !$('.use_value')[0].checked && !$('.use_attributes')[0].checked) {
			alert('Search error: you can only perform a search with at least one field checked.');
			return;
		}

		var $e = $('.search-box');
		var searchVals = $e.val().split(" ");

		$('.hidden').removeClass('hidden');

		if(!$('.use_attributes')[0].checked) {
			$('.style-guide-property').addClass('minimized');
		}

		$('.style-guide-property').each(function (i, e) {
			var $e = $(e);
			var hidden = false;

			searchVals.some(function (searchVal) {
				if(
						(!$('.use_path')[0].checked || $e.find('.style-guide-property-path').text().indexOf(searchVal) === -1)
					&&
						(!$('.use_value')[0].checked || $e.find('.style-guide-property-value').text().indexOf(searchVal) === -1)
					&&
						(!$('.use_attributes')[0].checked || $e.find('.style-guide-property-attributes').text().indexOf(searchVal) === -1)
				) {
					hidden = true;
					return true;
				}
			});

			if(hidden) {
				$e.addClass('hidden');
			}
			else if($('.use_attributes')[0].checked) {
				$e.removeClass('minimized');
			}
		});
	};

	$('.search-box').on('keyup',debounceSearch);
	$('.search-modifier').on('click',doSearch);

	$('.style-guide-property-attributes-control').on('click',function (e) {
		var $property = $(e.target).closest('.style-guide-property');

		$property.toggleClass('minimized');
	});


	var DEFAULT_PATH = '__ROOT';
	var SEPARATOR = '-';
	var buildStyleMenuHTMLRecursive = function(styleObject, owner) {
		if(styleObject.value) {
			return "";
		}
		else {
			var toPrefix;
			if(!owner) {
				toPrefix = DEFAULT_PATH;
				owner = "";
			}
			else {
				toPrefix = owner;
				owner += SEPARATOR;
			}

			var keys = Object.keys(styleObject);
			var keysHTML = keys.map(function (key) {
				return '<div class="key" data-owner="' + toPrefix + '" data-value="' + key + '">' + key + '</div>' + buildStyleMenuHTMLRecursive(styleObject[key], owner + key);
			});
			return keysHTML.join("\n");
		}
	};

	var styleMenu = buildStyleMenuHTMLRecursive(__style_properties);

	$(document.body).append('<div class="styleMenu">' + styleMenu + '</div>');
	$('.key').addClass('hidden');
	$('.key[data-owner=' + DEFAULT_PATH + ']').removeClass('hidden');

	var currPath = "";
	$('.key').on('click', function (e) {
		var $e = $(e.target);

		var owner = $e.attr('data-owner');
		var value = $e.attr('data-value');
		var newPath = (owner===DEFAULT_PATH ? value : owner+SEPARATOR+value );
		if(newPath===currPath) {
			newPath = newPath.split(SEPARATOR);
			newPath.pop();
			newPath = newPath.join(SEPARATOR);
			if(newPath==='') {
				newPath = DEFAULT_PATH;
			}
		}

		currPath = newPath;
		$('.key').removeClass('selected last-selected').addClass('hidden');

		var buildPath = '';
		var currPathArr = currPath.split(SEPARATOR);
		currPathArr.forEach(function (key, i) {
			$('.key[data-owner=' + (buildPath || DEFAULT_PATH) + '][data-value=' + key + ']').removeClass('hidden').addClass('selected' + (i===currPathArr.length-1 ? ' last-selected' : ''));
			buildPath += (buildPath ? SEPARATOR+key : key);
		});
		if(buildPath) {
			$('.key[data-owner=' + buildPath + ']').removeClass('hidden');
		}

		if(buildPath) {
			$('.style-guide-property').addClass('hidden');
			$('.style-guide-property[data-path^='+buildPath+']').removeClass('hidden');			
		}
	});
});