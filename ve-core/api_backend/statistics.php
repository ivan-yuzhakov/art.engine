<?php
if ($section == 'statistics' && $query == 'get')
{
	$json = array('status' => 1);

	function GA($start_date = null, $end_date = null)
	{
		global $settings, $json;

		require_once(DIR_CORE . 'library/class.gapi.php');

		// https://github.com/DandyDev/gapi-php
		$ga = new Gapi($settings['googleAnalyticsLogin'], $settings['googleAnalyticsPassword']);
		$id = $settings['googleAnalyticsId'];

		// https://developers.google.com/analytics/devguides/reporting/core/dimsmets
		// Посещения по странам
		$results = $ga->requestReportData($id, 'country', 'visits', '-visits', null, $start_date, $end_date);
		foreach($results as $result) {
			$i = $result->getCountry();
			$el = $result->getVisits();
			$country[$i] = $el;
		}
		$json['country'] = $country;

		// Поисковые системы
		$results = $ga->requestReportData($id, 'source', 'visits', '-visits', null, $start_date, $end_date);
		foreach($results as $result) {
			$i = $result->getSource();
			$el = $result->getVisits();
			$source[$i] = $el;
		}
		$json['source'] = $source;

		// Самое популярное
		$results = $ga->requestReportData($id, 'pagePath', 'pageviews', '-pageviews', null, $start_date, $end_date, 1, 10);
		foreach($results as $result) {
			$i = $result->getPagePath();
			$el = $result->getPageviews();
			$popular[$i] = $el;
		}
		$json['popular'] = $popular;

		// Уникальные посетители по месяцам
		$results = $ga->requestReportData($id, array('year', 'month'), 'visits', array('year', 'month'), null, $start_date, $end_date);
		foreach($results as $result) {
			$i = $result->getMonth() . '.' . $result->getYear();
			$el = $result->getVisits();
			$time[$i] = $el;
		}
		$json['time'] = $time;

		// Длительность пребывания на сайте
		//$results = $ga->requestReportData($id, 'timeOnSite', 'visits', null, null, $start_date, $end_date);
		/*$temp = $ga->getResults();
		$TOS = array();
		foreach ($temp as $k => $v)
			foreach ($v as $key => $val)
				if ($key == 'metrics') $TOS = array('visits' => $val['visits'], 'timeOnSite' => $val['timeOnSite']);*/
				
				
		/*foreach($results as $result) {
			$i = $result->getPagePath();
			$el = $result->getVisits();
			$time[$i] = $el;
		}
		$json['time'] = $time;*/

		// Посетители и просмотры страниц в зависимости от времени
		/*$ga->requestReportData($id, null, array('visits', 'pageviews', 'newVisits', 'percentNewVisits'), null, null, null, $start_date, $end_date, 1, $max_res);
		$temp = $ga->getResults();
		foreach ($temp[0] as $k => $v) {
			$res = $v;
			break;
		}
		$visits = array('visits' => $res['visits'], 'pageviews' => $res['pageviews'], 'newVisits' => @$res['newVisits'], 'percent_newVisits' => @$res['percentNewVisits']);*/

		// Операционные системы и браузеры. И их версии.
		/*$ga->requestReportData($id, array('operatingSystem', 'operatingSystemVersion', 'browser', 'browserVersion'),array('visits'), null, '-visits', null, $start_date, $end_date, 1, $max_res);
		$temp = $ga->getResults();
		$osbro = array();
		foreach ($temp as $k => $v)
		  foreach ($v as $key => $val)
			$osbro[$k] = array('visits' => (isset($val['visits']) && $val['visits'] !== null ? $val['visits'] : $osbro[$k]['visits']), 'os' => @$val['operatingSystem'], 'osv' => @$val['operatingSystemVersion'], 'b' => @$val['browser'], 'bv' => @$val['browserVersion']);*/
	}

	if ((int)$settings['googleAnalyticsUse'] === 1 && !empty($settings['googleAnalyticsLogin']) && !empty($settings['googleAnalyticsPassword']) && !empty($settings['googleAnalyticsId'])) {
		$date_start = date('Y-m-d', strtotime('-12 month'));
		$date_end = date('Y-m-d');
		GA($date_start, $date_end);
	} else {
		$json['status'] = 2;
	}

	json($json);
}
?>