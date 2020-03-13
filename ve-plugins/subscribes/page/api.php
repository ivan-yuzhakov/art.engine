<?php
if ($query === 'get')
{
	$subscribes = $db->select('subscribes', '*', [], __FILE__, __LINE__);
	$subscribes_groups = $db->select('subscribes_groups', '*', [], __FILE__, __LINE__);

	$json = [
		'subscribes' => $subscribes,
		'subscribes_groups' => $subscribes_groups
	];

	json($json);
}
if ($query === 'add')
{
	$json['id'] = $cl_query->addItem('subscribes', [
		'lang' => $_POST['lang'],
		'mail' => $_POST['mail'],
		'name' => $_POST['name'],
	]);
	$json['status'] = $json['id'] > 0 ? 'OK' : 'FAIL';

	json($json);
}
if ($query === 'edit')
{
	$data = [
		'lang' => $_POST['lang'],
		'mail' => $_POST['mail'],
		'name' => $_POST['name'],
	];

	$json['status'] = $cl_query->editItem('subscribes', $data, 'id', $_POST['id']);

	json($json);
}
if ($query === 'delete')
{
	$json['status'] = $cl_query->delete('subscribes', 'id', $_POST['id']);

	json($json);
}
if ($query === 'mail')
{
	$from_name = $_POST['from_name'];
	$from_mail = $_POST['from_mail'];
	$to = $_POST['to'];
	$date = $_POST['date'];
	$subject = $_POST['subject'];
	$message = $_POST['message'];

	$plugins = $db->select('plugins', '*', ['alias' => 'subscribes'], __FILE__, __LINE__);
	$plugin = empty($plugins) ? false : $plugins[0];
	$fields = json_decode($plugin['fields'], true);

	if ($fields['mailSender'] == 'phpmail') {
		$json = $helpers->mail($to, $subject, $message, $from_mail, $from_name);
		json($json);
	}
}
if ($query === 'add_group')
{
	$data = [
		'title' => $_POST['title']
	];

	$json['id'] = $cl_query->addItem('subscribes_groups', $data);
	$json['status'] = $json['id'] > 0 ? 'OK' : 'FAIL';

	json($json);
}
if ($query === 'edit_group')
{
	$data = [
		'title' => $_POST['title']
	];

	$json['status'] = $cl_query->editItem('subscribes_groups', $data, 'id', $_POST['id']);

	json($json);
}
if ($query === 'delete_group')
{
	$json['status'] = $cl_query->delete('subscribes_groups', 'id', $_POST['id']);

	json($json);
}
?>