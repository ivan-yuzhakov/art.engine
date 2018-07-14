<?php
$html = '<div class="content">
	<div class="title"><b>ARTWORK DETAILS AND INFORMATION</b></div>
	<div class="image">{{26}}</div>
	<div class="left">
		<div class="desc">
			<p><b>{{22}}</b></p>
			<p><em>{{title}}</em>, {{42}}</p>
			<p>{{38}}</p>
			<p>{{37}}</p>
		</div>
		{{signature}}
		{{provenance}}
		{{exhibitions}}
		{{bibliography}}
	</div>
	<div class="clr"></div>
</div>
<style>
	.clr{clear:both;}

	.header{color:#000;}
	.header .logo{width:30%;height:80px;float:left;}
	.header .logo svg{width:100%;height:100%;display:block;}
	.header .logo svg path{fill:#532D6D;}
	.header .info{margin-left:40%;}
	.header .info p{margin:0;font-size:12px;line-height:20px;}
	.header .info p a{color:#000;text-decoration:none;}

	.content{}
	.content .image{width:40%;float:right;}
	.content .image img{width:100%;height:auto;display:block;}
	.content .left{margin-right:45%;border-top:1px solid #000;}
	.content .title{margin-bottom:1em;font-size:24px;}
	.content .left .desc{padding:1em 0 2em;border-bottom:1px solid #000;}
	.content .left .signature,
	.content .left .exhibitions{border-bottom:none;}
	.content .left .bibliography{border-bottom:none;}
	.content .left .desc h3{margin:0;font-size:16px;line-height:20px;}
	.content .left .desc p{margin:0;font-size:16px;line-height:20px;}
</style>';

$template = [
	'title' => 'Helwaser_Gallery_Artwork_Info_'.date('m_Y').'.pdf',
	'format' => 'A4',
	'padding' => [15, 15, 15, 15], // [top, right, bottom, left]
	'default_font_size' => 10,
	'default_font' => 'sans', // sans | sans-serif | serif | monospace | mono
	'orientation' => 'L', // P | L
	'html' => [$html, '', ''],
	'fonts' => [
		'whitney' => [
			'R' => '/ve-theme/fonts/hinted-Whitney-Book.ttf',
			'B' => '/ve-theme/fonts/hinted-Whitney-Bold.ttf',
			'I' => '/ve-theme/fonts/hinted-Whitney-BookItalic.ttf',
			'BI' => '/ve-theme/fonts/hinted-Whitney-BoldItalic.ttf',
		]
	],
	'headers' => '<div class="header">
		<p><b>Helwaser Gallery</b></p>
		<p>16 East 79th Street, Suite 14, First Floor, New York, NY 10075</p>
		<p>Phone: +1 (646) 649 3744 | E-mail: <a href="mailto:info@helwasergallery.com">info@<b>Helwaser</b>Gallery.com</a></p>
		<p><a href="http://helwasergallery.com">www.<b>Helwaser</b>Gallery.com</a></p>
</div>',
	'footers' => 'footers',
	'processing' => [
		// '10' => function($value, $field){
			// return '';
		// },
		'signature' => function($item, $fields){
			$signature = isset($item[47]) ? $item[47] : '';

			if (empty($signature)) {
				return '';
			} else {
				return '<div class="desc signature">
					<h3>SIGNATURE:</h3>
					<p>' . $signature . '</p>
				</div>';
			}
		},
		'provenance' => function($item, $fields){
			$provenance = isset($item[48]) ? $item[48] : '';

			if (empty($provenance)) {
				return '';
			} else {
				return '<div class="desc provenance">
					<h3>PROVENANCE:</h3>
					' . $provenance . '
				</div>';
			}
		},
		'exhibitions' => function($item, $fields){
			$exhibitions = isset($item[49]) ? $item[49] : '';

			if (empty($exhibitions)) {
				return '';
			} else {
				return '<div class="desc exhibitions">
					<h3>EXHIBITIONS:</h3>
					' . $exhibitions . '
				</div>';
			}
		},
		'bibliography' => function($item, $fields){
			$bibliography = isset($item[50]) ? $item[50] : '';

			if (empty($bibliography)) {
				return '';
			} else {
				return '<div class="desc bibliography">
					<h3>BIBLIOGRAPHY:</h3>
					' . $bibliography . '
				</div>';
			}
		}
	]
];
?>