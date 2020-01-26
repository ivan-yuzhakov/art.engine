<?php
class Database
{
	public $msi = null;

	private $dbHost = '';
	private $dbName = '';
	private $dbUser = '';
	private $dbPass = '';
	private $dbPrefix = '';

	private $errors = [
		'1000' => 'Cannot connect to the database! Most likely incorrect connection settings.',
		'1001' => 'Cannot connect to the database! DB_HOST is empty!',
		'1002' => 'Cannot connect to the database! DB_NAME is empty!',
		'1003' => 'Cannot connect to the database! DB_USER is empty!',
		'1004' => 'mysqli->set_charset failed!',
		'1010' => 'Использование инструкции "union" в строке запроса.',
		'1011' => 'Использование комментариев(/*, --) в строке запроса.',
		'1012' => 'Использование команды "set password" в строке запроса.',
		'1013' => 'Использование команды "benchmark" в строке запроса.',
		'1014' => 'Использование под-выборов(sub-selects) в строке запроса.',
		'1015' => "Кто-то попытался хакнуть ваш сайт через SQL-инъекцию! Попытка была успешно предотвращена. Данные атакующего:<br>ID пользователя: %s<br>IP пользователя: %s<br>Время: %s<br>Тип взлома: %s<br>Попытка атаковать запрос %s в файле %s на строке %s",
		'1016' => 'Некорректный запрос в базу данных. Администратор был уведомлен.'
	];

	function __construct($dbHost, $dbName, $dbUser, $dbPass, $dbPrefix)
	{
		if (empty($dbHost)) die($this->errors['1001']);
		if (empty($dbName)) die($this->errors['1002']);
		if (empty($dbUser)) die($this->errors['1003']);

		$this->dbHost = $dbHost;
		$this->dbName = $dbName;
		$this->dbUser = $dbUser;
		$this->dbPass = $dbPass;
		$this->dbPrefix = $dbPrefix;

		$this->connect();
	}

	private function connect()
	{
		$this->msi = @new mysqli($this->dbHost, $this->dbUser, $this->dbPass, $this->dbName);

		if ($this->msi->connect_error) {
			die($this->errors['1000'] . '<br>Error: ' . $this->msi->connect_error);
		}

		if (!$this->msi->set_charset('utf8')) die($this->errors['1004']);
	}

	function escape($str)
	{
		return $this->msi->real_escape_string($str);
	}

	function query($query, $file = null, $line = null)
	{
		if (empty($query)) return false;

		$query = str_replace('prefix_', $this->dbPrefix, $query);

		return $this->msi->query($query);
	}

	function refValues($arr)
	{
		$refs = [];
		foreach($arr as $key => $value)
			$refs[$key] = &$arr[$key];
		return $refs;
	}

	function prepare($query, $type = [], $args = [], $file = null, $line = null)
	{
		global $helpers;

		if (empty($query)) return false;

		$query = str_replace('prefix_', $this->dbPrefix, $query);

		$stmt = $this->msi->prepare($query);

		if ($stmt) {
			if (!empty($args)) {
				$type = implode('', $type);
				$arguments = array_merge([$type], $args);
				call_user_func_array([$stmt, 'bind_param'], $arguments);
			}
			$stmt->execute();

			return $stmt;
		} else {
			$helpers->mail('phpmail', MAIL_DEVELOPER_BACKEND, URL_SITE_SHORT . ': BD error!', 'Некорректный запрос в базу данных. Не удалось подготовить запрос.<br>Запрос: ' . $query . '<br>Файл: ' . $file . '<br>Линия: ' . $line . '<br>Типы данных: ' . implode(', ', $type) . '<br>Данные: ' . implode('<br>', $args));
			die($this->errors['1016']);
		}
	}

	function get_ai($db_name)
	{
		$query = $this->query('SHOW TABLE STATUS LIKE "prefix_' . $db_name . '"');
		$row = $query->fetch_assoc();

		return (int) $row['Auto_increment'];
	}

	function select($db_name, $fields = '*', $where = [], $file = null, $line = null)
	{
		$query_fields = $fields;
		if (is_array($query_fields)) {
			$query_fields = array_map(function($field){
				return '`' . $field . '`';
			}, $query_fields);
			$query_fields = implode(',', $query_fields);
		}

		$type = [];
		$args = [];

		if (empty($where)) {
			$sql = '';
		} else {
			$sql = [];
			foreach ($where as $key => $value) {
				if (is_array($value)) {
					if (empty($value)) continue;

					$str = [];
					foreach ($value as $i => $v) {
						$str[] = '`' . $key . '` = ?';
						$type[] = is_int($v) ? 'i' : 's';
						$args[] = &$where[$key][$i];
					}
					$sql[] = '(' . implode(' OR ', $str) . ')';
				} else {
					$sql[] = '`' . $key . '` = ?';
					$type[] = is_int($value) ? 'i' : 's';
					$args[] = &$where[$key];
				}
			}

			if (empty($sql)) {
				$sql = '';
			} else {
				$sql = ' WHERE ' . implode(' AND ', $sql);
			}
		}

		$stmt = $this->prepare('SELECT ' . $query_fields . ' FROM `prefix_' . $db_name . '`' . $sql, $type, $args, $file, $line);

		$result = $stmt->get_result();
		$stmt->close();

		$arr = [];
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$arr[] = $row;
			}
		}

		return $arr;
	}

	function insert($db_name, $fields = [], $file = null, $line = null)
	{
		$type = [];
		$args = [];

		$sql = [];
		foreach ($fields as $key => $value) {
			$sql[] = '`' . $key . '` = ?';
			$type[] = is_int($value) ? 'i' : 's';
			$args[] = &$fields[$key];
		}
		$sql = implode(', ', $sql);

		$stmt = $this->prepare('INSERT INTO `prefix_' . $db_name . '` SET ' . $sql, $type, $args, $file, $line);

		$result = $stmt->insert_id;
		$stmt->close();

		return $result;
	}

	function update($db_name, $fields = [], $id_key, $id_val, $file = null, $line = null)
	{
		$type = [];
		$args = [];

		// fields
		$sql = [];
		foreach ($fields as $key => $value) {
			$sql[] = '`' . $key . '` = ?';
			$type[] = is_int($value) ? 'i' : 's';
			$args[] = &$fields[$key];
		}
		$sql = implode(', ', $sql);

		// where
		$where = [];
		$ids = is_array($id_val) ? $id_val : [$id_val];
		foreach ($ids as $i => $id) {
			$where[] = '`' . $id_key . '` = ?';
			$type[] = is_int($id) ? 'i' : 's';
			$args[] = &$ids[$i];
		}
		$where = '(' . implode(' OR ', $where) . ')';

		$stmt = $this->prepare('UPDATE `prefix_' . $db_name . '` SET ' . $sql . ' WHERE ' . $where, $type, $args, $file, $line);

		$result = true;
		$stmt->close();

		return $result;
	}

	function delete($db_name, $id_key, $id_val, $file = null, $line = null)
	{
		$type = [];
		$args = [];

		$where = [];
		$ids = is_array($id_val) ? $id_val : [$id_val];
		foreach ($ids as $i => $id) {
			$where[] = '`' . $id_key . '` = ?';
			$type[] = is_int($id) ? 'i' : 's';
			$args[] = &$ids[$i];
		}
		$where = '(' . implode(' OR ', $where) . ')';

		$stmt = $this->prepare('DELETE FROM `prefix_' . $db_name . '` WHERE ' . $where, $type, $args, $file, $line);

		$result = true;
		$stmt->close();

		return $result;
	}

	function search($db_name, $fields = '*', $where = [], $file = null, $line = null)
	{
		$query_fields = $fields;
		if (is_array($query_fields)) {
			$query_fields = array_map(function($field){
				return '`' . $field . '`';
			}, $query_fields);
			$query_fields = implode(',', $query_fields);
		}

		$type = [];
		$args = [];

		if (empty($where)) {
			$sql = '';
		} else {
			$sql = [];
			foreach ($where as $key => $value) {
				if (is_int($key)) {
					$str = [];
					foreach ($value as $i => $v) {
						if (is_array($v)) {
							foreach ($v as $ind => $val) {
								$str[] = '`' . $i . '` LIKE ?';
								$type[] = is_int($val) ? 'i' : 's';
								$args[] = &$where[$key][$i][$ind];
							}
						} else {
							$str[] = '`' . $i . '` LIKE ?';
							$type[] = is_int($v) ? 'i' : 's';
							$args[] = &$where[$key][$i];
						}
					}
					$sql[] = '(' . implode(' OR ', $str) . ')';
				} else {
					if (is_array($value)) {
						$str = [];
						foreach ($value as $i => $v) {
							$str[] = '`' . $key . '` = ?';
							$type[] = is_int($v) ? 'i' : 's';
							$args[] = &$where[$key][$i];
						}
						$sql[] = '(' . implode(' OR ', $str) . ')';
					} else {
						$sql[] = '`' . $key . '` = ?';
						$type[] = is_int($value) ? 'i' : 's';
						$args[] = &$where[$key];
					}
				}
			}
			$sql = ' WHERE ' . implode(' AND ', $sql);
		}

		$stmt = $this->prepare('SELECT ' . $query_fields . ' FROM `prefix_' . $db_name . '`' . $sql, $type, $args, $file, $line);

		$result = $stmt->get_result();
		$stmt->close();

		$arr = [];
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$arr[] = $row;
			}
		}

		return $arr;
	}
}
?>