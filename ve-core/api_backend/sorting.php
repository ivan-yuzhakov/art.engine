<?php
if ($section === 'sorting')
{
	if ($query === 'get')
	{
		$sorting = $db->select('sorting', '*', [], __FILE__, __LINE__);

		$sorting = array_column($sorting, 'sorting', 'section');
		unset($sorting['items']);
		unset($sorting['files']);
		unset($sorting['files_groups']);

		json($sorting);
	}

	if ($query === 'set')
	{
		$section = $_POST['section'];
		$sorting = $_POST['sorting'];

		$result = $db->update('sorting', ['sorting' => $sorting], 'section', $section, __FILE__, __LINE__);

		if ($section === 'items') $db->update('settings', ['value' => time()], 'variable', 'lastUpdateItemsSorting', __FILE__, __LINE__);
		if ($section === 'files') $db->update('settings', ['value' => time()], 'variable', 'lastUpdateFilesSorting', __FILE__, __LINE__);

		if ($section === 'items') $core->cache->clearCache('theme_');

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}
}
?>