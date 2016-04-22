$(document).ready(init);

function init() {
	// Shorten blog text on home page
	$('.blog-content').dotdotdot({
		ellipsis: '... ',
		wrap: 'word',
		after: "a.readmore",
		watch: "window"
	});
	// Add colors to labels
	$(".label").each(function() {
		$(this).css("background-color", randomColor({luminosity: 'bright', hue: 'blue'}));
	});
}
