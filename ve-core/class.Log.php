<?php
class Log
{
	public $id;

	public function __construct()
	{
		set_error_handler([$this, 'error_handler']);
	}

	public function error_handler($errno, $msg, $file, $line, $vars)
	{
		global $visitor;

		// Do not handle the error if the @
		if (error_reporting() === 0) return false;

		if (!$visitor->is_admin) {
			$frontend = strpos($file, 've-theme') !== false;

			$mail = new PHPMailer();
			$mail->charSet = 'UTF-8';
			$mail->setFrom('admin@' . URL_SITE_SHORT);
			$mail->addAddress($frontend ? MAIL_DEVELOPER_FRONTEND : MAIL_DEVELOPER_BACKEND);
			$mail->isHTML(true);
			$mail->Subject = $frontend ? 'Error frontend!' : 'Error backend!';
			$message = [
				'<p><b>REQUEST</b></p>',
				'<p>URL: <a href="' . URL_PROTOKOL . '://' . URL_SITE_SHORT . $_SERVER['REQUEST_URI'] . '">' . URL_SITE_SHORT . $_SERVER['REQUEST_URI'] . '</a></p>',
				'<p>POST: ' . json_encode($_POST) . '</p>',
				'<p>GET: ' . json_encode($_GET) . '</p>',
				'<p><b>RESPONSE</b></p>',
				'<p>Error: ' . $msg . '</p>',
				'<p>File: ' . $file . '</p>',
				'<p>Line: ' . $line . '</p>',
				'<p><b>VISITOR</b></p>',
				'<p>IP: ' . $visitor->ip . '</p>',
				'<p>Browser: ' . $_SERVER['HTTP_USER_AGENT'] . '</p>',
				'<p><b>' . date('d.m.Y H:i:s (T)') . '</b></p>'
			];
			$mail->Body = implode('', $message);

			$mail->send();
		} else {
			ob_end_clean();
			die($msg . ' in ' . $file . ' on line ' . $line);
		}

		return false;
  	}
}
?>