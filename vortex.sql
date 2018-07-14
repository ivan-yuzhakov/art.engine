/*
	Vortex Engine
	MySQL dump base version 7.3.13
*/

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `ve_bases` (
  `id` int(11) NOT NULL,
  `title` tinytext NOT NULL,
  `fields` text NOT NULL,
  `date_added` int(20) NOT NULL,
  `date_change` int(20) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_bases_items` (
  `id` int(11) NOT NULL,
  `base` int(11) NOT NULL,
  `uid` tinytext NOT NULL,
  `private_title` text NOT NULL,
  `public_title` text NOT NULL,
  `fields` longtext NOT NULL,
  `date_added` int(20) NOT NULL,
  `date_change` int(20) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_fields` (
  `id` int(11) NOT NULL,
  `used` int(11) NOT NULL,
  `private_title` text NOT NULL,
  `public_title` text NOT NULL,
  `type` text NOT NULL,
  `value` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_fields_groups` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `settings` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_files` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `filename` text NOT NULL,
  `title` text NOT NULL,
  `desc` text NOT NULL,
  `size` text NOT NULL,
  `crop` text NOT NULL,
  `filename_original` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_files_groups` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `title` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_items` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `show` tinyint(1) NOT NULL DEFAULT '1',
  `views` int(11) NOT NULL DEFAULT '0',
  `private_title` text NOT NULL,
  `public_title` text NOT NULL,
  `alias` text NOT NULL,
  `meta_title` text NOT NULL,
  `meta_desc` text NOT NULL,
  `meta_keys` text NOT NULL,
  `desc` mediumtext NOT NULL,
  `image` text NOT NULL,
  `fields` mediumtext NOT NULL,
  `group` int(11) NOT NULL,
  `date_added` int(20) NOT NULL DEFAULT '0',
  `date_change` int(20) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_members` (
  `id` int(11) NOT NULL,
  `login` text NOT NULL,
  `name` text NOT NULL,
  `password` text NOT NULL,
  `mail` text NOT NULL,
  `image` int(11) NOT NULL,
  `desc` text NOT NULL,
  `phone` text NOT NULL,
  `access` int(11) NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `ve_members` (`id`, `login`, `name`, `password`, `mail`, `image`, `desc`, `phone`, `access`) VALUES
(1, 'Vortex', 'Administrator', '35e9d71a53b69ec8b2dc9d4334c02ffb9a1c2d30', '', 0, '', '', 4);

CREATE TABLE IF NOT EXISTS `ve_plugins` (
  `id` int(11) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  `show` int(1) NOT NULL DEFAULT '0',
  `alias` tinytext NOT NULL,
  `fields` text NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

INSERT INTO `ve_plugins` (`id`, `status`, `show`, `alias`, `fields`) VALUES
(1, 0, 0, 'subscribes', '{"mailSender":"phpmail","mailMandrillKey":"NidSdLQXFAoYSTEy753aVw"}'),
(2, 0, 0, 'bases', '{}'),
(3, 0, 0, 'square', ''),
(4, 0, 0, 'paypal', '{}');

CREATE TABLE IF NOT EXISTS `ve_settings` (
  `variable` tinytext NOT NULL,
  `value` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `ve_settings` (`variable`, `value`) VALUES
('cacheTime', '2592000'),
('constants', '{}'),
('languagesUseDefaultLang', '0'),
('updateServerCore', 'http://update.vortexgroup.org'),
('imageUploadResize', '0'),
('imageUploadResizeW', '1920'),
('imageUploadResizeH', '1920'),
('imageUploadResizeQ', '100'),
('lastUpdateItems', ''),
('lastUpdateItemsSorting', ''),
('lastUpdateFiles', ''),
('lastUpdateFilesSorting', ''),
('httpsRewrite', '0'),
('siteKeywords', ''),
('siteDescription', ''),
('maintenanceMode', '0'),
('googleAnalyticsUse', '0'),
('googleAnalyticsPassword', ''),
('googleAnalyticsLogin', ''),
('googleAnalyticsTracking', ''),
('googleAnalyticsId', ''),
('twitterConsumerKey', ''),
('twitterConsumerSecret', ''),
('twitterOauthToken', ''),
('twitterOauthSecret', ''),
('siteTitle', 'Vortex Engine'),
('siteImage', ''),
('langFront', '{"eng":"English"}'),
('langFrontDefault', 'eng'),
('instagramAccessToken', ''),
('twitterSite', ''),
('routing', '{"/":["index",true,true]}'),
('facebookAppID', ''),
('facebookAppSecret', ''),
('facebookToken', ''),
('facebookGroupId', ''),
('facebookPages', '[]');

CREATE TABLE IF NOT EXISTS `ve_sorting` (
  `id` int(11) NOT NULL,
  `section` tinytext NOT NULL,
  `sorting` longtext NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

INSERT INTO `ve_sorting` (`id`, `section`, `sorting`) VALUES
(1, 'items', ''),
(2, 'files', ''),
(3, 'files_groups', ''),
(4, 'fields', ''),
(5, 'fields_groups', ''),
(6, 'users', '1:#'),
(7, 'subscribes', ''),
(8, 'subscribes_groups', '');

CREATE TABLE IF NOT EXISTS `ve_subscribes` (
  `id` int(11) NOT NULL,
  `lang` tinytext NOT NULL,
  `mail` tinytext NOT NULL,
  `name` tinytext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ve_subscribes_groups` (
  `id` int(11) NOT NULL,
  `title` tinytext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

ALTER TABLE `ve_bases` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_bases_items` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_fields` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_fields_groups` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_files` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_files_groups` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_items` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_members` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_plugins` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_settings` ADD PRIMARY KEY (`variable`(75));
ALTER TABLE `ve_sorting` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_subscribes` ADD PRIMARY KEY (`id`);
ALTER TABLE `ve_subscribes_groups` ADD PRIMARY KEY (`id`);

ALTER TABLE `ve_bases` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_bases_items` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_fields` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_fields_groups` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_files` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_files_groups` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_items` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_members` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
ALTER TABLE `ve_plugins` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
ALTER TABLE `ve_sorting` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
ALTER TABLE `ve_subscribes` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ve_subscribes_groups` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;