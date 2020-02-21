<?php
class Files
{
	private $dir_files = false;
	private $dir_cache = false;
	private $url_files = false;
	private $url_cache = false;

	private $files_types = false;
	public $files_formats = false;
	public $files_size = false;
	public $files = [];

    private $file;
    private $path;
    private $info;
    private $cache;

	function __construct()
	{
		$this->dir_files = DIR_FILES;
		$this->dir_cache = DIR_FILES . 'cache/';
		$this->url_files = URL_FILES;
		$this->url_cache = URL_FILES . 'cache/';

		if (!file_exists($this->dir_cache)) mkdir($this->dir_cache, 0777, true);

		$this->files_types = [
			'image'    => ['jpg', 'jpeg', 'png', 'gif'],
			'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
			'archive'  => ['zip', 'rar'],
			'audio'    => ['mp3'],
			'video'    => ['mp4', 'webm']
		];
		$this->files_formats = array_merge(
			$this->files_types['image'],
			$this->files_types['document'],
			$this->files_types['archive'],
			$this->files_types['audio'],
			$this->files_types['video']
		);

		$this->files_size = min(
			$this->convert_bytes(ini_get('upload_max_filesize')),
			$this->convert_bytes(ini_get('post_max_size'))
		);
	}

	private function convert_bytes($val)
	{
		$last = strtolower($val[strlen($val)-1]);
		$val = (int) $val;

		switch ($last) {
			case 'g':
				$val *= 1024;
			case 'm':
				$val *= 1024;
			case 'k':
				$val *= 1024;
		}

		return $val;
	}

	public function get_file($id)
	{
		global $db;

		$id = (int) $id;

		if ($id === 0) return false;

		$cache = isset($this->files[$id]) ? $this->files[$id] : false;
		if ($cache) return $cache;

		$files = $db->select('files', '*', ['id' => $id], __FILE__, __LINE__);
		$file = empty($files) ? false : $files[0];
		$this->files[$id] = $file;

		return $file;
	}

	public function upload($files)
	{
		global $db, $visitor, $settings;

		$json = [];

		if (!isset($files) || $_SERVER['REQUEST_METHOD'] != 'POST')
		{
			$json['error'] = 'Hacking attempt on file upload?';

			return $json;
		}

		foreach ($files['fileup']['name'] as $key => $name) {
			if ($files['fileup']['error'][$key] != 0) continue;

			$info = pathinfo($name);
			$ext = $info['extension'];
			$info['filename'] = str_replace('_', ' ', $name);
			$info['filename'] = str_replace('.' . $ext, '', $info['filename']);
			$ext = strtolower($ext);

			if ($files['fileup']['size'][$key] > $this->files_size) {
				$json['error'] = "$name is too large!";
				continue;
			}
			if (!in_array($ext, $this->files_formats)) {
				$json['error'] = "$name is not a valid format";
				continue;
			}

			$id = $db->insert('files', [
				'user' => (isset($visitor->id) ? $visitor->id : -1),
				'title' => $info['filename'],
				'filename_original' => $name,
				'filename' => 'temp.jpg'
			], __FILE__, __LINE__);

			$filename = str_pad($id, 7, '0', STR_PAD_LEFT) . '.' . $ext;

			$moved = move_uploaded_file($files["fileup"]["tmp_name"][$key], $this->dir_files . $filename);

			if ($moved) {
				$isImage = in_array($ext, $this->files_types['image']);
				$size = false;

				if ($isImage) {
					if ((bool) $settings['imageUploadResize']) {
						$size = $this->originalResize($filename);
					} else {
						list($w, $h) = getimagesize($this->dir_files . $filename);
						$size = [$w, $h];
					}
				}

				$data = ['filename' => $filename];
				if ($size !== false) $data['size'] = implode(';', $size);

				$db->update('files', $data, 'id', $id, __FILE__, __LINE__);

				$this->getFileUrl($id, 200, 200, 0);

				$json[$id] = ['title' => $info['filename'], 'ext' => pathinfo($filename, PATHINFO_EXTENSION)];
			} else {
				$db->delete('files', 'id', $id, __FILE__, __LINE__);
				$json['error'] = 'Unable to move uploaded file. Shitty chmod?';
				continue;
			}
		}

		return $json;
	}

	public function originalResize($filename)
	{
		global $settings;
		//+уменьшить уже сущетсвующие

		$path = $this->dir_files . $filename;
		$info = getimagesize($path);

		$w = (int) $settings['imageUploadResizeW'];
		$h = (int) $settings['imageUploadResizeH'];
		$q = (int) $settings['imageUploadResizeQ'];
		$ow = $info[0];
		$oh = $info[1];
		$mime = $info['mime'];

		if ($ow <= $w && $oh <= $h) return [$ow, $oh];

		$original = false;

		if ($mime === 'image/jpeg') {
			$original = imagecreatefromjpeg($path);
		}
		if ($mime === 'image/png') {
			$original = imagecreatefrompng($path);
			imagealphablending($original, false);
			imagesavealpha($original, true);
		}
		if ($mime === 'image/gif') {
			$original = imagecreatefromgif($path);
		}

		if ($original !== false) {
			$min_w = min($w, $ow);
			$min_h = min($h, $oh);

			$ratio_w = $min_w / $ow;
			$ratio_h = $min_h / $oh;
			$ratio = min($ratio_w, $ratio_h);

			$image_width = round($ow * $ratio);
			$image_height = round($oh * $ratio);

			$image = imagecreatetruecolor($image_width, $image_height);

			if ($mime === 'image/png') {
				imagealphablending($image, false);
				imagesavealpha($image, true);
			}

			imagecopyresampled($image, $original, 0, 0, 0, 0, $image_width, $image_height, $ow, $oh);

			if ($mime === 'image/jpeg') {
				imageinterlace($image, 5);
				imagejpeg($image, $path, $q);
			}
			if ($mime === 'image/png') imagepng($image, $path);
			if ($mime === 'image/gif') imagegif($image, $path);

			imagedestroy($original);
			imagedestroy($image);

			return [$image_width, $image_height];
		} else {
			return false;
		}
	}

	private function getOriginal()
	{
		$mime = $this->info['mime'];
		$path = $this->path;

		// http://php.net/manual/ru/function.imagecreatefromjpeg.php#64155
		if ($mime == 'image/jpeg') return imagecreatefromjpeg($path);
		if ($mime == 'image/png') return imagecreatefrompng($path);
		if ($mime == 'image/gif') return imagecreatefromgif($path);
	}

	private function getCrop($use_crop)
	{
		$original = $this->getOriginal();
		if ($this->info['mime'] == 'image/png') {
			imagealphablending($original, false);
			imagesavealpha($original, true);
		}

		if ($use_crop) {
			$crop = explode(';', $this->file['crop']);
			if (count($crop) == 4) {
				$w = $crop[0]; $h = $crop[1];
				$t = $crop[2]; $l = $crop[3];

				$canvas = imagecreatetruecolor($w, $h);
				if ($this->info['mime'] == 'image/png') {
					imagealphablending($canvas, false);
					imagesavealpha($canvas, true);
				}
				imagecopy($canvas, $original, 0, 0, $l, $t, $w, $h);

				return ['canvas' => $canvas, 'w' => $w, 'h' => $h];
			} else {
				return ['canvas' => $original, 'w' => $this->info['w'], 'h' => $this->info['h']];
			}
		} else {
			return ['canvas' => $original, 'w' => $this->info['w'], 'h' => $this->info['h']];
		}
	}

	private function imagecopymerge_alpha($dst_im, $src_im, $dst_x, $dst_y, $src_x, $src_y, $src_w, $src_h, $pct)
	{
		$cut = imagecreatetruecolor($src_w, $src_h);
		imagecopy($cut, $dst_im, 0, 0, $dst_x, $dst_y, $src_w, $src_h);
		imagecopy($cut, $src_im, 0, 0, $src_x, $src_y, $src_w, $src_h);
		imagecopymerge($dst_im, $cut, $dst_x, $dst_y, 0, 0, $src_w, $src_h, $pct);

		imagedestroy($cut);
	}

	private function create($id, $w, $h, $use_crop, $watermark)
	{
		$crop = $this->getCrop($use_crop);

		$min_w = $w == 0 ? $crop['w'] : min($w, $crop['w']);
		$min_h = $h == 0 ? $crop['h'] : min($h, $crop['h']);

		$ratio_w = $min_w / $crop['w'];
		$ratio_h = $min_h / $crop['h'];
		$ratio = ($w == 0 || $h == 0) ? min($ratio_w, $ratio_h) : max($ratio_w, $ratio_h);

		$image_width = $crop['w'] * $ratio;
		$image_height = $crop['h'] * $ratio;

		$image = imagecreatetruecolor($image_width, $image_height);

		if ($this->info['mime'] == 'image/png') {
			imagealphablending($image, false);
			imagesavealpha($image, true);
		}

		if ($crop['canvas'] === null) $crop['canvas'] = imagecreatetruecolor($image_width, $image_height);

		imagecopyresampled($image, $crop['canvas'], 0, 0, 0, 0, $image_width, $image_height, $crop['w'], $crop['h']);

		if ($watermark !== false) {
			// create canvas watermark
			$canvas = imagecreatefrompng($watermark['image']);
			$canvas_w = imagesx($canvas);
			$canvas_h = imagesy($canvas);
			$canvas_r = $canvas_h / $canvas_w;

			// padding
			$image_w = $image_width - $watermark['padding'] * 2;
			$image_h = $image_height - $watermark['padding'] * 2;
			$image_r = ($image_h * $watermark['height']) / ($image_w * $watermark['width']);

			if ($canvas_r > $image_r) {
				$stamp_h = $image_h * $watermark['height'];
				$stamp_w = $stamp_h / $canvas_r;
			} else if ($canvas_r < $image_r) {
				$stamp_w = $image_w * $watermark['width'];
				$stamp_h = $stamp_w * $canvas_r;
			} else {
				$stamp_w = $image_w * $watermark['width'];
				$stamp_h = $image_h * $watermark['height'];
			}
			// create canvas stamp
			$stamp = imagecreatetruecolor($stamp_w, $stamp_h);
			imagealphablending($stamp, false);
			imagesavealpha($stamp, true);

			// resize watermark to stamp
			imagecopyresampled($stamp, $canvas, 0, 0, 0, 0, $stamp_w, $stamp_h, $canvas_w, $canvas_h);

			if ($watermark['x_align'] === 'left') $pos_left = $watermark['padding'];
			if ($watermark['x_align'] === 'center') $pos_left = ($image_width - $stamp_w) / 2;
			if ($watermark['x_align'] === 'right') $pos_left = $image_width - $watermark['padding'] - $stamp_w;

			if ($watermark['y_align'] === 'top') $pos_top = $watermark['padding'];
			if ($watermark['y_align'] === 'center') $pos_top = ($image_height - $stamp_h) / 2;
			if ($watermark['y_align'] === 'bottom') $pos_top = $image_height - $watermark['padding'] - $stamp_h;

			$this->imagecopymerge_alpha($image, $stamp, $pos_left, $pos_top, 0, 0, $stamp_w, $stamp_h, $watermark['opacity']);

			imagedestroy($canvas);
			imagedestroy($stamp);
		}

		$cache = $this->dir_cache . $this->cache;

		if ($this->info['mime'] == 'image/jpeg') {
			imageinterlace($image, 5);
			imagejpeg($image, $cache, 100);
		} else if ($this->info['mime'] == 'image/png') {
			imagepng($image, $cache);
		} else if ($this->info['mime'] == 'image/gif') {
			imagegif($image, $cache);
		} else {
			imageinterlace($image, 5);
			imagejpeg($image, $cache, 100);
		}

		imagedestroy($image);
	}

	private function getImage($id, $w, $h, $use_crop, $watermark, $return_path = false)
	{
		$watermark_cache = $watermark === false ? 0 : md5($watermark['image'] . $watermark['padding'] . $watermark['width'] . $watermark['height'] . $watermark['opacity'] . $watermark['x_align'] . $watermark['y_align']);

		$this->cache = $this->info['filename'] . '_' . $w . 'x' . $h . '_' . ($use_crop ? 1 : 0) . '_' . $watermark_cache . '.' . $this->info['extension'];

		if (!file_exists($this->dir_cache . $this->cache)) $this->create($id, $w, $h, $use_crop, $watermark);

		return ($return_path ? $this->dir_cache : $this->url_cache) . $this->cache;
	}

	private function verificationFile($id)
	{
		$file = $this->get_file($id);

		if ($file) {
			$this->path = $this->dir_files . $file['filename'];
			if (!file_exists($this->path)) $file = false;
		}

		return $file;
	}

	private function verificationWatermark($watermark)
	{
		if (!is_array($watermark)) return false;
		if (!isset($watermark['image'])) return false;
		if (!file_exists($watermark['image'])) return false;

		if (isset($watermark['padding'])) {
			$watermark['padding'] = (int) $watermark['padding'];
		} else {
			$watermark['padding'] = 0;
		}
		if (isset($watermark['width'])) {
			$watermark['width'] = (float) $watermark['width'];
		} else {
			$watermark['width'] = 1;
		}
		if (isset($watermark['height'])) {
			$watermark['height'] = (float) $watermark['height'];
		} else {
			$watermark['height'] = 1;
		}
		if (isset($watermark['opacity'])) {
			$watermark['opacity'] = (float) $watermark['opacity'] * 100;
		} else {
			$watermark['opacity'] = 100;
		}
		if (isset($watermark['x_align']) && ($watermark['x_align'] === 'left' || $watermark['x_align'] === 'right' || $watermark['x_align'] === 'center')) {
			
		} else {
			$watermark['x_align'] = 'center';
		}
		if (isset($watermark['y_align']) && ($watermark['y_align'] === 'top' || $watermark['y_align'] === 'bottom' || $watermark['y_align'] === 'center')) {
			
		} else {
			$watermark['y_align'] = 'center';
		}

		return $watermark;
	}

	public function getType($ext)
	{
		$ext = strtolower($ext);

		foreach ($this->files_types as $k => $v) {
			if (in_array($ext, $v)) return $k;
		}
	}

	public function getFileUrl($id = 0, $w = 0, $h = 0, $use_crop = false, $watermark = false)
	{
		$id = (int) $id;
		$w = (int) $w; $w = max($w, 0);
		$h = (int) $h; $h = max($h, 0);
		$use_crop = !empty($use_crop);
		$watermark = $this->verificationWatermark($watermark);

		$this->file = $this->verificationFile($id);

		if ($this->file === false) {
			return URL_SITE . 'placeholder/' . ($w > 0 ? $w : 500) . '/' . ($h > 0 ? $h : 500);
		}

		$this->info = pathinfo($this->path);

		switch ($this->getType($this->info['extension'])) {
			case 'image':
				$info = getimagesize($this->path);
				$this->info['w'] = $info[0];
				$this->info['h'] = $info[1];
				$this->info['mime'] = $info['mime'];

				if ($w === 0 && $h === 0 && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					return $this->url_files . $this->file['filename'];
				}
				if ($w >= $this->info['w'] && $h === 0 && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					return $this->url_files . $this->file['filename'];
				}
				if ($h >= $this->info['h'] && $w === 0 && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					return $this->url_files . $this->file['filename'];
				}
				if ($w >= $this->info['w'] && $h >= $this->info['h'] && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					return $this->url_files . $this->file['filename'];
				}

				return $this->getImage($id, $w, $h, $use_crop, $watermark);
			break;

			case 'document':
			case 'archive':
			case 'audio':
			case 'video':
				return $this->url_files . $this->file['filename'];
			break;
		}
	}

	public function getFileDownload($id = 0)
	{
		global $db;

		$id = (int) $id;

		if ($id === 0) die;

		$files = $db->select('files', ['filename', 'title'], ['id' => $id], __FILE__, __LINE__);
		$file = empty($files) ? false : $files[0];

		if ($file === false) die;

		$path = $this->dir_files . $file['filename'];

		if (!file_exists($path)) die;

		$mime = mime_content_type($path);
		$ext = pathinfo($path, PATHINFO_EXTENSION);
		$name = $file['title'];

		if (ob_get_level()) ob_end_clean();

		header('Content-Description: File Transfer');
		header('Content-Type: ' . $mime);
		header('Content-Disposition: attachment; filename=' . $name . '.' . $ext);
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($path));

		if ($fd = fopen($path, 'rb')) {
			while (!feof($fd)) {
				print fread($fd, 1024);
			}
			fclose($fd);
		}

		exit;
	}

	public function getPlaceholder($w = 0, $h = 0)
	{
		$w = (int) $w; $w = max($w, 10); $w = min($w, 5000);
		$h = (int) $h; $h = max($h, 10); $h = min($h, 5000);

		$canvas = imagecreatetruecolor($w, $h);
		$background = imagecolorallocate($canvas, 200, 200, 200);
		imagefill($canvas, 0, 0, $background);

		header('Content-type: image/jpeg');
		imagejpeg($canvas);
		imagedestroy($canvas);
		die;
	}

	public function clearCache($lock = false)
	{
		if ($lock === 'all') {
			array_map('unlink', glob($this->dir_cache . '*'));
			return false;
		}
		if ($lock && !empty($lock)) {
			array_map('unlink', glob($this->dir_cache . $lock . '*'));
		}
	}

	public function resetImageSize()
	{
		global $db;

		foreach (glob($this->dir_files . '*') as $file) {
			if (!is_file($file)) continue;

			$info = pathinfo($file);
			$size = $this->originalResize($info['basename']);

			$db->update('files', ['size' => implode(';', $size)], 'filename', $info['basename']);
		}
	}

	public function getFile($id = 0, $w = 0, $h = 0, $use_crop = false, $watermark = false)
	{
		$id = (int) $id;
		$w = (int) $w; $w = max($w, 0);
		$h = (int) $h; $h = max($h, 0);
		$use_crop = !empty($use_crop);
		$watermark = $this->verificationWatermark($watermark);

		$this->file = $this->verificationFile($id);

		if ($this->file === false) {
			$this->getPlaceholder($w > 0 ? $w : 500, $h > 0 ? $h : 500);
		}

		$this->info = pathinfo($this->path);
		$path = false;

		switch ($this->getType($this->info['extension'])) {
			case 'image':
				$info = getimagesize($this->path);
				$this->info['w'] = $info[0];
				$this->info['h'] = $info[1];
				$this->info['mime'] = $info['mime'];

				if ($w === 0 && $h === 0 && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					$path = $this->dir_files . $this->file['filename'];
				} else if ($w >= $this->info['w'] && $h === 0 && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					$path = $this->dir_files . $this->file['filename'];
				} else if ($h >= $this->info['h'] && $w === 0 && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					$path = $this->dir_files . $this->file['filename'];
				} else if ($w >= $this->info['w'] && $h >= $this->info['h'] && (!$use_crop || empty($this->file['crop'])) && $watermark === false) {
					$path = $this->dir_files . $this->file['filename'];
				} else {
					$path = $this->getImage($id, $w, $h, $use_crop, $watermark, true);
				}
			break;

			case 'document':
			case 'archive':
			case 'audio':
			case 'video':
				$path = $this->dir_files . $this->file['filename'];
			break;
		}

		if ($path) {
			$mime = mime_content_type($path);

			if (ob_get_level()) ob_end_clean();

			header_remove('Pragma');
			header_remove('Set-Cookie');
			header('Accept-Ranges: bytes');
			header('Cache-Control: max-age=31536000, public, immutable');
			header('Content-Length: ' . filesize($path));
			header('Content-Type: ' . $mime);
			header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 60*60*24*30) . ' GMT');
			header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filectime($path)) . ' GMT');

			if ($fd = fopen($path, 'rb')) {
				while (!feof($fd)) {
					print fread($fd, 1024);
				}
				fclose($fd);
			}

			exit;
		} else {
			$this->getPlaceholder($w > 0 ? $w : 500, $h > 0 ? $h : 500);
		}
	}
}
?>