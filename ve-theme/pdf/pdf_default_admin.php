<?php
$html = '<div>Global HTML</div>';
foreach ($items as $id => $item) {
	$text = '<p>{{title}}</p><p>{{uid}}</p><p>{{10}}</p><p>{{custom}}</p>';
	$html .= $replace_item($text, $id, [
		// '10' => function($value, $field){
			// return '';
		// },
		// 'custom' => function($item, $fields){
			// return '';
		// }
	]);
}

$template = [
	'debug' => false,
	'title' => 'PDF',
	'html' => [$html],
	// fonts
	'fonts_dir' => DIR_THEME . 'fonts',
	'fonts' => [
		// 'fontname' => [
			// 'R' => 'file_regular.ttf',
			// 'B' => 'file_bold.ttf',
			// 'I' => 'file_italic.ttf',
			// 'BI' => 'file_boldItalic.ttf',
		// ]
	],
	'default_font_size' => 10,
	'default_font' => 'sans', // sans | sans-serif | serif | monospace | mono
	'headers' => false,
	'footers' => false,
	'request' => [
		/*[
			'id' => 'tax', // id GET request
			'title' => 'Tax (%)',
			'type' => 'text'
		],*/
	],
	'processing' => [
		// 'custom' => function($item, $fields){
			// return '';
		// }
	]
];
?>