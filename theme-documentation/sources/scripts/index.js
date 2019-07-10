//--------------------------------------------------
//-- Main
//--------------------------------------------------
import $ from 'jquery';

import 'jquery.scrollto';
import 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-js-extras';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-css-extras';
import 'prismjs/components/prism-scss';
import 'prismjs/plugins/line-highlight/prism-line-highlight';
import 'prismjs/plugins/line-numbers/prism-line-numbers';




//-- Set highlighted line number in source
const $line = $('#line');

if ($line.length) {
	const { groups: { line } = {} } = location.hash.match(/^#line-(?<line>\d+)$/) || {};

	if (line) {
		$line.attr('data-line', line);
	}
}

setTimeout(() => {
	$(window).scrollTo('.line-highlight', 500, { offset: -100 });
}, 1);




//-- Smooth scrolling on anchors
$('body').on('click', 'a', function (event) {
	var elements = $(event.currentTarget).attr('href').split('#');
	if (location.pathname.endsWith(elements[0])) {
			event.preventDefault();
			history.pushState(null, null, elements[1] ? '#' + elements[1] : elements[0]);
			$(window).trigger('hashchange');
	}
});

$(window).on('hashchange', (event) => {
	event.preventDefault();
	$(window).scrollTo(location.hash || 'body', 500, { offset: -70 });
}).trigger('hashchange');


//-- External links
$('body').on('click', 'a[data-external]', function (event) {
	$(this).attr('target', '_blank');
});




//-- Footer
const ADJECTIVES = [
	'❤︎',
	'hard work',
	'heated debates',
	'cold sweats',
	'bad puns',
	'coffee & tea'
];

$('[data-component="adjective"]').text(ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]);
