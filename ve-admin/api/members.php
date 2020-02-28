<?php
if ($section === 'members')
{
	function generate(){
		global $db;

		$chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		$numChars = strlen($chars);
		$salt = '';

		for ($i = 0; $i < 6; $i++) {
			$salt .= substr($chars, rand(1, $numChars) - 1, 1);
		}

		$items = $db->select('members', ['id'], ['salt' => $salt], __FILE__, __LINE__);

		if (empty($items)) {
			return $salt;
		} else {
			return generate();
		}
	}

	if ($query === 'get_list')
	{
		$users = $db->select('members', '*', [], __FILE__, __LINE__);
		$users = array_map(function($user){
			unset($user['password']);
			unset($user['salt']);
			return $user;
		}, $users);
		$users = array_column($users, null, 'id');

		$groups = $db->select('members_groups', '*', [], __FILE__, __LINE__);
		$groups = array_map(function($group){
			$group['access'] = json_decode($group['access'], true);
			return $group;
		}, $groups);
		$groups = array_column($groups, null, 'id');

		$u_sorting = $db->select('settings', ['value'], ['variable' => ['sort_users_groups', 'sort_users_root']], __FILE__, __LINE__);
		$g_sorting = $u_sorting[0]['value'];
		$u_sorting = $u_sorting[1]['value'];

		json([
			'users' => $users,
			'groups' => $groups,
			'logged' => $visitor->id,
			'access2' => $visitor->access2,
			'g_sorting' => $g_sorting,
			'u_sorting' => $u_sorting
		]);
	}

	if ($query === 'groups_add')
	{
		if ($visitor->id == 1) {
			$data = [
				'title'  => $_POST['title'],
				'type'   => $_POST['type'],
				'access' => $_POST['access']
			];

			$json['id'] = $db->insert('members_groups', $data, __FILE__, __LINE__);
			$json['status'] = $json['id'] ? true : false;
		} else {
			$json['status'] = false;
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'groups_edit')
	{
		if ($visitor->id == 1) {
			$data = [
				'title'  => $_POST['title'],
				'access' => $_POST['access']
			];

			$result = $db->update('members_groups', $data, 'id', $_POST['id'], __FILE__, __LINE__);

			$json['status'] = $result ? true : false;
		} else {
			$json['status'] = false;
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'groups_remove')
	{
		$id = (int) $_POST['id'];

		if ($visitor->id === 1) {
			$result = $db->delete('members_groups', 'id', $id, __FILE__, __LINE__);

			$json['status'] = $result ? true : false;
		} else {
			$json['status'] = false;
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'add')
	{
		if ($visitor->id == 1) {
			$salt = generate();
			$data = [
				'login'     => $_POST['login'],
				'password'  => sha1($_POST['password'] . SALT . $salt),
				'salt'      => $salt,
				'fname'     => $_POST['fname'],
				'lname'     => $_POST['lname'],
				'phone'     => $_POST['phone'],
				'email'     => $_POST['email'],
				'image'     => (int) $_POST['image'],
				'desc'      => $_POST['desc'],
				'company'   => $_POST['company'],
				'address_1' => $_POST['address_1'],
				'address_2' => $_POST['address_2'],
				'access'    => $_POST['access'],
				'group'     => $_POST['group']
			];

			$json['id'] = $db->insert('members', $data, __FILE__, __LINE__);
			$json['status'] = $json['id'] > 1 ? true : false;
		} else {
			$json['status'] = false;
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'edit')
	{
		$id = (int) $_POST['id'];

		if ($visitor->id == 1 || $visitor->id == $id) {
			$data = [
				'login'     => $_POST['login'],
				'desc'      => $_POST['desc'],
				'image'     => $_POST['image'],
				'email'     => $_POST['email'],
				'phone'     => $_POST['phone'],
				'fname'     => $_POST['fname'],
				'lname'     => $_POST['lname'],
				'company'   => $_POST['company'],
				'address_1' => $_POST['address_1'],
				'address_2' => $_POST['address_2'],
				'access'    => $_POST['access'],
				'group'     => $_POST['group']
			];
			if ($visitor->id == $id) unset($data['group']);
			if (!empty($_POST['password'])) {
				$salt = generate();
				$data['salt'] = $salt;
				$data['password'] = sha1($_POST['password'] . SALT . $salt);
			}

			$result = $db->update('members', $data, 'id', $id, __FILE__, __LINE__);

			$json['status'] = $result ? true : false;
		} else {
			$json['status'] = false;
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'remove')
	{
		$id = (int) $_POST['id'];

		if ($id == 1) {
			$json['status'] = false;
			$json['error'] = 'You can not delete the administrator';
		} else if ($visitor->id === 1 || $visitor->id === $id) {
			$result = $db->delete('members', 'id', $id, __FILE__, __LINE__);

			$json['status'] = $result ? true : false;
		} else {
			$json['status'] = false;
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'set_sort')
	{
		$sort = $_POST['sort'];
		$s = $_POST['s'];

		$db->update('settings', ['value' => $sort], 'variable', ($s === 'users' ? 'sort_users_root' : 'sort_users_groups'), __FILE__, __LINE__);

		json(['status' => true]);
	}
}
?>