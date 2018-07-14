<?php
class Core
{
	public $log;
	public $route;
	public $files;
	public $cache;
	public $minify;

	public function __construct()
	{
		$this->log = new Log();
		$this->route = new Route();
		$this->files = new Files();
		$this->cache = new Cache();
		$this->minify = new Minify();
	}
}
?>