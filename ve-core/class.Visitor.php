<?php
class Visitor
{
	public $id;
	public $ip;
	public $lang;
	public $access;
	public $is_guest;
	public $is_admin;
	public $is_logged;
	public $fname;

	public function __construct()
	{
		global $db;

		$this->id = 0;
		$this->ip = $_SERVER['REMOTE_ADDR'];
		$this->lang = false;
		$this->access = 0;
		$this->is_guest = true;
		$this->is_admin = false;
		$this->is_logged = false;

		if (isset($_SESSION['id']) && $_SESSION['id'] > 0 && isset($_SESSION['ip']) && $_SESSION['ip'] == $this->ip) {
			$arr = $db->select('members', ['fname', 'access'], [
				'id' => (int) $_SESSION['id'],
			], __FILE__, __LINE__);

			if (!empty($arr)) {
				$this->id = $_SESSION['id'];
				$this->access = (int) $arr[0]['access'];
				$this->is_guest = false;
				$this->is_admin = $_SESSION['id'] === 1;
				$this->is_logged = true;
				$this->fname = $arr[0]['fname'];
			}
		}
	}

  	public function set_lang($lang = false)
	{
		global $settings;

		$langs_available = json_decode($settings['langFront'], true);
		// ISO 639-1 to ISO 639-2/T
		$langs_iso = ['ab'=>'abk','aa'=>'aar','af'=>'afr','ak'=>'aka','sq'=>'sqi','am'=>'amh','ar'=>'ara','an'=>'arg','hy'=>'hye','as'=>'asm','av'=>'ava','ae'=>'ave','ay'=>'aym','az'=>'aze','bm'=>'bam','ba'=>'bak','eu'=>'eus','be'=>'bel','bn'=>'ben','bh'=>'bih','bi'=>'bis','bs'=>'bos','br'=>'bre','bg'=>'bul','my'=>'mya','ca'=>'cat','ch'=>'cha','ce'=>'che','ny'=>'nya','zh'=>'zho','cv'=>'chv','kw'=>'cor','co'=>'cos','cr'=>'cre','hr'=>'hrv','cs'=>'ces','da'=>'dan','dv'=>'div','nl'=>'nld','dz'=>'dzo','en'=>'eng','eo'=>'epo','et'=>'est','ee'=>'ewe','fo'=>'fao','fj'=>'fij','fi'=>'fin','fr'=>'fra','ff'=>'ful','gl'=>'glg','ka'=>'kat','de'=>'deu','el'=>'ell','gn'=>'grn','gu'=>'guj','ht'=>'hat','ha'=>'hau','he'=>'heb','hz'=>'her','hi'=>'hin','ho'=>'hmo','hu'=>'hun','ia'=>'ina','id'=>'ind','ie'=>'ile','ga'=>'gle','ig'=>'ibo','ik'=>'ipk','io'=>'ido','is'=>'isl','it'=>'ita','iu'=>'iku','ja'=>'jpn','jv'=>'jav','kl'=>'kal','kn'=>'kan','kr'=>'kau','ks'=>'kas','kk'=>'kaz','km'=>'khm','ki'=>'kik','rw'=>'kin','ky'=>'kir','kv'=>'kom','kg'=>'kon','ko'=>'kor','ku'=>'kur','kj'=>'kua','la'=>'lat','lb'=>'ltz','lg'=>'lug','li'=>'lim','ln'=>'lin','lo'=>'lao','lt'=>'lit','lu'=>'lub','lv'=>'lav','gv'=>'glv','mk'=>'mkd','mg'=>'mlg','ms'=>'msa','ml'=>'mal','mt'=>'mlt','mi'=>'mri','mr'=>'mar','mh'=>'mah','mn'=>'mon','na'=>'nau','nv'=>'nav','nd'=>'nde','ne'=>'nep','ng'=>'ndo','nb'=>'nob','nn'=>'nno','no'=>'nor','ii'=>'iii','nr'=>'nbl','oc'=>'oci','oj'=>'oji','cu'=>'chu','om'=>'orm','or'=>'ori','os'=>'oss','pa'=>'pan','pi'=>'pli','fa'=>'fas','pl'=>'pol','ps'=>'pus','pt'=>'por','qu'=>'que','rm'=>'roh','rn'=>'run','ro'=>'ron','ru'=>'rus','sa'=>'san','sc'=>'srd','sd'=>'snd','se'=>'sme','sm'=>'smo','sg'=>'sag','sr'=>'srp','gd'=>'gla','sn'=>'sna','si'=>'sin','sk'=>'slk','sl'=>'slv','so'=>'som','st'=>'sot','es'=>'spa','su'=>'sun','sw'=>'swa','ss'=>'ssw','sv'=>'swe','ta'=>'tam','te'=>'tel','tg'=>'tgk','th'=>'tha','ti'=>'tir','bo'=>'bod','tk'=>'tuk','tl'=>'tgl','tn'=>'tsn','to'=>'ton','tr'=>'tur','ts'=>'tso','tt'=>'tat','tw'=>'twi','ty'=>'tah','ug'=>'uig','uk'=>'ukr','ur'=>'urd','uz'=>'uzb','ve'=>'ven','vi'=>'vie','vo'=>'vol','wa'=>'wln','cy'=>'cym','wo'=>'wol','fy'=>'fry','xh'=>'xho','yi'=>'yid','yo'=>'yor','za'=>'zha','zu'=>'zul'];

		if (isset($_COOKIE['FRONT_LANG']) && isset($langs_available[$_COOKIE['FRONT_LANG']])) {
			$this->lang = $_COOKIE['FRONT_LANG'];
		}

		if ((int) $settings['languagesUseDefaultLang'] === 1) {
			$this->lang = $settings['langFrontDefault'];
		}

		if ($this->lang === false) {
			$list = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']) : '';

			if (preg_match_all('/([a-z]{1,8}(?:-[a-z]{1,8})?)(?:;q=([0-9.]+))?/', $list, $list)) {
				$language = array_combine($list[1], $list[2]);
				foreach ($language as $n => $v) {
					$language[$n] = $v ? $v : 1;
				}
				arsort($language, SORT_NUMERIC);

				foreach ($language as $i => $v) {
					$s = strtok($i, '-');
					if (isset($langs_iso[$s]) && isset($langs_available[$langs_iso[$s]])) {
						$this->lang = $langs_iso[$s];
						break;
					}
				}
			}
		}

		if ($this->lang === false) {
			$this->lang = $settings['langFrontDefault'];
		}

		if (!$this->lang || empty($this->lang)) {
			$this->lang = 'eng';
		}

		setcookie('FRONT_LANG', $this->lang, time() + 60*60*24*30, '/');

		if ($lang !== false) {
			$lang_old = $this->lang;
			$lang_new = empty($lang) ? $lang_old : $lang;
			if (!isset($langs_available[$lang_new])) $lang_new = $lang_old;
			if (!isset($langs_available[$lang_new])) $lang_new = $settings['langFrontDefault'];

			setcookie('FRONT_LANG', $lang_new, time() + 60*60*24*30, '/');

			$redirect_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '/';
			header('Location: ' . $redirect_url);
			die;
		}
  	}

  	public function set_lang_temp($lang)
	{
		global $settings;

		$langs_available = json_decode($settings['langFront'], true);

		if (isset($langs_available[$lang])) {
			$this->lang = $lang;
		} else {
			$this->lang = $settings['langFrontDefault'];
		}
	}

  	public function login($login, $password)
	{
		global $db;

		$arr = $db->select('members', '*', [
			'login'    => $login,
			'password' => sha1($password . SALT),
			'access' => [2, 3, 4]
		], __FILE__, __LINE__);

		if (!empty($arr)) {
			$_SESSION['id'] = (int) $arr[0]['id'];
			$_SESSION['ip'] = $this->ip;

			return true;
		}

		return false;
  	}

	public function logout()
	{
		unset($_SESSION['id']);
		unset($_SESSION['ip']);
  	}
}
?>