-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Мар 24 2020 г., 16:31
-- Версия сервера: 5.5.53-log
-- Версия PHP: 7.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `art`
--

-- --------------------------------------------------------

--
-- Структура таблицы `ve_database`
--

CREATE TABLE `ve_database` (
  `id` int(11) NOT NULL,
  `image` int(11) NOT NULL DEFAULT '0',
  `uid` tinytext NOT NULL,
  `type` int(1) NOT NULL DEFAULT '1',
  `unique` int(1) NOT NULL DEFAULT '1',
  `private_title` text NOT NULL,
  `public_title` text NOT NULL,
  `fields` longtext NOT NULL,
  `date_added` int(20) NOT NULL,
  `date_change` int(20) NOT NULL,
  `edited` int(11) NOT NULL DEFAULT '0',
  `del` tinyint(1) NOT NULL DEFAULT '0',
  `ed_status` tinyint(4) NOT NULL,
  `ed_fields` text NOT NULL,
  `ed_note` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_database_pdf`
--

CREATE TABLE `ve_database_pdf` (
  `id` int(11) NOT NULL,
  `date_create` int(11) NOT NULL,
  `template` tinytext NOT NULL,
  `file` tinytext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_drafts`
--

CREATE TABLE `ve_drafts` (
  `id` int(11) NOT NULL,
  `section` tinytext NOT NULL,
  `item` int(11) NOT NULL,
  `value` mediumtext NOT NULL,
  `time` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_editions`
--

CREATE TABLE `ve_editions` (
  `id` int(11) NOT NULL,
  `item` int(11) NOT NULL,
  `title` tinytext NOT NULL,
  `count` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_editions_items`
--

CREATE TABLE `ve_editions_items` (
  `id` int(11) NOT NULL,
  `edition` int(11) NOT NULL,
  `n` int(11) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `fields` text NOT NULL,
  `captions` mediumtext NOT NULL,
  `password` tinytext NOT NULL,
  `note` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_fields`
--

CREATE TABLE `ve_fields` (
  `id` int(11) NOT NULL,
  `private_title` text NOT NULL,
  `public_title` text NOT NULL,
  `type` text NOT NULL,
  `value` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_fields_groups`
--

CREATE TABLE `ve_fields_groups` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `settings` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_files`
--

CREATE TABLE `ve_files` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `filename` text NOT NULL,
  `title` text NOT NULL,
  `desc` text,
  `size` text,
  `crop` text,
  `filename_original` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_files_groups`
--

CREATE TABLE `ve_files_groups` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `title` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_help_tickets`
--

CREATE TABLE `ve_help_tickets` (
  `id` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `title` tinytext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_help_tickets_items`
--

CREATE TABLE `ve_help_tickets_items` (
  `id` int(11) NOT NULL,
  `ticket` int(11) NOT NULL,
  `id_item` int(11) NOT NULL,
  `desc` text NOT NULL,
  `user` tinytext NOT NULL,
  `readed` int(1) NOT NULL,
  `date` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_items`
--

CREATE TABLE `ve_items` (
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
  `sp` smallint(6) NOT NULL DEFAULT '0',
  `sc` mediumtext NOT NULL,
  `date_added` int(20) NOT NULL DEFAULT '0',
  `date_change` int(20) NOT NULL DEFAULT '0',
  `edited` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_members`
--

CREATE TABLE `ve_members` (
  `id` int(11) NOT NULL,
  `login` text NOT NULL,
  `password` text NOT NULL,
  `salt` tinytext NOT NULL,
  `fname` tinytext NOT NULL,
  `lname` tinytext NOT NULL,
  `email` tinytext NOT NULL,
  `image` int(11) NOT NULL,
  `desc` text NOT NULL,
  `phone` tinytext NOT NULL,
  `company` tinytext NOT NULL,
  `address_1` tinytext NOT NULL,
  `address_2` tinytext NOT NULL,
  `access` int(11) NOT NULL,
  `group` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

--
-- Дамп данных таблицы `ve_members`
--

INSERT INTO `ve_members` (`id`, `login`, `password`, `salt`, `fname`, `lname`, `email`, `image`, `desc`, `phone`, `company`, `address_1`, `address_2`, `access`, `group`) VALUES
(1, 'Vortex', '35e9d71a53b69ec8b2dc9d4334c02ffb9a1c2d30', '', 'Administrator', '', '', 0, '', '', '', '', '', 4, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `ve_members_groups`
--

CREATE TABLE `ve_members_groups` (
  `id` int(11) NOT NULL,
  `title` tinytext NOT NULL,
  `type` int(1) NOT NULL,
  `access` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_plugins`
--

CREATE TABLE `ve_plugins` (
  `id` int(11) NOT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  `show` int(1) NOT NULL DEFAULT '0',
  `alias` tinytext NOT NULL,
  `fields` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `ve_settings`
--

CREATE TABLE `ve_settings` (
  `variable` tinytext NOT NULL,
  `value` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `ve_settings`
--

INSERT INTO `ve_settings` (`variable`, `value`) VALUES
('twitterConsumerSecret', ''),
('twitterConsumerKey', ''),
('googleAnalyticsId', ''),
('googleAnalyticsTracking', ''),
('googleAnalyticsUse', '0'),
('googleAnalyticsPassword', ''),
('googleAnalyticsLogin', ''),
('siteKeywords', ''),
('siteDescription', ''),
('maintenanceMode', '0'),
('twitterOauthToken', ''),
('twitterOauthSecret', ''),
('siteTitle', 'Art Engine'),
('siteImage', ''),
('langFront', '{\"eng\":\"English\"}'),
('langFrontDefault', 'eng'),
('instagramAccessToken', ''),
('twitterSite', ''),
('routing', '{}'),
('lastUpdateItems', '0'),
('httpsRewrite', '0'),
('facebookAppID', ''),
('facebookAppSecret', ''),
('facebookToken', ''),
('facebookGroupId', ''),
('facebookPages', '[]'),
('lastUpdateItemsSorting', '0'),
('imageUploadResize', '0'),
('imageUploadResizeW', '1920'),
('imageUploadResizeH', '1920'),
('imageUploadResizeQ', '100'),
('lastUpdateFiles', '0'),
('lastUpdateFilesSorting', '0'),
('updateServerCore', 'http://update.vortexgroup.org'),
('languagesUseDefaultLang', '0'),
('cacheTime', '2592000'),
('constants', '{}'),
('database', '{\"pdf_templates\":[],\"view\":\"table\",\"type\":1,\"fields\":[],\"display\":[],\"unique\":[],\"uid\":{\"use\":true,\"mask\":\"UID\",\"separate\":\"-\",\"template\":[\"mask\",\"id\"]},\"style\":\"\",\"ed_type\":\"Regular\"}'),
('sort_items_root', ''),
('sort_users_root', ''),
('sort_users_groups', '');

-- --------------------------------------------------------

--
-- Структура таблицы `ve_sorting`
--

CREATE TABLE `ve_sorting` (
  `id` int(11) NOT NULL,
  `section` tinytext NOT NULL,
  `sorting` longtext CHARACTER SET utf8 NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Дамп данных таблицы `ve_sorting`
--

INSERT INTO `ve_sorting` (`id`, `section`, `sorting`) VALUES
(2, 'files', ''),
(3, 'files_groups', ''),
(4, 'fields', ''),
(5, 'fields_groups', ''),
(7, 'subscribes', ''),
(8, 'subscribes_groups', '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `ve_database`
--
ALTER TABLE `ve_database`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_database_pdf`
--
ALTER TABLE `ve_database_pdf`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_drafts`
--
ALTER TABLE `ve_drafts`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_editions`
--
ALTER TABLE `ve_editions`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_editions_items`
--
ALTER TABLE `ve_editions_items`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_fields`
--
ALTER TABLE `ve_fields`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_fields_groups`
--
ALTER TABLE `ve_fields_groups`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_files`
--
ALTER TABLE `ve_files`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_files_groups`
--
ALTER TABLE `ve_files_groups`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_help_tickets`
--
ALTER TABLE `ve_help_tickets`
  ADD UNIQUE KEY `id` (`id`);

--
-- Индексы таблицы `ve_help_tickets_items`
--
ALTER TABLE `ve_help_tickets_items`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_items`
--
ALTER TABLE `ve_items`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_members`
--
ALTER TABLE `ve_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `memberName` (`login`(30));

--
-- Индексы таблицы `ve_members_groups`
--
ALTER TABLE `ve_members_groups`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_plugins`
--
ALTER TABLE `ve_plugins`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `ve_settings`
--
ALTER TABLE `ve_settings`
  ADD PRIMARY KEY (`variable`(75));

--
-- Индексы таблицы `ve_sorting`
--
ALTER TABLE `ve_sorting`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `ve_database`
--
ALTER TABLE `ve_database`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_database_pdf`
--
ALTER TABLE `ve_database_pdf`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_drafts`
--
ALTER TABLE `ve_drafts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_editions`
--
ALTER TABLE `ve_editions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_editions_items`
--
ALTER TABLE `ve_editions_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_fields`
--
ALTER TABLE `ve_fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_fields_groups`
--
ALTER TABLE `ve_fields_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_files`
--
ALTER TABLE `ve_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_files_groups`
--
ALTER TABLE `ve_files_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_help_tickets`
--
ALTER TABLE `ve_help_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_help_tickets_items`
--
ALTER TABLE `ve_help_tickets_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_items`
--
ALTER TABLE `ve_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_members`
--
ALTER TABLE `ve_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT для таблицы `ve_members_groups`
--
ALTER TABLE `ve_members_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_plugins`
--
ALTER TABLE `ve_plugins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `ve_sorting`
--
ALTER TABLE `ve_sorting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
