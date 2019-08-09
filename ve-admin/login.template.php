<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title><?php echo $settings['siteTitle']; ?> ‒ CP</title>
	<link href="https://fonts.googleapis.com/css?family=PT+Sans&amp;subset=cyrillic" rel="stylesheet">
	<style>
		*{margin:0;padding:0;}
		.br3{-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;}
		.box{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;}
		.animate1{transition:all .1s ease;-moz-transition:all .1s ease;-webkit-transition:all .1s ease;}

		body{height:100%;background:#f8f8f8;cursor:default;font:normal 16px/20px 'PT Sans', sans-serif;color:#333;text-align:center;}
		.logo{height:40px;margin:40px 0;display:inline-block;}
		.logo img{width:auto;height:40px;margin-right:20px;display:block;float:left;}
		.logo p{margin:0;float:left;font-size:22px;line-height:40px;}
		#login{width:400px;margin:0 auto;padding:0 20px 40px;}
		#login input{width:400px;height:48px;margin-bottom:20px;padding:10px 20px;background:#fff;border:1px solid #ddd;display:block;outline:none;font-size:16px;line-height:26px;font-family:'PT Sans', sans-serif;color:#333;}
		#login input:focus{border-color:#999;}
		#login select{width:190px;height:40px;padding:0 20px;float:left;background:#fff;border:1px solid #ddd;display:block;outline:none;font:16px/40px 'PT Sans', sans-serif;color:#333;}
		#login .submit{width:190px;height:40px;padding:0 20px;cursor:pointer;float:right;}
		#login .submit:hover{background:#23a38f;border-color:#999;color:#fff;}
		#login .error{margin:20px 0;color:#a00;text-align:center;}
	</style>
</head>
<body class="login">
	<div class="logo">
		<img src="/favicon.png" alt="logo">
		<p><?php echo $settings['siteTitle']; ?></p>
	</div>
	<form id="login" action="<?php echo URL_SITE; ?>ve-admin/" method="POST" name="loginfrm">
		<input class="br3 box animate1" type="text" name="login" placeholder="Login">
		<input class="br3 box animate1" type="password" name="password" placeholder="Password">
		<?php if ($error) echo '<p class="error">' . $error . '</p>'; ?>
		<select name="lang" class="br3">
			<?php
				$l = [
					'eng' => 'English',
					'rus' => 'Русский',
				];
				foreach ($l as $i => $v) {
					$selected = $admin_lang === $i ? ' selected' : '';
					echo '<option' . $selected . ' value="' . $i . '">' . $v . '</option>';
				}
			?>
		</select>
		<input type="submit" class="submit br3" name="button" value="Submit">
	</form>
</body>
</html>