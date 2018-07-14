<?php
$html = '<div class="header">
	<div class="logo">' . file_get_contents(DIR_THEME . 'pdf/logo.svg') . '</div>
	<div class="info">
		<p><b>Helwaser Gallery</b></p>
		<p>16 East 79th Street, Suite 14, First Floor, New York, NY 10075</p>
		<p>Phone: +1 (646) 649 3744 | E-mail: <a href="mailto:info@helwasergallery.com">info@<b>Helwaser</b>Gallery.com</a></p>
		<p><a href="http://helwasergallery.com">www.<b>Helwaser</b>Gallery.com</a></p>
	</div>
	<div class="clr"></div>
</div>
<div class="content">
	<div class="title">Invoice # {{invoice_id}}</div>
	<div class="to">
		<span>To: </span>{{address}}
	</div>';
foreach ($items as $id => $item) {
	$text = '<div class="image">{{26}}</div>
	<div class="left">
		<div class="desc">
			<h3>DESCRIPTION:</h3>
			<p><b>{{22}}</b></p>
			<p><em>{{title}}</em>, {{42}}</p>
			<p>{{38}}</p>
			<p>{{37}}</p>
			<p><br>UI #{{uid}}</p>
		</div>
		<div class="price">
			<p class="fright">$ {{43}}</p>
			<p>Subtotal / Price:</p>
			{{discount}}
			<p class="fright">$ {{tax}}</p>
			<p>Sales Tax ({{tax_val}}%)</p>
		</div>
		<div class="total">
			<p class="fright"><b>$ {{total}}</b></p>
			<p><b>TOTAL</b></p>
		</div>
	</div>';
	$html .= $replace_item($text, $id, [
		'discount' => function($item){
			$discount = isset($_GET['discount']) ? $_GET['discount'] : '';
			$discount = str_replace(',', '.', $discount);
			$discount = str_replace('%', '', $discount);
			$discount = (float) $discount;

			$price = isset($item[43]) ? $item[43] : '';
			$price = str_replace(',', '', $price);
			$price = str_replace('$', '', $price);
			$price = (float) $price;
			$price = $price * ($discount / 100);

			if ($discount == 0) {
				return '';
			} else {
				return '<p class="fright">$ ' . number_format($price) . '</p><p>Discount (' . number_format($discount) . '%):</p>';
			}
		},
		'tax_val' => function(){
			$tax = isset($_GET['tax']) ? $_GET['tax'] : '0';
			$tax = str_replace(',', '.', $tax);
			$tax = str_replace('%', '', $tax);
			return $tax;
		},
		'tax' => function($item, $fields){
			$tax = isset($_GET['tax']) ? $_GET['tax'] : '0';
			$tax = str_replace(',', '.', $tax);
			$tax = str_replace('%', '', $tax);

			$price = isset($item[43]) ? $item[43] : '';
			$price = str_replace(',', '', $price);
			$price = str_replace('$', '', $price);
			$price = (float) $price;

			$discount = isset($_GET['discount']) ? $_GET['discount'] : '';
			$discount = str_replace(',', '.', $discount);
			$discount = str_replace('%', '', $discount);
			$discount = (float) $discount;

			$price = $price - $price * ($discount / 100);

			$tax = $price * ((float) $tax / 100);
			return number_format($tax);
		},
		'total' => function($item, $fields){
			$tax = isset($_GET['tax']) ? $_GET['tax'] : '0';
			$tax = str_replace(',', '.', $tax);
			$tax = str_replace('%', '', $tax);

			$price = isset($item[43]) ? $item[43] : '';
			$price = str_replace(',', '', $price);
			$price = str_replace('$', '', $price);
			$price = (float) $price;

			$discount = isset($_GET['discount']) ? $_GET['discount'] : '';
			$discount = str_replace(',', '.', $discount);
			$discount = str_replace('%', '', $discount);
			$discount = (float) $discount;

			$price = $price - $price * ($discount / 100);
			
			$tax = $price * ((float) $tax / 100);
			return number_format($price + $tax);
		},
	]);
}
$html .= '
	<div class="terms">
		<h3>TERMS:</h3>
		{{terms}}
	</div>
	<div class="clr"></div>
</div>
<div class="footer">
	<h3>** BANKING DETAILS FOR WIRE TRANSFER</h3>
	{{bank-info}}
</div>
<style>
	.clr{clear:both;}
	.fright{float:right;}

	.header{font-family:"whitney";color:#000;}
	.header .logo{width:30%;height:80px;float:left;}
	.header .logo svg{width:100%;height:100%;display:block;}
	.header .logo svg path{fill:#532D6D;}
	.header .info{margin-left:40%;}
	.header .info p{margin:0;font-size:12px;line-height:20px;}
	.header .info p a{color:#000;text-decoration:none;}

	.content{margin:2em 0 1em;padding-bottom:1em;border-bottom:1px solid #000;font-family:"whitney";}
	.content .image{width:40%;float:right;}
	.content .image img{width:100%;height:auto;display:block;}
	.content .left{margin-right:45%;}
	.content .title{margin-bottom:1em;font-size:30px;font-weight:bold;}
	.content .to{margin-bottom:1em;padding-top:1em;}
	.content .to p, .content .to span{margin:0;font-size:16px;line-height:20px;}
	.content .left .desc{margin-bottom:1em;padding-top:1em;border-top:1px solid #000;}
	.content .left .desc h3{margin:0 0 1em;font-size:16px;line-height:20px;}
	.content .left .desc p{margin:0;font-size:16px;line-height:20px;}
	.content .left .price{padding:1em 0;border-bottom:1px solid #000;border-top:1px solid #000;}
	.content .left .price p{width:50%;margin:0;font-size:16px;line-height:20px;}
	.content .left .price p.fright{text-align:right;}
	.content .left .total{padding:1em 0 2em;border-bottom:1px solid #000;}
	.content .left .total p{width:50%;margin:0;font-size:16px;line-height:20px;}
	.content .left .total p.fright{text-align:right;}
	.content .left .terms{padding-top:1em;}
	.content .left .terms h3{margin:0;font-size:16px;line-height:20px;}
	.content .left .terms p{margin-top:1em;font-size:16px;line-height:20px;}

	.footer{font-family:"whitney";}
	.footer h3{margin:0 0 1em;font-size:16px;line-height:20px;}
	.footer p{margin:0;font-size:16px;line-height:20px;}
</style>';

$template = [
	'title' => 'Helwaser_Gallery_Invoice_'.date('m_Y').'.pdf',
	'html' => [$html],
	// fonts
	'fonts_dir' => DIR_THEME . 'fonts',
	'fonts' => [
		'whitney' => [
			'R' => 'hinted-Whitney-Book.ttf',
			'B' => 'hinted-Whitney-Bold.ttf',
			'I' => 'hinted-Whitney-BookItalic.ttf',
			'BI' => 'hinted-Whitney-BoldItalic.ttf',
		]
	],
	'default_font_size' => 10,
	'default_font' => 'sans', // sans | sans-serif | serif | monospace | mono
	'request' => [
		[
			'id' => 'tax',
			'title' => 'Tax (%)',
			'type' => 'text'
		],
		[
			'id' => 'discount',
			'title' => 'Discount (%)',
			'type' => 'text'
		],
		[
			'id' => 'address',
			'title' => 'Client Name and Address',
			'type' => 'tinymce'
		],
		[
			'id' => 'bank-info',
			'title' => 'Bank Information',
			'type' => 'tinymce'
		],
		[
			'id' => 'terms',
			'title' => 'Terms',
			'type' => 'tinymce'
		]
	],
	'processing' => [
		'address' => function($items){
			$address = isset($_GET['address']) ? $_GET['address'] : '';

			return $address;
		},
		'invoice_id' => function($items, $fields){
			global $db;

			$result = $db->query('SELECT `date`,`number` FROM `ve_pdf_invoice` WHERE `id` = 1');
			$arr = [];
			while ($row = $result->fetch_assoc()) {
				$arr[] = $row;
			}
			$item = $arr[0];

			$date = date('Y_m');

			if ($date === $item['date']) {
				$db->query('UPDATE `ve_pdf_invoice` SET `number` = ' . ($item['number'] + 1) . ' WHERE `id` = 1');

				return $date . '_' . $item['number'];
			} else {
				$db->query('UPDATE `ve_pdf_invoice` SET `date` = "' . $date . '", `number` = 1001 WHERE `id` = 1');

				return $date . '_1000';
			}
			// 2017_01_1000
		},
		'bank-info' => function($items){
			$bank_info = isset($_GET['bank-info']) ? $_GET['bank-info'] : '';

			return $bank_info;
		},
		'terms' => function($items){
			$terms = isset($_GET['terms']) ? $_GET['terms'] : '';

			return $terms;
		},
	]
];
?>