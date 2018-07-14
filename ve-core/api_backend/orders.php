<?php
if ($section === 'orders')
{
	if ($query === 'get')
	{
		$orders = $db->select('orders', '*', [], __FILE__, __LINE__);

		json(['orders' => $orders]);
	}

	if ($query === 'edit')
	{
		$result = $db->update('orders', [
			'customer_name' => $_POST['name'],
			'customer_tele' => $_POST['phone'],
			'customer_email' => $_POST['mail'],
			'customer_comments' => $_POST['comment'],
			'order_status' => $_POST['status'],
			'order_items' => $_POST['items']
		], 'id', $_POST['id'], __FILE__, __LINE__);

		return $result ? 'OK' : 'FAIL';
	}

	if ($query === 'delete')
	{
		$result = $db->delete('orders', 'id', $_REQUEST['id'], __FILE__, __LINE__);

		return $result ? 'OK' : 'FAIL';
	}
}
?>