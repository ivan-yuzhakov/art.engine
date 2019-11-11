<?php
if ($section === 'members')
{
	if ($query === 'get')
	{
		$users = $db->select('members', '*', [], __FILE__, __LINE__);
		$users = array_map(function($user){
			unset($user['password']);
			return $user;
		}, $users);
		$users = array_column($users, null, 'id');

		$sorting = $db->select('settings', ['value'], ['variable' => 'sort_users_root'], __FILE__, __LINE__);
		$sorting = $sorting[0]['value'];

		json([
			'members' => $users,
			'logged' => $visitor->id,
			'sorting' => $sorting
		]);
	}

	if ($query === 'add')
	{
		if ($visitor->id == 1) {
			$data = [
				'login'     => $_POST['login'],
				'password'  => sha1($_POST['password'] . SALT),
				'fname'     => $_POST['fname'],
				'lname'     => $_POST['lname'],
				'phone'     => $_POST['phone'],
				'email'     => $_POST['email'],
				'image'     => (int) $_POST['image'],
				'desc'      => $_POST['desc'],
				'company'   => $_POST['company'],
				'address_1' => $_POST['address_1'],
				'address_2' => $_POST['address_2'],
				'access'    => $_POST['access']
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
		if ($visitor->id == 1 || $visitor->id == $_POST['id']) {
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
				'access'    => $_POST['access']
			];
			if (!empty($_POST['password'])) {
				$data['password'] = sha1($_POST['password'] . SALT);
			}

			$result = $db->update('members', $data, 'id', $_POST['id'], __FILE__, __LINE__);

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

		$db->update('settings', ['value' => $sort], 'variable', 'sort_users_root', __FILE__, __LINE__);

		json(['status' => true]);
	}
}
?>