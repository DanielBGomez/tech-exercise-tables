-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-07-2020 a las 02:34:19
-- Versión del servidor: 10.1.24-MariaDB
-- Versión de PHP: 7.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tech_test`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tables`
--

CREATE TABLE `tables` (
  `table_id` bigint(20) UNSIGNED NOT NULL,
  `table_uuid` char(36) COLLATE utf8_unicode_ci NOT NULL,
  `table_name` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `table_status` tinyint(1) NOT NULL,
  `zone_id` bigint(20) UNSIGNED DEFAULT NULL,
  `table_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `table_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `tables`
--

INSERT INTO `tables` (`table_id`, `table_uuid`, `table_name`, `table_status`, `zone_id`, `table_updated`, `table_created`) VALUES
(4, 'f4a69ccc-0181-4090-98ce-fa4447f30378', 'Mesa #1', 0, 4, '2020-07-22 23:58:16', '2020-07-22 23:58:16'),
(6, 'cb2e9b6e-ad39-4f56-9204-64fefe343b4b', 'Mesa #3', 0, 4, '2020-07-22 23:58:50', '2020-07-22 23:58:50'),
(7, '9a94e4db-bf8b-4c3c-9110-08cb7ef48cc6', 'Mesa #4', 0, 3, '2020-07-22 23:58:59', '2020-07-22 23:58:59'),
(8, '86de2ede-36c2-497b-89d2-caf1d9783e38', 'Mesa #2', 1, 4, '2020-07-23 00:15:10', '2020-07-23 00:14:34'),
(9, 'a72912f0-c5ab-4c16-82f6-62a9bf372312', 'Mesa #5', 0, 4, '2020-07-23 00:15:02', '2020-07-23 00:14:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `user_code` char(4) COLLATE utf8_unicode_ci NOT NULL,
  `user_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_image` varchar(512) COLLATE utf8_unicode_ci NOT NULL,
  `user_password` char(128) COLLATE utf8_unicode_ci NOT NULL,
  `user_salt` char(128) COLLATE utf8_unicode_ci NOT NULL,
  `user_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`user_id`, `user_code`, `user_uuid`, `user_name`, `user_image`, `user_password`, `user_salt`, `user_updated`, `user_created`) VALUES
(4, '3269', '5a06438e-6ce5-4b56-b3e8-b0ab477e4b5c', 'Daniel Gómez', 'https://randomuser.me/api/portraits/men/1.jpg', '4b32bdda260daef62e5ecdf1b7ce98f76ffd68b33e366b5677a5ba794247832190fef24bac26f0077969d44a2ec034fbbf332ba3123326749384f593e3182e86', '590b1761a7f0629d5624c4c90106c3809db407c2f79788a5b0a64846b213145eb5d322ad6290d5abfc33be8725a3b058975331fb093910890b0715b8f7645b2e', '2020-07-22 18:01:49', '2020-07-22 18:01:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `zones`
--

CREATE TABLE `zones` (
  `zone_id` bigint(20) UNSIGNED NOT NULL,
  `zone_uuid` char(36) COLLATE utf8_unicode_ci NOT NULL,
  `zone_name` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `zone_image` varchar(512) COLLATE utf8_unicode_ci NOT NULL,
  `zone_status` tinyint(1) NOT NULL DEFAULT '1',
  `zone_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `zone_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `zones`
--

INSERT INTO `zones` (`zone_id`, `zone_uuid`, `zone_name`, `zone_image`, `zone_status`, `zone_updated`, `zone_created`) VALUES
(2, 'bba87afd-45c8-47b6-b412-93aa44858a19', 'Barra', 'https://images.pexels.com/photos/34650/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', 1, '2020-07-23 00:10:11', '2020-07-22 20:17:20'),
(3, '985ed0b0-51fb-4aca-9bd1-1a5e7482b94c', 'Salón principal', 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', 1, '2020-07-22 20:20:36', '2020-07-22 20:20:36'),
(4, '9821eec3-737c-4482-87a7-5d511e12c8e2', 'Entrada', 'https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', 1, '2020-07-22 20:21:56', '2020-07-22 20:21:56'),
(5, 'f154c812-36a3-48b2-8c81-771b2e0d1d83', 'Terraza', 'https://images.pexels.com/photos/6458/city-restaurant-lunch-outside.jpg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260', 1, '2020-07-23 00:07:43', '2020-07-23 00:07:43');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`table_id`),
  ADD UNIQUE KEY `table_uuid` (`table_uuid`),
  ADD KEY `table_name` (`table_name`),
  ADD KEY `zone_id` (`zone_id`),
  ADD KEY `table_status` (`table_status`),
  ADD KEY `table_updated` (`table_updated`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_code` (`user_code`),
  ADD UNIQUE KEY `user_uuid` (`user_uuid`),
  ADD KEY `user_updated` (`user_updated`);

--
-- Indices de la tabla `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`zone_id`),
  ADD UNIQUE KEY `zone_uuid` (`zone_uuid`),
  ADD KEY `zone_name` (`zone_name`),
  ADD KEY `zone_status` (`zone_status`),
  ADD KEY `zone_updated` (`zone_updated`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tables`
--
ALTER TABLE `tables`
  MODIFY `table_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de la tabla `zones`
--
ALTER TABLE `zones`
  MODIFY `zone_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tables`
--
ALTER TABLE `tables`
  ADD CONSTRAINT `Zone - Table` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`zone_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
