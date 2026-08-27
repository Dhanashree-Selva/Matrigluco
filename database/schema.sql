-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 27, 2026 at 06:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `matrigluco`
--
CREATE DATABASE IF NOT EXISTS `matrigluco` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `matrigluco`;

-- --------------------------------------------------------

--
-- Table structure for table `ai_models`
--

DROP TABLE IF EXISTS `ai_models`;
CREATE TABLE `ai_models` (
  `id` varchar(36) NOT NULL,
  `model_key` varchar(80) NOT NULL,
  `display_name` varchar(120) NOT NULL,
  `version` varchar(40) NOT NULL,
  `provider` varchar(40) NOT NULL,
  `format` varchar(20) NOT NULL,
  `artifact_path` varchar(500) NOT NULL,
  `context_length` int(11) NOT NULL,
  `quantization` varchar(30) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_usage_logs`
--

DROP TABLE IF EXISTS `ai_usage_logs`;
CREATE TABLE `ai_usage_logs` (
  `id` char(36) NOT NULL COMMENT 'Log record UUID',
  `user_id` char(36) DEFAULT NULL COMMENT 'User associated with operation',
  `conversation_id` char(36) DEFAULT NULL COMMENT 'Related conversation UUID',
  `message_id` char(36) DEFAULT NULL COMMENT 'Related chat message UUID',
  `model_id` char(36) DEFAULT NULL COMMENT 'Model executing the operation',
  `operation` varchar(32) NOT NULL COMMENT 'Operation type: chat, embedding, retrieval, summary, classification',
  `input_tokens` int(10) UNSIGNED DEFAULT NULL COMMENT 'Input token count',
  `output_tokens` int(10) UNSIGNED DEFAULT NULL COMMENT 'Output token count',
  `duration_ms` int(10) UNSIGNED DEFAULT NULL COMMENT 'Total roundtrip duration in milliseconds',
  `retrieval_duration_ms` int(10) UNSIGNED DEFAULT NULL COMMENT 'Vector search and FAISS retrieval duration in milliseconds',
  `inference_duration_ms` int(10) UNSIGNED DEFAULT NULL COMMENT 'llama.cpp model compute duration in milliseconds',
  `memory_usage_mb` decimal(10,2) DEFAULT NULL COMMENT 'Process memory consumption snapshot during execution',
  `success` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = successful completion, 0 = failed',
  `error_type` varchar(100) DEFAULT NULL COMMENT 'Exception class or error category on failure',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Operation log timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI subsystem performance telemetry and execution logs';

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT 'Append-only audit row',
  `actor_user_id` char(36) DEFAULT NULL COMMENT 'Authenticated actor when applicable',
  `event_name` varchar(120) DEFAULT NULL,
  `resource_type` varchar(80) DEFAULT NULL COMMENT 'Affected resource type',
  `resource_id` char(36) DEFAULT NULL COMMENT 'Affected resource UUID',
  `request_id` varchar(64) DEFAULT NULL COMMENT 'Request correlation ID',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Request source',
  `user_agent` varchar(512) DEFAULT NULL COMMENT 'Client context',
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Non-sensitive structured metadata' CHECK (json_valid(`metadata_json`)),
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Event time',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `event_type` varchar(100) NOT NULL DEFAULT '',
  `outcome` varchar(30) NOT NULL DEFAULT '',
  `safe_metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`safe_metadata_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Append-only compliance audit trail for sensitive operations';

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_user_id`, `event_name`, `resource_type`, `resource_id`, `request_id`, `ip_address`, `user_agent`, `metadata_json`, `created_at`, `public_id`, `event_type`, `outcome`, `safe_metadata_json`) VALUES
(1, '5277e730-1376-4890-b830-ea1ad1d4ab9f', '', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 19:41:48.947434', '3f4c33b2-af23-43fc-83e6-b8c0c65f6cc2', 'AUTH_REGISTER', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"role\": \"user\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(2, '5277e730-1376-4890-b830-ea1ad1d4ab9f', '', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:00:15.681565', '421d1a08-fd6b-4c03-a174-2864ea4b4acd', 'AUTH_LOGIN_FAILURE', 'success', '{\"attempted_email\": \"eswarchinthakayala85@gmail.com\", \"reason\": \"invalid_credentials\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(3, '5277e730-1376-4890-b830-ea1ad1d4ab9f', '', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:02:37.458032', '71700a68-570c-40f6-b2ce-43bdeeb5bde4', 'AUTH_LOGIN_FAILURE', 'success', '{\"attempted_email\": \"eswarchinthakayala85@gmail.com\", \"reason\": \"invalid_credentials\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(4, '5277e730-1376-4890-b830-ea1ad1d4ab9f', '', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:08:11.112826', 'ecc32ad4-7c75-41bf-bd09-65cd2c35292a', 'AUTH_LOGIN_FAILURE', 'success', '{\"attempted_email\": \"eswarchinthakayala85@gmail.com\", \"reason\": \"invalid_credentials\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(5, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:13:15.248226', '60805312-aa85-4328-a4bc-898725b57789', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"a34ba675-ade4-4079-a35b-7ce214a5091d\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(6, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:19:07.863966', '5172d1c2-3597-41d7-a34d-cf9bc9c27df3', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"012fc1de-d581-4004-af83-b428277e178e\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(7, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:34:39.593668', '9cb9a6a6-d36d-4630-af99-2a65c51e2b01', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"0b2f8ae1-151b-4b47-8fda-5cf90212042e\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(8, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:34:57.382821', '5d1c46a4-e4f0-40e7-b4c6-79605a987e3e', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"9d3c0040-6fcf-4702-a5f1-107d04a38e49\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(9, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:45:47.793835', 'b5feaac7-f0dc-4a52-be85-34acfc082dbf', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"10158338-1dbd-42fa-a516-8e9bab026fd5\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(10, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:54:32.061883', 'c12cb618-b99c-4a20-a171-5d1f03b91503', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"eeca43c8-a446-4343-9692-58497aeb0daa\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(11, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 20:55:10.804623', '5544ec2d-e013-46a3-89a0-ca1149e4e9a8', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"3ff606cb-8a30-438c-8b93-4cb410727f66\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(12, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-17 21:06:21.507450', '201ba268-3fe2-45ab-a59d-071481e8b8e6', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"4cb00e9a-e32e-4fb9-bd06-c4c1f114ff85\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(13, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 06:36:31.393237', '49063861-c94c-4195-af0f-d7082559e269', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"0a242998-2b84-4dd1-8b4e-f246b3d4d96f\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(14, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 06:51:56.664733', '08c09a1f-8a46-41e0-a45e-e6122df097da', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"7eda0836-dca3-4d4c-ae9b-6db45da798d7\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(15, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 07:40:33.610272', '71cf26ab-095e-4456-a7b0-b749cbf31a34', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"f075118c-74eb-4fce-917f-9c66304fc718\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(16, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 08:03:26.032677', '64f6ef0b-4a8c-406e-b125-718f071ac491', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f075118c-74eb-4fce-917f-9c66304fc718\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(17, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', 'd647ebd0-ed13-419b-82e0-aab108f584a6', NULL, NULL, NULL, '2026-08-18 08:18:23.176366', 'c5d00218-7bad-4107-b623-ecc0642910aa', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 103664}'),
(18, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '9684c0cc-5f1a-4585-85c1-7a6f26f97b2c', 'ba86fb64-9273-4719-aead-dadac1c76aac', NULL, NULL, NULL, '2026-08-18 08:18:23.293933', 'd08a016a-174a-4b03-8cd1-4b62dc9295de', 'REPORT_UPLOADED', 'success', '{\"risk_level\": null}'),
(19, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 08:20:41.729204', '5145308d-c001-4d46-8745-ad3a789265f1', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"cf52b895-d88d-4586-8d90-bfe2bcd6c093\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(20, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', 'f2c899dc-6bf7-4dd7-8d95-4f9da9096e8e', NULL, NULL, NULL, '2026-08-18 08:20:43.415138', '3c15c97f-a210-41e7-9040-427d4e791510', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(21, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', '240e48b7-dc55-4760-9d88-8df4e9b7a711', NULL, NULL, NULL, '2026-08-18 08:20:43.461869', '47e177f0-3a62-48a0-a7a7-d711149c84c0', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(22, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', '622b5aaa-5877-45ca-81d3-9aaefcf44312', NULL, NULL, NULL, '2026-08-18 08:20:56.905988', '5d81eab4-af3a-4260-858b-5bd4f08dd27d', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(23, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', 'dcab3d45-330d-4a70-a452-e64306d31ac5', NULL, NULL, NULL, '2026-08-18 08:20:56.926939', '3a788387-ca42-4c52-ac76-d0791ccd6621', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(24, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', 'dd8da1ca-a697-4212-a8c7-97c017e48970', NULL, NULL, NULL, '2026-08-18 08:21:02.077393', '8f23e0d7-2aef-47b5-943e-54fdea0edd32', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(25, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', 'dd53c41f-44d6-4068-a2f4-c2001c8e62ca', NULL, NULL, NULL, '2026-08-18 08:21:30.185279', 'b2e2eb57-b23e-4cec-90c0-98ff0cb1db26', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(26, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', '90990c9f-6380-4825-ab16-519c35117626', NULL, NULL, NULL, '2026-08-18 08:21:30.210855', 'e03d9bc7-f5fc-4759-b26e-1619119ccce2', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(27, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '015b94d2-e546-4a1a-b134-c83ebe317087', '8b97e15e-4947-4c4f-a00f-a38f05334e62', NULL, NULL, NULL, '2026-08-18 08:22:16.860251', 'd145e7ac-1347-46b9-9939-aecc7f71427a', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(28, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '4adba289-b70d-4fb5-9106-693787e4dad2', NULL, NULL, NULL, '2026-08-18 08:26:15.583232', '8aaccf47-8fd4-4c85-ae9c-8d77b8010b41', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 103664}'),
(29, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', 'c5842fbe-cac1-4064-a6d2-6fe757201f2a', 'f4267caf-ed01-4d49-8c6a-a2e08ef99207', NULL, NULL, NULL, '2026-08-18 08:26:15.621238', '89ad55a3-3ccd-4514-9771-89d66aae621c', 'REPORT_UPLOADED', 'success', '{\"risk_level\": null}'),
(30, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '33598874-935e-45b9-8ddd-9ecd53d330c1', NULL, NULL, NULL, '2026-08-18 08:26:21.427843', '7cb68774-ebc7-4936-8cf4-3765e2f07236', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(31, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', 'bbaee8b6-3e35-4e9c-9ecb-4767a1ca34ec', NULL, NULL, NULL, '2026-08-18 08:26:21.447422', 'fb8b53bf-b3df-493a-af21-46ba2bb4c6df', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(32, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '50285a7b-f0af-4c1d-a828-0092aaf5598a', NULL, NULL, NULL, '2026-08-18 08:28:04.196348', 'fd11d01f-0cc4-4677-aa1a-6c91614814ea', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(33, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', 'd64fcad7-af52-4fda-a063-0bedb70f7ba4', NULL, NULL, NULL, '2026-08-18 08:28:04.235446', '5d99d4ce-0488-434d-afa4-08b8830728c7', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(34, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '7231cae3-9f91-425c-94e3-70fef01430b5', NULL, NULL, NULL, '2026-08-18 08:30:29.702987', 'af0a075b-2c26-484e-8014-4075ca9ce9fd', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(35, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '4ee29ba9-bbe2-4a3d-9c34-1f0bf99bad8d', NULL, NULL, NULL, '2026-08-18 08:30:29.734952', '7e873209-b9fb-4074-a45e-640317eb80fb', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(36, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', 'c86e3191-a8eb-4a23-b4bd-f85bb5c57baa', NULL, NULL, NULL, '2026-08-18 08:30:53.391072', '7ace02c3-a965-4032-b3b4-64cbf04a496e', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(37, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', 'ae5d604d-2257-4ad9-95ac-b7625572087b', NULL, NULL, NULL, '2026-08-18 08:30:53.419236', 'bf41e223-5e73-48d0-85cc-a634d48badcb', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(38, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', 'cf743d99-9e3c-4460-805c-ac78443c0169', NULL, NULL, NULL, '2026-08-18 08:31:08.656142', 'd53031c9-fcac-4fed-a17f-b5d747aa0986', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(39, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '982ca947-e50f-499f-8272-30fd699d819a', NULL, NULL, NULL, '2026-08-18 08:31:32.144930', 'a53daaad-12af-4927-9164-fb0fbdb633f8', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(40, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '0c4c2617-4e98-4ea4-8216-b7dc4958c879', NULL, NULL, NULL, '2026-08-18 08:31:32.168692', '6ced36e6-dbad-4bab-8ccc-19e182055357', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(41, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 08:37:24.944647', '262104fa-45ae-4582-a28b-2ee676c48033', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"e505a3b8-f258-4af4-8424-250b93d9be57\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(42, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', 'e60b9cd6-b60c-4752-b010-9a80687b02cd', NULL, NULL, NULL, '2026-08-18 08:40:54.965798', 'f102704e-c8b0-44e9-9a40-af1293b20df2', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"application/pdf\", \"size_bytes\": 94512}'),
(43, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '13883d8f-48ab-4e0a-9cec-e3738a92116f', '4e3098d1-bca0-4748-9258-56001184a688', NULL, NULL, NULL, '2026-08-18 08:40:55.060276', 'da7686f5-d8e9-4dd1-b0a0-8f988e3bef61', 'REPORT_UPLOADED', 'success', '{\"risk_level\": null}'),
(44, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', '2c6ce3c8-bd76-4f99-a649-d196efb23880', NULL, NULL, NULL, '2026-08-18 08:40:59.498517', '50fe5128-4d2a-484b-bcaa-078af14a16e0', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(45, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', 'cb8539af-f1d7-496f-aa60-65d3fdbe5219', NULL, NULL, NULL, '2026-08-18 08:40:59.593599', 'dfe5596c-93cd-424e-becc-b55b7fc0ea21', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(46, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', 'f1cff11d-d4af-4e65-a451-de885e2a651b', NULL, NULL, NULL, '2026-08-18 08:46:42.142834', 'ad0be879-574a-47ae-96c8-28ff2552e27b', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(47, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', '8d7429d3-b82d-4121-a8c6-ae7efa851caf', NULL, NULL, NULL, '2026-08-18 08:48:35.251734', 'ce836e19-b862-4fa9-8bac-b5328ae2463b', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 94777}'),
(48, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '079fb8c0-9a95-4e08-a108-98106be71295', '5817eb46-82d9-4ed5-b95f-e1dfd6b600f9', NULL, NULL, NULL, '2026-08-18 08:48:38.724844', 'e63456a5-de1e-4b66-88c4-815b9860f6b8', 'REPORT_UPLOADED', 'success', '{\"risk_level\": null}'),
(49, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', 'fb4004f2-bf2f-499e-933b-24393948d4c0', NULL, NULL, NULL, '2026-08-18 08:48:46.486073', 'e5a5798f-8e6d-417b-8790-157e8f818bcc', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(50, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', '5bca6f04-06e1-4708-8689-9a7437b33f7c', NULL, NULL, NULL, '2026-08-18 08:48:46.564769', 'e577a231-cdad-4eef-b378-0990af334edc', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(51, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 08:53:33.345561', '45598ec6-672c-4a10-a074-a1b6c171216f', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"4cfb6b18-dc95-4677-8d98-c4e98c1dad01\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(52, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', '676e559a-eff0-4897-8705-dae159b8eec5', NULL, NULL, NULL, '2026-08-18 08:53:57.667778', '7ed48080-01b1-4eb6-82da-d9181d66b2af', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(53, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', '86e4be94-0d4b-47c7-a4c7-df4c996b3083', NULL, NULL, NULL, '2026-08-18 08:53:57.696769', 'b1433d85-438c-4150-b681-2e05c0f2061f', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(54, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', '96e99663-910f-474a-b987-b27df015ef5f', NULL, NULL, NULL, '2026-08-18 08:54:13.096478', '67a1a9fd-a740-497b-b3ed-d12232ff6ec9', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(55, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '4452cac3-7bfc-4825-aa74-97be016702a2', '78081df8-7bcb-46f3-9a80-5831e497ec57', NULL, NULL, NULL, '2026-08-18 08:54:13.132216', '85d88be2-b9f4-43af-a6ff-06e12e12e5d9', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(56, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', '800f5b83-125d-4f98-9c10-fb60bcd21587', NULL, NULL, NULL, '2026-08-18 08:54:17.882945', 'f644cab6-d9c7-49a2-b391-fd4c0b512e0c', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(57, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', 'a9ff173a-4307-46b1-8111-0deebcf34ca1', NULL, NULL, NULL, '2026-08-18 08:54:17.906509', 'f7ca6ee2-8974-4be6-b159-609161a41f76', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(58, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '7f334968-a42c-4474-84ab-3e366ba1c1c0', NULL, NULL, NULL, '2026-08-18 08:54:33.740922', '25e02880-f02c-46df-8f0a-bec34f1a05c3', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(59, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '01971bfa-9467-46f9-a4c6-2bd1d43c9361', NULL, NULL, NULL, '2026-08-18 08:54:33.772933', 'b5acbbe8-707b-401d-93e4-c9de3fda8aa7', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(60, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 09:17:06.795416', 'f8e10570-3f4d-437e-a445-387cad7731fa', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"01ec3b23-26d8-4ea5-bc4e-5febd8f4dd14\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(61, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'd53588ae-c964-4aa8-8c4e-55cf8e4a5b81', '42bd4a84-819a-4b5e-a2fe-288a885574b7', NULL, NULL, NULL, '2026-08-18 09:17:21.425473', '58f5da17-e2aa-43d5-a2ff-6c3988816482', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"application/pdf\", \"size_bytes\": 94512}'),
(62, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', '71e0ca0f-a2bf-4fab-ac16-1b44fc0ac4eb', NULL, NULL, NULL, '2026-08-18 09:25:43.647558', 'fb23b8db-828f-4f55-8e45-4b0a2baccaf1', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(63, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '1838b38e-db8b-4578-9644-501f1be54a24', '2bd3e5d6-2082-4140-a911-4b5112292a04', NULL, NULL, NULL, '2026-08-18 09:25:43.736752', '3c0c9980-0518-4994-ad0c-569693cb1379', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(64, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '87bb30fb-de45-40da-b9fc-1ef71b2f0295', 'aeedce90-18be-4b41-9307-3c84ab37e824', NULL, NULL, NULL, '2026-08-18 09:25:58.053564', '216e3bd8-06ce-4086-9168-0768dfb22eca', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 94777}'),
(65, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '079fb8c0-9a95-4e08-a108-98106be71295', '12e28125-96db-465e-81f1-b4861756acd7', NULL, NULL, NULL, '2026-08-18 09:26:01.483562', '97767f36-ff7f-468d-9c41-32fa06c8cb23', 'REPORT_UPDATE', 'success', '{\"file_name\": \"OGTT_Lab_Report.png\", \"action_type\": \"report_reprocessed\"}'),
(66, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '87bb30fb-de45-40da-b9fc-1ef71b2f0295', '80a351db-390c-4274-a170-8bc4b5f35dea', NULL, NULL, NULL, '2026-08-18 09:26:26.242852', 'db5189f0-5c18-4db4-b344-0fe709fde771', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(67, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '87bb30fb-de45-40da-b9fc-1ef71b2f0295', '7e4c2155-6d07-4aef-9de4-37cb45fb0ae7', NULL, NULL, NULL, '2026-08-18 09:26:26.272486', '4645fd88-0280-4339-ba35-d2f746c62201', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(68, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '87bb30fb-de45-40da-b9fc-1ef71b2f0295', '33805348-566a-482f-b56a-948fce7102ed', NULL, NULL, NULL, '2026-08-18 09:26:37.287307', '707bda8c-326d-422c-a2e8-5967104a9daf', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(69, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '87bb30fb-de45-40da-b9fc-1ef71b2f0295', '5206a907-d565-4dff-96d8-6ad83d863d5a', NULL, NULL, NULL, '2026-08-18 09:26:37.319446', '41c1bb0c-18e0-4772-aec7-0b8ded2837dc', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(70, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', '5148fcd9-c390-41dc-8516-8a4d55791e1c', NULL, NULL, NULL, '2026-08-18 09:26:48.086832', 'a456013f-edbf-4db1-98c1-6e1f0884c065', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"application/pdf\", \"size_bytes\": 94512}'),
(71, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', 'f5664f9f-51de-4881-b373-3ea4f0613654', 'f4b25f45-4dac-4d76-ab23-c76de33ec65b', NULL, NULL, NULL, '2026-08-18 09:26:48.149527', 'eb9eecda-f957-418f-a2e8-0e7af3e56ae1', 'REPORT_CREATE', 'success', '{\"file_name\": \"OGTT_Lab_Report (1).pdf\"}'),
(72, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', 'eed79610-fcd7-40fa-857c-c16d1d3896ad', NULL, NULL, NULL, '2026-08-18 09:26:54.629635', 'b3af6e59-a798-4a3d-bc66-674493b4ed7f', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(73, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', '18de4336-03ed-43ef-9cf0-12a52e626808', NULL, NULL, NULL, '2026-08-18 09:26:54.658359', 'cddf2b67-ec79-4233-a7fc-5c4de8787ba6', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(74, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '5884574d-4e30-40ef-9714-4becf674a70b', '8e1dbb03-e92c-497d-a4d1-a905f299e854', NULL, NULL, NULL, '2026-08-18 09:27:46.096237', '29599ffc-2ac4-482a-81f5-f0f8086df910', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 94777}'),
(75, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '079fb8c0-9a95-4e08-a108-98106be71295', '6f2045db-1907-45de-82b2-50a706d840e7', NULL, NULL, NULL, '2026-08-18 09:27:48.712281', 'f8154dc2-9026-4d9b-9294-4e17f88d0a79', 'REPORT_UPDATE', 'success', '{\"file_name\": \"OGTT_Lab_Report.png\", \"action_type\": \"report_reprocessed\"}'),
(76, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 09:32:59.596700', '085ff4fa-9e22-4734-b753-78738953dbc7', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"fafa9203-7dc2-4aad-8814-00836ca8f7ba\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(77, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', '83edebb9-b8bc-494a-b6cb-e644b4a90e82', NULL, NULL, NULL, '2026-08-18 09:33:01.704917', '339a74be-865e-420c-8aec-5639ee442812', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(78, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', 'badffe76-1f64-4c73-b332-3cfea1207676', NULL, NULL, NULL, '2026-08-18 09:33:01.748375', 'a9e398bb-eb4d-46bc-b87b-5aecca4f9da4', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(79, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '77cb09f9-9717-4099-a91f-c843dd7fc57a', '6ec0b978-f987-492d-bd7e-291500ee2847', NULL, NULL, NULL, '2026-08-18 09:33:21.262032', '7f0ede57-a699-4c05-a27a-480dfd702ab9', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 94777}'),
(80, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '92732d62-aad0-4ded-a895-5f7ea54c8784', '623ca2b4-253c-4c8f-9229-13317ba3be17', NULL, NULL, NULL, '2026-08-18 09:33:23.635527', '40eb57a8-5d05-4c3d-98f6-dd98713a94e9', 'REPORT_CREATE', 'success', '{\"file_name\": \"OGTT_Lab_Report.png\"}'),
(81, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '77cb09f9-9717-4099-a91f-c843dd7fc57a', '306b384b-236a-41b6-94d4-2766be849dc7', NULL, NULL, NULL, '2026-08-18 09:33:26.603698', '85b8d954-34f5-4d3f-9e1e-3a3733242367', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(82, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '77cb09f9-9717-4099-a91f-c843dd7fc57a', '550a1206-9c33-427e-8b84-1a166a89de04', NULL, NULL, NULL, '2026-08-18 09:33:26.627843', 'c2251ab1-fe63-4c8a-b82b-1b9eedb57a8a', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(83, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'e2f9d3e7-f597-4b0b-91b7-dfffa76b31fb', '44127435-6bfa-447d-be90-08f829b9026c', NULL, NULL, NULL, '2026-08-18 09:41:17.689389', 'c50d467a-af30-4ea9-8760-7360c1d1d3dc', 'PRIVATE_FILE_UPLOADED', 'success', '{\"mime_type\": \"image/png\", \"size_bytes\": 94777}'),
(84, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'medical_report', '4e140ab8-65f1-47b2-bbd8-9d772ada3ed8', '5ce30437-562d-4286-8370-dd1cc3a9e216', NULL, NULL, NULL, '2026-08-18 09:42:19.531575', '69b63474-1abf-4ca2-a1d6-08fa1ea1333b', 'REPORT_CREATE', 'success', '{\"file_name\": \"OGTT_Lab_Report.png\"}'),
(85, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 09:55:57.784978', '85e36456-0b35-4b0f-ba16-022132d4fbf6', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"bb98e4ca-fc22-4cab-9186-18480085d312\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(86, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 10:11:20.370418', 'cb94da63-9cf4-499d-a22f-64d59b76d9f9', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"e88c62df-c8e5-4444-b33b-893ca6529fd9\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(87, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 10:35:11.462201', 'a4eccc43-021c-44cb-8a26-6ab2e1808af8', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"e88c62df-c8e5-4444-b33b-893ca6529fd9\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(88, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 10:36:19.695448', 'bfa536ee-1600-439e-b3e2-90e2f9a742e6', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"502a6246-2a80-4c97-a7dd-275c4432f7f2\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(89, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 10:52:07.095939', '38d6f732-fc26-4a3d-89f0-0a9c337219e1', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"502a6246-2a80-4c97-a7dd-275c4432f7f2\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(90, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 10:52:21.872994', '8848506a-aeb9-487d-8b1e-6853fa6616a2', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"aea2a11c-9d06-4447-8e80-a2b57b7b85c2\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(91, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'e2f9d3e7-f597-4b0b-91b7-dfffa76b31fb', 'bff9dc51-c259-4593-9f31-e373e0a94c86', NULL, NULL, NULL, '2026-08-18 10:53:30.469930', '4778d79f-dd53-4206-a280-22284f5db310', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(92, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'e2f9d3e7-f597-4b0b-91b7-dfffa76b31fb', '0327fef2-2fb4-4139-a1de-30021cc3c4ef', NULL, NULL, NULL, '2026-08-18 10:53:30.505275', '2b5129d7-460f-4a7e-8d5f-237813687fa4', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(93, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '77cb09f9-9717-4099-a91f-c843dd7fc57a', '7caa2a9d-6586-4336-9a71-bcfb58222313', NULL, NULL, NULL, '2026-08-18 10:53:46.420209', '2037a12f-50fd-4f93-bc28-3bb524d61560', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(94, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '77cb09f9-9717-4099-a91f-c843dd7fc57a', 'eb23baf4-76b0-4dd8-8113-8562ddfe7995', NULL, NULL, NULL, '2026-08-18 10:53:46.459418', '4601eba7-b7e3-4990-b7bd-3c460977faa3', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(95, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', 'ffe42a66-dac6-4d67-bb12-e4be16e68b10', NULL, NULL, NULL, '2026-08-18 10:53:53.848967', '8a548ccd-9120-4a76-8ce7-2e9f88f3a9e9', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(96, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', 'cb03eca8-1421-49f4-8736-856647f004a5', 'b3c3c959-ffba-4d28-9247-132496cfd44f', NULL, NULL, NULL, '2026-08-18 10:53:53.905678', '26194430-458a-4ffa-9ecb-43f5428ba203', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(97, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '5884574d-4e30-40ef-9714-4becf674a70b', 'dd13d4ac-de0a-4e9b-83fd-891d9169bcc5', NULL, NULL, NULL, '2026-08-18 10:54:04.027610', 'e9cd152a-e293-4a34-b764-d37d1fe2de07', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(98, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '5884574d-4e30-40ef-9714-4becf674a70b', 'eb4affa5-37b4-42cd-92d1-c631741cdb6a', NULL, NULL, NULL, '2026-08-18 10:54:04.092303', '6f6f490b-4519-4312-be8b-ff3cca09bd43', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(99, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '47917fe7-2372-48a7-88be-ff7dcb7182d7', NULL, NULL, NULL, '2026-08-18 10:54:13.242012', '77a0e87a-5b76-4cba-ba47-84360abc2de5', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(100, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'file_asset', '79b281ea-27d6-49fa-bc3b-13de693fc734', '8f4d9a53-e3e1-4184-94cb-24e7cb90966f', NULL, NULL, NULL, '2026-08-18 10:54:13.315104', '7cef3ffc-46a8-4cf1-9f20-15858e662005', 'PRIVATE_FILE_DOWNLOADED', 'success', 'null'),
(101, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 13:12:24.668186', 'b49d48ce-9762-4418-ae2c-9e24d5903664', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"aea2a11c-9d06-4447-8e80-a2b57b7b85c2\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(102, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:02:04.009410', '14ad0eed-c493-414f-823b-b92719958005', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"e25b6cac-a068-4edc-854c-221e3bb16c34\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(103, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:22:03.331703', '18714c6c-2bce-4054-b9d8-535d2a82fb4b', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"9240af89-f00d-42e6-ab40-739e99496e88\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(104, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:37:35.550736', '16d4b84e-cb14-48c9-b396-1714bc5cca35', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"60ef13c3-c615-4012-a514-71315a125b26\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(105, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 14:55:54.012048', '40f9cb15-2a6f-4198-85d7-bc493370bc89', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"463d1d58-fc4d-4ce0-8094-8014f5f389d5\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(106, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 15:44:22.822649', '8b369e08-88d4-4f87-892c-990b37fdf233', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"2e491982-1bc4-4d84-8331-176c053cd044\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(107, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 16:22:59.223034', 'a4974551-fe09-4f54-8a41-6ce2afafc52a', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"8a4ac6fc-950f-4344-85e6-381ab4cff4de\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1\"}'),
(108, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 16:51:17.598875', 'e083fc8d-79e7-4fc6-860e-066ed7d084d7', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"8a4ac6fc-950f-4344-85e6-381ab4cff4de\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(109, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 17:35:51.593540', '30c1c84c-6869-4a35-95de-737776a2873a', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"2f1cff6b-13d7-4ca8-819b-6c10430a2b83\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(110, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 17:38:55.936137', '201001da-1431-4f92-b2e1-9a8c09dea5ca', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"15ecdaff-4ca5-4e7a-9493-c2a11f9db74a\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1\"}'),
(111, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 17:40:23.241822', '4f7b38b8-17d5-4727-978f-c030105df077', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"9def2dae-0347-4381-964c-8612b5f586b2\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(112, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:13:57.425125', 'ac92d246-ee19-46d1-99f8-56b22ec42946', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"5440303a-4bb3-466f-b4ea-365a4a3580de\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(113, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:14:57.551407', 'b08ffa76-6bbe-4e76-9d1f-d8c84af7e243', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"1edfdae7-6a62-4002-b2ba-c62b63e146cd\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(114, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:15:00.546285', '5c5dd13d-38c5-4901-806c-de7b8cc8837f', 'AUTH_LOGOUT', 'success', '{\"session_public_id\": \"32f0c5bb-aba2-4343-8e6b-e5fadd6c2dd5\"}'),
(115, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:15:04.502942', 'ae40deff-9a8a-40e0-ac77-4b97ca68fbf3', 'AUTH_LOGIN_FAILURE', 'success', '{\"attempted_email\": \"eswarchinthakayala85@gmail.com\", \"reason\": \"invalid_credentials\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(116, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:15:19.882836', 'bed0451d-f4fe-47ae-b3e8-7e174b0cc227', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"b2e5bbc9-7424-41b4-8ef6-1fbd0128e155\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(117, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:15:41.012821', '01ebd1b4-0d98-4f33-93f3-246e986d883e', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(118, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:15:58.215485', 'f90f23db-fbe8-4669-9e71-89364bc2724e', 'AUTH_LOGOUT', 'success', '{\"session_public_id\": \"1b437778-5e74-4d38-9e96-b85c8e75c5df\"}'),
(119, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:16:46.051289', 'edcee1b2-ac9b-4682-b078-90a1d67bc659', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(120, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:24:34.852913', 'b9956297-56a6-4016-a21c-6f153949763c', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(121, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:31:03.654233', '0091bde7-873b-4e57-8c3c-33b750deee63', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(122, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:33:37.655252', 'b2927854-04b7-475b-8908-144ebfcb03d9', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(123, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:43:33.671748', '9f3c3498-19a8-4280-b1f2-27b7b7e9f108', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(124, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:46:18.862596', '018b492a-11dc-4666-afc0-8ee24f525bf1', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(125, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:55:56.661049', 'f50db0ae-8917-49dd-b4ec-47038be18883', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(126, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:58:07.649513', '76cad3db-40f8-4927-8845-1b59c5a43d0c', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(127, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:01:00.970417', '59b42aad-46d9-4b4f-85e2-6c0b93029d19', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(128, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:21:26.662558', 'f2fd62c5-fd2a-4deb-8360-cbf6d615f171', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(129, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:54:36.515470', '2acb6849-1b58-4f48-95b0-3e155b4718a0', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(130, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:55:35.906014', 'c199f2de-73e8-41d8-9e72-17f8d73f28ae', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"265ac42a-74d1-40f9-b457-e6989a83e729\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(131, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:55:56.669502', 'cde7abfe-3eb2-40b4-b051-a85e39c34f7c', 'AUTH_LOGOUT', 'success', '{\"session_public_id\": \"51a5768c-cf3f-4c10-8b6a-d8caa8aa8961\"}'),
(132, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:56:00.513931', '1e5f7a2f-805c-4f3a-9b89-072af22404e4', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"f7739e5d-6c14-4609-9dc9-d31b2370ed4c\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(133, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 08:58:50.876315', 'a866b77c-ba24-434c-b78a-7427de8ef4ed', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f7739e5d-6c14-4609-9dc9-d31b2370ed4c\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(134, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:18:43.354962', '821f8d02-96e8-41b3-82a2-94399d5d6a15', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f7739e5d-6c14-4609-9dc9-d31b2370ed4c\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(135, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:20:18.587973', '0404e81c-3f17-4fc7-a49b-15d9d943ebb3', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f7739e5d-6c14-4609-9dc9-d31b2370ed4c\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(136, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:23:05.394813', '38b0c3c7-ee77-4ee9-874d-b6d6fe0063b8', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"8182e41b-5116-47b0-bb26-59e8263dd72d\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(137, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:27:33.695421', '1c6e83b2-cb08-4b9f-b9cc-fdff54e7b1d7', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f7739e5d-6c14-4609-9dc9-d31b2370ed4c\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(138, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:27:58.579022', 'f186a8f0-ff4e-4668-8320-f0728f0df764', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"bcad30cb-698d-41c0-9fed-8846fcc05224\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(139, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:43:45.210239', '2d2a2682-b2ac-4af2-8e59-6a37f6b9089f', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f7739e5d-6c14-4609-9dc9-d31b2370ed4c\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(140, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:43:45.294196', '60911099-6593-4a76-b601-e608e7b7e0fc', 'RISK_ASSESSMENT_CREATED', 'success', '{\"assessment_public_id\": \"5ffd2974-383a-4f7d-b54d-21931dbf85fb\", \"model_key\": \"diabetes-risk\", \"model_version\": \"1.0.0\", \"risk_band\": \"low\", \"source\": \"manual\", \"contains_imputed_values\": false, \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}'),
(141, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 09:44:12.956972', 'ca9a030c-1323-4af6-8822-9c1eb88d0af0', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}');
INSERT INTO `audit_logs` (`id`, `actor_user_id`, `event_name`, `resource_type`, `resource_id`, `request_id`, `ip_address`, `user_agent`, `metadata_json`, `created_at`, `public_id`, `event_type`, `outcome`, `safe_metadata_json`) VALUES
(142, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:53:25.898294', '75a4da51-2de6-4836-bb0b-8758ecc8416c', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(143, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:53:44.553029', '52c27c9e-4359-4cb4-83b9-6614ab0d7496', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"5d48e5a6-c7c4-4b81-8cbb-1431477d9459\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"okhttp/5.1.0\"}'),
(144, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:03:51.830735', '567ef8cc-5987-488a-92d9-5c1871b041cb', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"5d48e5a6-c7c4-4b81-8cbb-1431477d9459\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"okhttp/5.1.0\"}'),
(145, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:08:06.985350', 'eb943f60-4b48-4edc-a2eb-5216f3c67a52', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"5d48e5a6-c7c4-4b81-8cbb-1431477d9459\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"okhttp/5.1.0\"}'),
(146, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:11:59.041835', 'f146b867-be99-46c9-9de2-0e015c7b5391', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"5d48e5a6-c7c4-4b81-8cbb-1431477d9459\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"okhttp/5.1.0\"}'),
(147, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:30:41.928825', '16869015-58e6-4338-9163-61231aa0f75b', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(148, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 13:18:03.857908', 'df49e3aa-11d6-4365-8c5e-66e7690ecdd9', 'AUTH_REFRESH', 'success', '{\"token_family_id\": \"f49757d6-23fa-413a-88d1-39f779f2c4da\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(149, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 13:18:21.832101', 'bbc5c5ce-4975-41dd-b3ab-afccdbf9737f', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"a65b3659-b068-424c-b9e6-5694c2d1f5a7\", \"ip_hash\": \"12ca17b49af22894\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\"}'),
(150, '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:00:36.719272', '7c621f82-9401-4d66-8ccd-bb006aece18f', 'AUTH_LOGIN_SUCCESS', 'success', '{\"email\": \"eswarchinthakayala85@gmail.com\", \"family_id\": \"1ee57ca7-edec-4940-a678-4f1b2b89f503\", \"ip_hash\": \"e3909c33b5581f03\", \"user_agent\": \"okhttp/5.1.0\"}');

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

DROP TABLE IF EXISTS `auth_tokens`;
CREATE TABLE `auth_tokens` (
  `id` char(36) NOT NULL COMMENT 'Token record UUID',
  `user_id` char(36) NOT NULL COMMENT 'Token owner',
  `token_type` varchar(32) NOT NULL COMMENT 'email_verification or password_reset',
  `token_hash` char(64) NOT NULL COMMENT 'Hash of one-time token',
  `expires_at` datetime(6) NOT NULL COMMENT 'Expiry',
  `consumed_at` datetime(6) DEFAULT NULL COMMENT 'One-time use marker',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Created time',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `revoked_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Secure single-use verification and password reset tokens';

-- --------------------------------------------------------

--
-- Table structure for table `background_jobs`
--

DROP TABLE IF EXISTS `background_jobs`;
CREATE TABLE `background_jobs` (
  `id` char(36) NOT NULL COMMENT 'Application job UUID',
  `celery_task_id` varchar(64) DEFAULT NULL COMMENT 'Celery task id when queued',
  `user_id` char(36) DEFAULT NULL COMMENT 'Owner if user-scoped',
  `task_name` varchar(160) DEFAULT NULL,
  `queue_name` varchar(64) DEFAULT NULL,
  `state` varchar(24) DEFAULT NULL,
  `entity_type` varchar(64) DEFAULT NULL COMMENT 'Related domain type',
  `entity_id` char(36) DEFAULT NULL COMMENT 'Related domain UUID',
  `progress_percent` tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-100 UI progress',
  `attempt_count` smallint(6) DEFAULT NULL,
  `error_code` varchar(64) DEFAULT NULL COMMENT 'Sanitized error code',
  `error_message` varchar(500) DEFAULT NULL COMMENT 'Sanitized failure summary',
  `queued_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Queued time',
  `started_at` datetime(6) DEFAULT NULL COMMENT 'Start time',
  `finished_at` datetime(6) DEFAULT NULL COMMENT 'Terminal time',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `job_type` varchar(50) NOT NULL DEFAULT '',
  `status` varchar(30) NOT NULL DEFAULT '',
  `progress_message` varchar(255) DEFAULT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL,
  `failed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asynchronous Celery background task execution log and state tracking';

-- --------------------------------------------------------

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
CREATE TABLE `chat_conversations` (
  `id` char(36) NOT NULL COMMENT 'Conversation UUID',
  `user_id` char(36) NOT NULL COMMENT 'Owner user ID',
  `llm_model_id` char(36) DEFAULT NULL COMMENT 'LLM model assigned to conversation',
  `title` varchar(255) DEFAULT NULL COMMENT 'Auto-generated or user-assigned conversation title',
  `conversation_type` varchar(32) DEFAULT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active' COMMENT 'Lifecycle state: active, archived, deleted',
  `message_count` int(11) DEFAULT NULL,
  `last_message_at` datetime(6) DEFAULT NULL COMMENT 'Timestamp of most recent message',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Conversation start timestamp',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Last activity timestamp',
  `model_version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chat sessions between patients and AI assistant';

--
-- Dumping data for table `chat_conversations`
--

INSERT INTO `chat_conversations` (`id`, `user_id`, `llm_model_id`, `title`, `conversation_type`, `status`, `message_count`, `last_message_at`, `created_at`, `updated_at`, `model_version`) VALUES
('0ef38a01-b552-458f-ba41-aa8324302e65', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'Maternal Health Consultation', NULL, 'active', NULL, NULL, '2026-08-27 07:25:14.755671', '2026-08-27 07:25:14.755680', NULL),
('23a4ffb8-46b5-4f4f-9398-deb60d97a604', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'Maternal Health Consultation', NULL, 'active', NULL, NULL, '2026-08-27 07:46:59.517229', '2026-08-27 07:46:59.517232', NULL),
('86994d2e-3321-43a2-a883-d0f178a3ef53', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'Maternal Health Consultation', NULL, 'active', NULL, NULL, '2026-08-27 11:09:18.009728', '2026-08-27 11:09:18.009732', NULL),
('b291ee9d-8b79-4982-bcb4-2427aec22362', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'Maternal Health Consultation', NULL, 'active', NULL, NULL, '2026-08-27 15:01:42.482293', '2026-08-27 15:01:42.482296', NULL),
('eaf4160f-478c-4d82-a414-e58c0c0594ef', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'Maternal Health Consultation', NULL, 'active', NULL, NULL, '2026-08-27 10:54:10.375214', '2026-08-27 10:54:10.375219', NULL),
('f1589530-64f3-4166-880b-6b774372f5e6', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'Maternal Health Guidance', NULL, 'active', NULL, NULL, '2026-08-18 15:49:09.730251', '2026-08-18 15:49:09.730258', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_feedbacks`
--

DROP TABLE IF EXISTS `chat_feedbacks`;
CREATE TABLE `chat_feedbacks` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` char(36) NOT NULL COMMENT 'Chat message UUID',
  `conversation_id` char(36) NOT NULL COMMENT 'Parent conversation UUID',
  `parent_message_id` char(36) DEFAULT NULL COMMENT 'Preceding message UUID in dialogue tree',
  `role` varchar(24) NOT NULL COMMENT 'Message originator: system, user, assistant',
  `content` longtext NOT NULL COMMENT 'Full message content text',
  `model_id` char(36) DEFAULT NULL COMMENT 'Model used to generate this response (NULL for user messages)',
  `message_status` varchar(24) DEFAULT NULL,
  `prompt_tokens` int(10) UNSIGNED DEFAULT NULL COMMENT 'Input tokens evaluated for this turn',
  `completion_tokens` int(10) UNSIGNED DEFAULT NULL COMMENT 'Output tokens generated by model',
  `total_tokens` int(10) UNSIGNED DEFAULT NULL COMMENT 'Total tokens processed in turn',
  `generation_time_ms` int(10) UNSIGNED DEFAULT NULL COMMENT 'Inference generation latency in milliseconds',
  `temperature` decimal(4,3) DEFAULT NULL COMMENT 'Sampling temperature applied during generation',
  `stop_reason` varchar(100) DEFAULT NULL COMMENT 'Generation termination reason: stop_token, length, safety_filter',
  `safety_flag` tinyint(4) DEFAULT NULL,
  `safety_category` varchar(100) DEFAULT NULL COMMENT 'Safety category if flagged: medical_advice_disclaimer, urgent_symptom, inappropriate',
  `error_code` varchar(100) DEFAULT NULL COMMENT 'Error code if generation failed',
  `error_message` text DEFAULT NULL COMMENT 'Sanitized error description on failure',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Message creation timestamp',
  `tokens_used` int(11) DEFAULT NULL,
  `latency_ms` float DEFAULT NULL,
  `sources` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sources`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Granular conversation turn records and generation telemetry';

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `conversation_id`, `parent_message_id`, `role`, `content`, `model_id`, `message_status`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `generation_time_ms`, `temperature`, `stop_reason`, `safety_flag`, `safety_category`, `error_code`, `error_message`, `created_at`, `tokens_used`, `latency_ms`, `sources`) VALUES
('1793a9e4-3669-4e4c-bf81-d3eeea3e8f8e', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'how are you', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:59:12.766937', 0, 0, NULL),
('1b183c94-33e3-4023-a4c5-7abc21c262d3', '0ef38a01-b552-458f-ba41-aa8324302e65', NULL, 'assistant', 'Hu\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:25:33.296662', 1, 6978.51, '[\"ADA_GDM_2024\", \"ADA_GDM_2024\"]'),
('1bb78a8b-f629-4ea7-99cc-4bc6e35546ce', '86994d2e-3321-43a2-a883-d0f178a3ef53', NULL, 'user', 'What is the difference between Fasting Blood Sugar and HbA1c?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:09:18.151614', 0, 0, NULL),
('2f14d4ef-048e-4b2c-96ca-d7de456df6e3', 'b291ee9d-8b79-4982-bcb4-2427aec22362', NULL, 'assistant', 'Understanding your gestational diabetes risk estimate is important for managing the condition. Here’s a step-by-step guide to help you understand it:\n\n1. **Fasting Glucose Target**: The Fasting Glucose target in 2026-11-27 was set at 70–95 mg/dL (3.9–5.3 mmol/L). This is your baseline level for gestational diabetes.\n\n2. **Postprandial Targets**: For the post-prandial targets, Fasting Glucose should be maintained between 92-180 mg/dL (4.9–7.6 mmol/L) and 1-hour Postprandial glucose below 140 mg/dL (< 7.8 mmol/L), and 2-hour Postprandial glucose below 153 mg/dL (< 6.7 mmol/L).\n\n3. **Insulin Levels**: Insulin levels should be monitored closely, as they can vary widely during pregnancy.\n\nTo understand your risk level:\n- If the Fasting Glucose is above 95 mg/dL (4.9 mmol/L), you have a high-risk status.\n- If it’s between 70–89 mg/dL (3.9–6.2 mmol/L) and below 140 mg/dL (< 7.8 mmol/L), your risk is moderate.\n\nTo predict whether you will develop gestational diabetes:\n- The prediction classification for non-diabetic status is Non-Diabetic.\n- If the Fasting Glucose is between 95–120 mg/dL (4.9–6.3 mmol/L) and below 180 mg/dL (< 7.8 mmol/L), your risk of developing gestational diabetes is high.\n\nTo assess your BMI:\n- Your Body Mass Index (BMI) should be between 25 to 29.9 kg/m², which falls within the range for a non-diabetic status.\n\nRemember that these are general guidelines and may vary based on individual factors such as family history of gestational diabetes or other health conditions. Always consult with your healthcare provider for personalized advice.\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:02:01.784933', 456, 18077.1, '[\"ADA_GDM_2024\", \"ADA_GDM_2024\"]'),
('33d52c00-f753-4ece-bbce-167cf8f7d1c9', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'I\'m sorry, but I can\'t assist with that.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:57.565316', 0, 0, NULL),
('3825eb47-e1e8-452b-8da9-417f9a393b9e', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'who is our prime minister', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:28.567831', 0, 0, NULL),
('401c78f6-7943-4a31-bfe6-4f0f231cd7d3', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'I\'m doing well, thank you for asking. How can I assist you today?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:59:14.851332', 0, 0, NULL),
('4ba56e09-632e-4ae2-9e7f-deab5c79909c', 'f1589530-64f3-4166-880b-6b774372f5e6', NULL, 'assistant', 'Understanding your gestational diabetes risk estimate is important for making informed decisions about your health and the care of your baby. Here are some steps to help you understand it:\n\n1. **Know Your Risk Level**: The low-risk level indicates a 20.6% probability that you will develop gestational diabetes during pregnancy.\n\n2. **Assess Biomarkers**: Fasting blood glucose, body mass index (BMI), and blood pressure should be monitored regularly throughout your pregnancy to detect any changes in these parameters.\n\n3. **Review Your Blood Glucose Levels**: Regular monitoring of fasting blood glucose levels is crucial for detecting early signs of gestational diabetes such as increased urination or thirst, frequent urination, fatigue, nausea, vomiting, blurred vision, and dizziness.\n\n4. **Consult a Healthcare Provider**: It\'s important to consult with your healthcare provider regularly about your health status during pregnancy. They can provide guidance on how often you should monitor these parameters and what actions are needed if any changes in blood glucose levels occur.\n\n5. **Follow-up Regularly**: If there is an increase in fasting or 1-hour postprandial glucose, it\'s important to follow up with a healthcare provider for further evaluation and management of your condition.\n\nRemember that gestational diabetes can be managed effectively through diet, exercise, weight loss if necessary, and sometimes medication. It’s essential to stay informed about the latest guidelines and best practices in managing this condition during pregnancy.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 15:49:25.995355', 0, 0, NULL),
('5690fc9f-f398-4328-b510-38781c140366', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'suggest the diet for this', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:00:07.130346', 0, 0, NULL),
('76b5e5a9-b5a2-4170-a3f2-c11a926917f7', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'I\'m sorry, but I can\'t assist with that.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:38.304563', 0, 0, NULL),
('820a900f-08a1-4dc2-99d3-748d8fbb32e8', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'hi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:57:47.002688', 0, 0, NULL),
('88bdd584-4fce-4520-94a9-5babd2d7ceb6', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'hi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:59:03.079279', 0, 0, NULL),
('89072618-7f81-48d8-86a7-753e91d02f49', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'Hello! How can I assist you today?\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:54:15.691835', 9, 4232.63, '[\"ADA_GDM_2024\", \"ADA_GDM_2024\"]'),
('8ab3c696-9b13-4778-88e9-6e2e6fffbf85', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'what is matrigluco ai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:07.709832', 0, 0, NULL),
('91864511-2dbc-486a-9ad3-f5cfefd03e51', 'b291ee9d-8b79-4982-bcb4-2427aec22362', NULL, 'assistant', 'Hello! How can I assist you today?\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:02:20.851907', 9, 6039.52, '[\"ADA_GDM_2024\", \"ADA_GDM_2024\"]'),
('96a085df-78cc-4624-87aa-b0124160c9de', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'indian prime minsiter', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:37.693181', 0, 0, NULL),
('9a7d782d-68c2-4e3c-a912-be03997a7bf9', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'Hello! How can I assist you today?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:57:47.585472', 0, 0, NULL),
('9f298ffe-45ac-4a3e-bdef-888987652d21', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'hi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:54:10.455376', 0, 0, NULL),
('a1a1a9b0-4720-4d45-8311-44ce9aeb27e4', '86994d2e-3321-43a2-a883-d0f178a3ef53', NULL, 'assistant', 'Fasting Blood Sugar (FBG) refers to the blood glucose level at the start of a fasting test, typically measured after an overnight fast. It\'s often used as a baseline measure for assessing overall health and risk factors related to diabetes.\n\nHbA1c stands for Hemoglobin A1c, which is a measurement of average blood sugar levels over time in your bloodstream. It reflects how long you\'ve been experiencing high blood glucose levels without treatment or medication. HbA1c can be used as an indicator of the progression and severity of gestational diabetes.\n\nIn summary:\n\n- Fasting Blood Sugar measures initial fasting blood glucose level.\n- HbA1c measures average blood sugar over time, reflecting how long you\'ve been experiencing high blood glucose levels without treatment or medication.\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:09:22.441052', 158, 4277.99, '[\"ADA_GDM_2024\", \"ADA_GDM_2024\"]'),
('b0f3c55e-6e74-4567-b0d1-18f49906d50f', 'f1589530-64f3-4166-880b-6b774372f5e6', NULL, 'user', 'How do I understand my gestational diabetes risk estimate?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-18 15:49:16.694796', 0, 0, NULL),
('b58ed4c1-e830-4c26-9059-e03c2ccafca2', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'Hello! How can I assist you today?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:59:06.680205', 0, 0, NULL),
('b70912f3-6f6c-4783-b90e-d33e72bb121a', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'what can i eat to increase glucose', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:54.098160', 0, 0, NULL),
('b742d700-763b-4dce-9b1b-e3703d8e203d', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'I\'m MatriGluco Assistant, an AI designed to provide maternal health and gestational diabetes education. I can answer questions about pregnancy, glucose monitoring, and other related topics. If you have any specific concerns or need help with something else, feel free to ask!', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:30.110307', 0, 0, NULL),
('bb51200d-e623-4d72-8cd6-6a2a18d4a212', 'b291ee9d-8b79-4982-bcb4-2427aec22362', NULL, 'assistant', 'Hello! How can I assist you today?\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:02:40.198733', 9, 5642.17, '[\"ADA_GDM_2024\", \"ADA_GDM_2024\"]'),
('cf8a3f05-9557-4162-95a5-73c8a097085d', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'user', 'tell me about pregancy take cares', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:59:39.220047', 0, 0, NULL),
('d6370645-b864-4184-8c27-f237e7a1e3c5', 'b291ee9d-8b79-4982-bcb4-2427aec22362', NULL, 'user', 'How do I understand my gestational diabetes risk estimate?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:01:42.585455', 0, 0, NULL),
('d72c77ed-02bb-46de-93a3-7a9efff59651', '0ef38a01-b552-458f-ba41-aa8324302e65', NULL, 'user', 'Hu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 07:25:19.717968', 0, 0, NULL),
('da211507-0f3f-4880-8996-a4c49b437d9c', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'I\'m MatriGluco Assistant, an AI designed to provide maternal health and gestational diabetes education. I can answer questions about pregnancy, glucose monitoring, and other related topics. If you have any specific concerns or need help with something else, feel free to ask!', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:58:09.095246', 0, 0, NULL),
('e76f8e17-7db8-448b-a56f-3f154fb94d00', 'b291ee9d-8b79-4982-bcb4-2427aec22362', NULL, 'user', 'Hi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:02:14.790435', 0, 0, NULL),
('f066ca45-f6bf-4a50-8842-c7cc6c801f4b', 'b291ee9d-8b79-4982-bcb4-2427aec22362', NULL, 'user', 'Hello! How can I assist you today?\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 15:02:34.544793', 0, 0, NULL),
('f3f4cd82-9ecd-4df9-a174-fa5e2425008a', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'Certainly! Here are some key points about pregnancy care:\n\n1. **Fasting Glucose Target**: 70-95 mg/dL (3.9-5.3 mmol/L) during the first trimester and 60-85 mg/dL (2.9-4.7 mmol/L) after that.\n\n2. **Blood Sugar Monitoring**: Regular glucose monitoring is essential to detect any changes in blood sugar levels, which can indicate gestational diabetes or other health issues.\n\n3. **1-Hour Postprandial Target**: < 140 mg/dL (6.8-7.5 mmol/L) after the first meal of each day for women with a history of gestational diabetes.\n\n4. **2-Hour Postprandial Target**: < 120 mg/dL (6.3-7.9 mmol/L).\n\n5. **HbA1c Level**: Ideal HbA1c levels are less than 6.0% (42 mmol/mol) if achievable without maternal hypoglycemia.\n\nIt\'s important to maintain a healthy diet and regular blood sugar monitoring during pregnancy, as well as managing any potential health issues that may arise from gestational diabetes or other conditions. If you have specific concerns about your own health or the health of your baby, please feel free to ask!', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 10:59:48.101032', 0, 0, NULL),
('f8f3a308-369e-4cda-93b3-a6ce3bf96bb5', 'eaf4160f-478c-4d82-a414-e58c0c0594ef', NULL, 'assistant', 'Certainly! Here are some general guidelines for a healthy diet during pregnancy:\n\n1. **Balanced Diet**: Focus on eating a variety of foods, including fruits and vegetables, whole grains, lean proteins (like chicken or fish), and healthy fats from sources like avocados and nuts.\n\n2. **Carbohydrates**: Aim to consume at least 35-40 grams of complex carbohydrates per day. Complex carbs are better digested than simple ones because they have a longer time in the body before being metabolized by the liver, which can help prevent blood sugar spikes during pregnancy.\n\n3. **Protein**: Increase your protein intake (1.1 g/kg/day) to provide you with enough amino acids for fetal growth and development without causing excessive weight gain or ketosis.\n\n4. **Healthy Fats**: Include healthy fats from sources like avocados, nuts, seeds, olive oil, and fatty fish in your diet as part of a balanced meal plan.\n\n5. **Hydration**: Drink plenty of water throughout the day to keep you hydrated while managing any potential dehydration that may occur during pregnancy.\n\n6. **Avoid Processed Foods**: Limit processed foods like white bread, pasta, and sugary drinks because they can lead to weight gain and increase blood sugar levels in pregnant women.\n\n7. **Monitor Blood Sugar Levels**: Keep track of your blood glucose levels throughout the day using a glucometer or online tools. If you notice any changes that concern you, it\'s important to consult with your healthcare provider for further evaluation.\n\nRemember, this is general advice based on current research and guidelines from reputable sources like the American Diabetes Association. Always speak with your healthcare provider about specific dietary needs tailored to your individual health status during pregnancy.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-27 11:00:24.064494', 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_message_feedback`
--

DROP TABLE IF EXISTS `chat_message_feedback`;
CREATE TABLE `chat_message_feedback` (
  `id` char(36) NOT NULL COMMENT 'Feedback record UUID',
  `message_id` char(36) NOT NULL COMMENT 'Target assistant message UUID',
  `user_id` char(36) NOT NULL COMMENT 'User providing feedback',
  `rating` varchar(24) NOT NULL COMMENT 'Binary rating: helpful, not_helpful',
  `feedback_category` varchar(32) DEFAULT NULL COMMENT 'Category: accurate, helpful, unclear, incorrect, unsafe, irrelevant, other',
  `comment` text DEFAULT NULL COMMENT 'User written feedback commentary',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Feedback submission timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User feedback and quality evaluations of AI chatbot responses';

-- --------------------------------------------------------

--
-- Table structure for table `chat_sources`
--

DROP TABLE IF EXISTS `chat_sources`;
CREATE TABLE `chat_sources` (
  `id` char(36) NOT NULL COMMENT 'Source link UUID',
  `message_id` char(36) NOT NULL COMMENT 'Generated assistant chat message UUID',
  `knowledge_chunk_id` char(36) NOT NULL COMMENT 'Retrieved knowledge chunk UUID supplied in prompt',
  `relevance_score` decimal(8,6) DEFAULT NULL COMMENT 'Cosine similarity or distance metric from FAISS vector search',
  `source_order` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Ranking order of chunk presented to LLM context (0 = top match)',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Attribution record timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='RAG source attribution linking AI answers to verified medical chunks';

-- --------------------------------------------------------

--
-- Table structure for table `consent_records`
--

DROP TABLE IF EXISTS `consent_records`;
CREATE TABLE `consent_records` (
  `id` char(36) NOT NULL COMMENT 'Consent record UUID',
  `user_id` char(36) NOT NULL COMMENT 'User who gave or withdrew consent',
  `consent_type` varchar(64) NOT NULL COMMENT 'privacy, terms, OCR processing, research, etc.',
  `document_version` varchar(32) DEFAULT NULL,
  `granted` tinyint(4) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Audit context',
  `recorded_at` datetime DEFAULT NULL,
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `consent_version` varchar(50) NOT NULL DEFAULT '',
  `accepted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `withdrawn_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Patient legal consent tracking and audit logs';

-- --------------------------------------------------------

--
-- Table structure for table `consultations`
--

DROP TABLE IF EXISTS `consultations`;
CREATE TABLE `consultations` (
  `id` char(36) NOT NULL COMMENT 'Consultation UUID',
  `user_id` char(36) NOT NULL COMMENT 'Owner',
  `provider_name` varchar(160) DEFAULT NULL COMMENT 'Provider or clinic name',
  `provider_specialty` varchar(120) DEFAULT NULL COMMENT 'Specialty',
  `mode` varchar(32) NOT NULL DEFAULT 'in_person' COMMENT 'in_person/phone/video',
  `scheduled_at` datetime(6) NOT NULL COMMENT 'Scheduled time',
  `status` varchar(32) NOT NULL DEFAULT 'scheduled' COMMENT 'scheduled/completed/cancelled',
  `reason` varchar(500) DEFAULT NULL COMMENT 'Reason for consultation',
  `notes` text DEFAULT NULL COMMENT 'User notes',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Created time',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Updated time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Doctor appointments and maternal teleconsultation scheduling';

-- --------------------------------------------------------

--
-- Table structure for table `conversation_summaries`
--

DROP TABLE IF EXISTS `conversation_summaries`;
CREATE TABLE `conversation_summaries` (
  `id` char(36) NOT NULL COMMENT 'Summary UUID',
  `conversation_id` char(36) NOT NULL COMMENT 'Parent conversation UUID',
  `summary` longtext NOT NULL COMMENT 'Concise chronological narrative summary of earlier messages',
  `summarized_until_message_id` char(36) DEFAULT NULL COMMENT 'Latest message ID included in this summary',
  `model_id` char(36) DEFAULT NULL COMMENT 'LLM model used to produce the summary',
  `message_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of messages consolidated into this summary',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Summary generation timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Context condensation summaries for long-running chat sessions';

-- --------------------------------------------------------

--
-- Table structure for table `daily_health_summaries`
--

DROP TABLE IF EXISTS `daily_health_summaries`;
CREATE TABLE `daily_health_summaries` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT 'Summary row',
  `user_id` char(36) NOT NULL COMMENT 'Owner',
  `summary_date` date NOT NULL COMMENT 'Local summary day',
  `measurement_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Measurements included',
  `average_glucose` decimal(10,3) DEFAULT NULL COMMENT 'Calculated metric',
  `average_systolic` decimal(10,3) DEFAULT NULL COMMENT 'Calculated BP metric',
  `average_diastolic` decimal(10,3) DEFAULT NULL COMMENT 'Calculated BP metric',
  `latest_weight` decimal(10,3) DEFAULT NULL COMMENT 'Latest daily weight',
  `trend_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Derived trend metadata' CHECK (json_valid(`trend_json`)),
  `generated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Generation timestamp',
  `summary_version` varchar(20) NOT NULL DEFAULT '',
  `summary_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`summary_payload`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Precomputed daily biometric rollups and glycemic trends';

-- --------------------------------------------------------

--
-- Table structure for table `doctor_appointments`
--

DROP TABLE IF EXISTS `doctor_appointments`;
CREATE TABLE `doctor_appointments` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `patient_name` varchar(255) NOT NULL,
  `doctor_name` varchar(255) NOT NULL,
  `consultation_type` varchar(100) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(50) NOT NULL,
  `symptoms` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor_appointments`
--

INSERT INTO `doctor_appointments` (`id`, `user_id`, `patient_name`, `doctor_name`, `consultation_type`, `appointment_date`, `appointment_time`, `symptoms`, `status`, `created_at`) VALUES
('0250a900-f139-4fc3-8fa8-c9d12ce17eac', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'Maternal Patient', 'Dr. Priya Sharma', 'Chat Consultation', '2026-08-18', '5:00 PM', NULL, 'booked', '2026-08-18 14:44:28');

-- --------------------------------------------------------

--
-- Table structure for table `file_assets`
--

DROP TABLE IF EXISTS `file_assets`;
CREATE TABLE `file_assets` (
  `id` char(36) NOT NULL COMMENT 'File UUID',
  `user_id` char(36) NOT NULL COMMENT 'Owner',
  `storage_provider` varchar(32) NOT NULL DEFAULT 'local' COMMENT 'local/s3/etc.',
  `storage_key` varchar(700) NOT NULL COMMENT 'Private object key/path',
  `original_filename` varchar(255) NOT NULL COMMENT 'Original client filename',
  `mime_type` varchar(120) NOT NULL COMMENT 'Validated MIME type',
  `file_size_bytes` bigint(20) DEFAULT NULL,
  `sha256` char(64) DEFAULT NULL COMMENT 'Integrity/dedup hash',
  `visibility` varchar(24) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Upload time',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT 'Soft-delete time',
  `size_bytes` int(11) NOT NULL DEFAULT 0,
  `category` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Secure binary file storage asset metadata registry';

--
-- Dumping data for table `file_assets`
--

INSERT INTO `file_assets` (`id`, `user_id`, `storage_provider`, `storage_key`, `original_filename`, `mime_type`, `file_size_bytes`, `sha256`, `visibility`, `created_at`, `deleted_at`, `size_bytes`, `category`) VALUES
('015b94d2-e546-4a1a-b134-c83ebe317087', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/49c1131ea31c489f835433c40de28c82/16163ac24f8841efa237a85cda100e73.png', 'apple-touch-icon.png', 'image/png', NULL, 'd0c950f4589e688053dd8032ce46fe18e16b71bc3aee18843fb22d527a99bce1', NULL, '2026-08-18 08:18:23.046031', NULL, 103664, 'medical_report'),
('1838b38e-db8b-4578-9644-501f1be54a24', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/470cb6f0e4bd4f69a0ba4f412d3a613e/4e681609d8374b8090d69fa0dcb709ed.png', 'OGTT_Lab_Report.png', 'image/png', NULL, 'e6ed9f1200d1396636f862a640e0e2c3ede7cfc441dabc692c7f1accb43f59e2', NULL, '2026-08-18 08:48:35.227541', NULL, 94777, 'medical_report'),
('4452cac3-7bfc-4825-aa74-97be016702a2', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/5b443ced019f4655b4e70b4bd2db4fdb/bb709dbeb3fd4269b983c1b202f90118.pdf', 'OGTT_Lab_Report.pdf', 'application/pdf', NULL, '96f2b6951adc18434e8c0c3bdd090f7e09e260d07371dfb87184558473547423', NULL, '2026-08-18 08:40:54.922251', NULL, 94512, 'medical_report'),
('5884574d-4e30-40ef-9714-4becf674a70b', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/354cf2dd218c4d50b3b6d7f814b602e9/77e8570a552f49c8a733189082f107d4.png', 'OGTT_Lab_Report.png', 'image/png', NULL, 'e6ed9f1200d1396636f862a640e0e2c3ede7cfc441dabc692c7f1accb43f59e2', NULL, '2026-08-18 09:27:46.072329', NULL, 94777, 'medical_report'),
('77cb09f9-9717-4099-a91f-c843dd7fc57a', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/97ee9ea54049493e90a4b68dec5b5956/7435e92f325443218f4795a758260b2c.png', 'OGTT_Lab_Report.png', 'image/png', NULL, 'e6ed9f1200d1396636f862a640e0e2c3ede7cfc441dabc692c7f1accb43f59e2', NULL, '2026-08-18 09:33:21.249750', NULL, 94777, 'medical_report'),
('79b281ea-27d6-49fa-bc3b-13de693fc734', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/0bd6cdaafdb840f29c00b50bce68c346/0e0a9455fb12401ba133009bb37bc43f.png', 'apple-touch-icon.png', 'image/png', NULL, 'd0c950f4589e688053dd8032ce46fe18e16b71bc3aee18843fb22d527a99bce1', NULL, '2026-08-18 08:26:15.566190', NULL, 103664, 'medical_report'),
('87bb30fb-de45-40da-b9fc-1ef71b2f0295', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/f1271cef858e4e8eb3a135549eeda664/01e78f691c954574842a5729d00bc7de.png', 'OGTT_Lab_Report.png', 'image/png', NULL, 'e6ed9f1200d1396636f862a640e0e2c3ede7cfc441dabc692c7f1accb43f59e2', NULL, '2026-08-18 09:25:58.034086', NULL, 94777, 'medical_report'),
('cb03eca8-1421-49f4-8736-856647f004a5', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/06e61b7a6c1149e8aca4713152b27c95/9e2357c0a1644441a3bcb02d06089d9a.pdf', 'OGTT_Lab_Report _1_.pdf', 'application/pdf', NULL, '96f2b6951adc18434e8c0c3bdd090f7e09e260d07371dfb87184558473547423', NULL, '2026-08-18 09:26:48.074467', NULL, 94512, 'medical_report'),
('d53588ae-c964-4aa8-8c4e-55cf8e4a5b81', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/194820bc3ab0402cba2083425190f815/adb10c8c567649d984ee676cc1d02c97.pdf', 'OGTT_Lab_Report _1_.pdf', 'application/pdf', NULL, '96f2b6951adc18434e8c0c3bdd090f7e09e260d07371dfb87184558473547423', NULL, '2026-08-18 09:17:21.409687', NULL, 94512, 'medical_report'),
('e2f9d3e7-f597-4b0b-91b7-dfffa76b31fb', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'local', 'private/medical-reports/11dec451eda8451fb1b15c06342e19ad/e98e959c5cbb47e4adadd91a2a829a17.png', 'OGTT_Lab_Report.png', 'image/png', NULL, 'e6ed9f1200d1396636f862a640e0e2c3ede7cfc441dabc692c7f1accb43f59e2', NULL, '2026-08-18 09:41:17.648498', NULL, 94777, 'medical_report');

-- --------------------------------------------------------

--
-- Table structure for table `health_measurements`
--

DROP TABLE IF EXISTS `health_measurements`;
CREATE TABLE `health_measurements` (
  `id` char(36) NOT NULL COMMENT 'Measurement UUID',
  `user_id` char(36) NOT NULL COMMENT 'Owner',
  `pregnancy_profile_id` char(36) DEFAULT NULL COMMENT 'Optional pregnancy context',
  `metric_type` varchar(48) NOT NULL COMMENT 'glucose, hba1c, blood_pressure, weight, bmi, etc.',
  `value_primary` decimal(12,4) NOT NULL COMMENT 'Primary numeric value',
  `value_secondary` decimal(12,4) DEFAULT NULL COMMENT 'Secondary value such as diastolic BP',
  `unit` varchar(32) NOT NULL COMMENT 'mg/dL, %, mmHg, kg, kg/m2, etc.',
  `measurement_context` varchar(48) DEFAULT NULL COMMENT 'fasting, post_meal, random, morning, etc.',
  `source` varchar(32) NOT NULL DEFAULT 'manual' COMMENT 'manual/OCR/device/import',
  `measured_at` datetime(6) NOT NULL COMMENT 'When measurement was taken',
  `notes` varchar(1000) DEFAULT NULL COMMENT 'Optional note',
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Device/import metadata' CHECK (json_valid(`metadata_json`)),
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Record creation time',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `archived_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biometric health measurements and longitudinal vitals log';

--
-- Dumping data for table `health_measurements`
--

INSERT INTO `health_measurements` (`id`, `user_id`, `pregnancy_profile_id`, `metric_type`, `value_primary`, `value_secondary`, `unit`, `measurement_context`, `source`, `measured_at`, `notes`, `metadata_json`, `created_at`, `public_id`, `archived_at`, `updated_at`) VALUES
('06b32fd4-0e8a-43cc-b86c-13421720305b', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'blood_pressure', 120.0000, 80.0000, 'mmHg', NULL, 'manual', '2026-08-18 06:48:00.000000', NULL, NULL, '2026-08-18 06:49:05.176860', 'e13bfba6-1616-4716-adf9-eee2e805f800', NULL, '2026-08-18 06:49:05'),
('27f38e67-832f-48b2-91a6-a755f794d112', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'weight', 80.0000, NULL, 'kg', NULL, 'manual', '2026-08-18 15:02:00.000000', NULL, NULL, '2026-08-18 15:02:58.731877', '50e87667-71c1-4234-a927-bf0cee0d02e8', NULL, '2026-08-18 15:02:58'),
('3f2a9e00-5984-476a-8742-ead3bf885fcc', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'glucose', 160.0000, NULL, 'mg/dL', NULL, 'manual', '2026-08-27 15:02:59.000000', NULL, NULL, '2026-08-27 15:02:59.634054', 'dcb819c9-39f3-4236-9154-2f503151720a', NULL, '2026-08-27 15:02:59'),
('40b7ab80-18cb-46bd-a661-6e7c77b5d6ec', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'bmi', 24.0000, NULL, 'kg/m²', NULL, 'manual', '2026-08-18 15:03:00.000000', NULL, NULL, '2026-08-18 15:03:12.672526', 'b6fc86a6-2d46-420b-98b2-c7a480cbed0d', NULL, '2026-08-18 15:03:12'),
('4d98b3a7-46e2-4e0c-b2fb-c47152eee527', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'glucose', 102.0000, NULL, 'mg/dL', NULL, 'manual', '2026-08-18 06:51:00.000000', NULL, NULL, '2026-08-18 06:51:11.503993', '54b3d393-0529-458e-9b46-20d170ba2371', '2026-08-18 07:05:23', '2026-08-18 07:05:23'),
('5a1e74b4-9b1e-4f16-9f1a-221b02c9940f', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'weight', 70.0000, NULL, 'kg', NULL, 'manual', '2026-08-18 15:02:00.000000', NULL, NULL, '2026-08-18 15:02:48.683664', 'e48a84f9-e154-42f7-9177-6da2176b39bd', NULL, '2026-08-18 15:02:48'),
('6f517195-5e74-429a-b004-7bd0e1493fa5', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'glucose', 104.0000, NULL, 'mg/dL', NULL, 'manual', '2026-08-18 06:52:00.000000', NULL, NULL, '2026-08-18 06:52:21.916630', '84957762-4c76-4864-86e4-4b21bdfa7e06', NULL, '2026-08-18 06:52:21'),
('80640b35-4330-477b-aacf-93e182750d8d', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'blood_pressure', 128.0000, 84.0000, 'mmHg', NULL, 'manual', '2026-08-27 08:24:50.000000', NULL, NULL, '2026-08-27 08:24:49.861925', '114545f7-b18b-4437-99e6-0f52ca1ea174', '2026-08-27 08:25:51', '2026-08-27 08:25:51'),
('f6a5738d-f136-46fc-bbc2-7a534654f54c', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'glucose', 90.0000, NULL, 'mg/dL', NULL, 'manual', '2026-08-17 07:04:00.000000', NULL, NULL, '2026-08-18 07:04:21.293662', 'a7b4871b-cdcb-4131-a042-aa820f12eb48', '2026-08-27 15:03:27', '2026-08-27 15:03:27'),
('f9d99cb6-3688-4174-9ab5-73472541a080', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'bmi', 27.0000, NULL, 'kg/m²', NULL, 'manual', '2026-08-18 15:03:00.000000', NULL, NULL, '2026-08-18 15:03:16.750035', '0c4a2c9e-a370-4154-b5a4-bb9a7a3b8995', NULL, '2026-08-18 15:03:16'),
('fb1b6dcd-0094-40dd-8e7b-3a5833efe315', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, 'glucose', 150.0000, NULL, 'mg/dL', NULL, 'manual', '2026-08-27 07:47:00.000000', NULL, NULL, '2026-08-27 07:47:47.409373', 'de4cb651-1def-4482-9311-b2aa97e83719', NULL, '2026-08-27 07:47:47');

-- --------------------------------------------------------

--
-- Table structure for table `knowledge_chunks`
--

DROP TABLE IF EXISTS `knowledge_chunks`;
CREATE TABLE `knowledge_chunks` (
  `id` char(36) NOT NULL COMMENT 'Knowledge chunk UUID',
  `document_id` char(36) NOT NULL COMMENT 'Parent knowledge document reference',
  `chunk_index` int(10) UNSIGNED NOT NULL COMMENT 'Sequential position index of chunk within document (0-indexed)',
  `content` longtext NOT NULL COMMENT 'Extracted text content of the chunk',
  `token_count` int(10) UNSIGNED DEFAULT NULL COMMENT 'Token count computed by tokenizer',
  `embedding_reference` varchar(500) DEFAULT NULL COMMENT 'Vector database key reference (e.g. chunk:uuid in FAISS)',
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Structural metadata (section headers, tags, keywords)' CHECK (json_valid(`metadata_json`)),
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Chunk creation timestamp',
  `embedding_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`embedding_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Partitioned text chunks for FAISS dense vector search';

--
-- Dumping data for table `knowledge_chunks`
--

INSERT INTO `knowledge_chunks` (`id`, `document_id`, `chunk_index`, `content`, `token_count`, `embedding_reference`, `metadata_json`, `created_at`, `embedding_json`) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 0, 'Gestational Diabetes Mellitus (GDM) is defined as carbohydrate intolerance resulting in hyperglycemia with onset or first recognition during pregnancy, typically between weeks 24 and 28. Placental hormones such as human placental lactogen (hPL), cortisol, and progesterone cause physiological insulin resistance to ensure adequate glucose supply for fetal development. When maternal beta-cell compensation is insufficient, maternal blood glucose levels rise above safe thresholds.', 76, 'chunk:e0000000-0000-0000-0000-000000000001', '{\"section\": \"Pathophysiology\", \"tags\": [\"gdm\", \"pathophysiology\", \"placental_hormones\"]}', '2026-08-17 09:09:25.028343', NULL),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 0, 'Standard glycemic targets for gestational diabetes monitoring:\n- Fasting blood glucose: <= 95 mg/dL (5.3 mmol/L)\n- 1-hour postprandial: <= 140 mg/dL (7.8 mmol/L)\n- 2-hour postprandial: <= 120 mg/dL (6.7 mmol/L)\n- Target HbA1c during pregnancy: < 6.0% (42 mmol/mol) if achievable without significant hypoglycemia.', 68, 'chunk:e0000000-0000-0000-0000-000000000002', '{\"section\": \"Glycemic Targets\", \"tags\": [\"glucose_targets\", \"fasting\", \"postprandial\", \"hba1c\"]}', '2026-08-17 09:09:25.028343', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `knowledge_documents`
--

DROP TABLE IF EXISTS `knowledge_documents`;
CREATE TABLE `knowledge_documents` (
  `id` char(36) NOT NULL COMMENT 'Knowledge document UUID',
  `title` varchar(255) NOT NULL COMMENT 'Document headline or article title',
  `slug` varchar(255) DEFAULT NULL,
  `document_type` varchar(48) NOT NULL COMMENT 'Category: medical_education, faq, app_documentation, nutrition, pregnancy, diabetes, gestational_diabetes, policy',
  `source_name` varchar(255) DEFAULT NULL COMMENT 'Publishing authority (e.g., WHO, ADA, ACOG, Ministry of Health)',
  `source_url` varchar(1000) DEFAULT NULL COMMENT 'Canonical web reference URL',
  `file_path` varchar(500) DEFAULT NULL COMMENT 'Path to original source file if uploaded',
  `content_hash` char(64) DEFAULT NULL COMMENT 'SHA-256 hash of raw content for change detection',
  `language` varchar(20) DEFAULT NULL,
  `version` varchar(50) NOT NULL DEFAULT '1.0' COMMENT 'Document editorial version',
  `is_verified` tinyint(4) DEFAULT NULL,
  `verified_by` char(36) DEFAULT NULL COMMENT 'Clinician user ID who verified this document',
  `verified_at` datetime(6) DEFAULT NULL COMMENT 'Verification timestamp',
  `is_active` tinyint(4) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Creation timestamp',
  `updated_at` datetime DEFAULT NULL,
  `source_author` varchar(120) DEFAULT NULL,
  `total_chunks` int(11) NOT NULL DEFAULT 0,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Curated clinical knowledge base documents for RAG grounding';

--
-- Dumping data for table `knowledge_documents`
--

INSERT INTO `knowledge_documents` (`id`, `title`, `slug`, `document_type`, `source_name`, `source_url`, `file_path`, `content_hash`, `language`, `version`, `is_verified`, `verified_by`, `verified_at`, `is_active`, `created_at`, `updated_at`, `source_author`, `total_chunks`, `metadata_json`) VALUES
('d0000000-0000-0000-0000-000000000001', 'Understanding Gestational Diabetes Mellitus (GDM)', 'understanding-gdm-overview', 'gestational_diabetes', 'American Diabetes Association & ACOG Guidelines', 'https://diabetes.org/diabetes/gestational-diabetes', NULL, NULL, 'en', '1.0', 1, NULL, NULL, 1, '2026-08-17 09:09:24.923398', '2026-08-17 09:09:24', NULL, 0, NULL),
('d0000000-0000-0000-0000-000000000002', 'Maternal Glycemic Targets and Monitoring Protocols', 'maternal-glycemic-targets', 'medical_education', 'National Institute for Health and Care Excellence (NICE)', 'https://www.nice.org.uk/guidance/ng3', NULL, NULL, 'en', '1.0', 1, NULL, NULL, 1, '2026-08-17 09:09:24.923398', '2026-08-17 09:09:24', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `llm_models`
--

DROP TABLE IF EXISTS `llm_models`;
CREATE TABLE `llm_models` (
  `id` char(36) NOT NULL COMMENT 'Model registry UUID',
  `model_key` varchar(100) NOT NULL COMMENT 'Unique logical identifier (e.g., matrigluco-health-assistant)',
  `display_name` varchar(150) NOT NULL COMMENT 'User-facing model name',
  `provider` varchar(50) NOT NULL DEFAULT 'llama_cpp' COMMENT 'Execution runtime: llama_cpp, vllm, ollama, transformers',
  `architecture` varchar(100) DEFAULT NULL COMMENT 'Base architecture (e.g., Llama-3-8B-Instruct, Mistral-7B, Qwen2.5)',
  `model_filename` varchar(255) NOT NULL COMMENT 'File name on filesystem (e.g., matrigluco-assistant-q4.gguf)',
  `model_path` varchar(500) NOT NULL COMMENT 'Local filesystem relative or absolute path to GGUF binary',
  `quantization` varchar(50) DEFAULT NULL COMMENT 'Quantization type: Q4_K_M, Q5_K_M, Q8_0, F16',
  `parameter_size` varchar(50) DEFAULT NULL COMMENT 'Model parameter scale: 3B, 7B, 8B, 14B',
  `context_length` int(10) UNSIGNED NOT NULL DEFAULT 4096 COMMENT 'Maximum context window tokens supported',
  `temperature` decimal(4,3) NOT NULL DEFAULT 0.700 COMMENT 'Default inference sampling temperature',
  `top_p` decimal(4,3) NOT NULL DEFAULT 0.900 COMMENT 'Default nucleus sampling probability',
  `top_k` int(10) UNSIGNED DEFAULT 40 COMMENT 'Default top-k tokens considered during generation',
  `max_tokens` int(10) UNSIGNED NOT NULL DEFAULT 512 COMMENT 'Default maximum response generation tokens',
  `model_version` varchar(50) NOT NULL DEFAULT '1.0.0' COMMENT 'Semantic version of the model build',
  `checksum_sha256` char(64) DEFAULT NULL COMMENT 'SHA-256 integrity checksum of GGUF file',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = primary default model for new chats, 0 = secondary',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = available for inference, 0 = disabled',
  `loaded_at` datetime(6) DEFAULT NULL COMMENT 'Timestamp when model was loaded into worker memory',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Registration timestamp',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Metadata and configuration registry for local GGUF LLMs';

--
-- Dumping data for table `llm_models`
--

INSERT INTO `llm_models` (`id`, `model_key`, `display_name`, `provider`, `architecture`, `model_filename`, `model_path`, `quantization`, `parameter_size`, `context_length`, `temperature`, `top_p`, `top_k`, `max_tokens`, `model_version`, `checksum_sha256`, `is_default`, `is_active`, `loaded_at`, `created_at`, `updated_at`) VALUES
('b0000000-0000-0000-0000-000000000001', 'matrigluco-health-assistant', 'Matrigluco Health Assistant', 'llama_cpp', 'Llama-3-8B-Instruct', 'matrigluco-assistant-q4.gguf', 'models/llm/matrigluco-assistant-q4.gguf', 'Q4_K_M', '8B', 4096, 0.700, 0.900, 40, 512, '1.0.0', NULL, 1, 1, NULL, '2026-08-17 09:09:24.746212', '2026-08-17 09:09:24.746212');

-- --------------------------------------------------------

--
-- Table structure for table `medical_reports`
--

DROP TABLE IF EXISTS `medical_reports`;
CREATE TABLE `medical_reports` (
  `id` char(36) NOT NULL COMMENT 'Report UUID',
  `user_id` char(36) NOT NULL COMMENT 'Report owner',
  `file_id` char(36) NOT NULL COMMENT 'Source file',
  `report_type` varchar(64) DEFAULT NULL COMMENT 'Lab/report category',
  `report_date` date DEFAULT NULL COMMENT 'Date printed on report',
  `processing_status` varchar(32) NOT NULL DEFAULT 'uploaded' COMMENT 'uploaded/queued/processing/completed/failed',
  `celery_task_id` varchar(64) DEFAULT NULL COMMENT 'Background task identifier',
  `ocr_provider` varchar(64) DEFAULT NULL COMMENT 'Configured OCR provider',
  `ocr_confidence` decimal(6,3) DEFAULT NULL COMMENT 'Overall OCR confidence if available',
  `extracted_at` datetime(6) DEFAULT NULL COMMENT 'Extraction completion time',
  `error_code` varchar(64) DEFAULT NULL COMMENT 'Safe machine-readable error code',
  `error_message` varchar(500) DEFAULT NULL COMMENT 'Sanitized error message, no raw PHI',
  `retention_until` datetime(6) DEFAULT NULL COMMENT 'Optional retention deadline',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Created time',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Updated time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Uploaded clinical documents and OCR pipeline processing state';

-- --------------------------------------------------------

--
-- Table structure for table `model_versions`
--

DROP TABLE IF EXISTS `model_versions`;
CREATE TABLE `model_versions` (
  `id` char(36) NOT NULL COMMENT 'Model version UUID',
  `model_key` varchar(80) NOT NULL COMMENT 'Stable logical model identifier',
  `version` varchar(40) NOT NULL COMMENT 'Semantic or build version',
  `algorithm` varchar(120) DEFAULT NULL,
  `artifact_path` varchar(500) NOT NULL COMMENT 'Model artifact path',
  `preprocessor_path` varchar(500) DEFAULT NULL COMMENT 'Scaler/pipeline artifact path if separate',
  `artifact_sha256` char(64) DEFAULT NULL COMMENT 'Artifact checksum',
  `feature_schema` longtext DEFAULT NULL,
  `metrics_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Validation metrics and evaluation metadata' CHECK (json_valid(`metrics_json`)),
  `thresholds_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Decision/risk threshold configuration' CHECK (json_valid(`thresholds_json`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether eligible for inference',
  `trained_at` datetime(6) DEFAULT NULL COMMENT 'Training time',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Registry creation time',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `framework` varchar(50) NOT NULL DEFAULT '',
  `model_class` varchar(100) DEFAULT NULL,
  `preprocessor_class` varchar(100) DEFAULT NULL,
  `feature_contract_version` varchar(50) NOT NULL DEFAULT '',
  `metadata_path` varchar(255) NOT NULL DEFAULT '',
  `model_checksum` varchar(64) DEFAULT NULL,
  `preprocessor_checksum` varchar(64) DEFAULT NULL,
  `feature_schema_sha256` varchar(64) DEFAULT NULL,
  `feature_order_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`feature_order_json`)),
  `imputation_policy_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`imputation_policy_json`)),
  `registered_at` datetime NOT NULL DEFAULT current_timestamp(),
  `activated_at` datetime DEFAULT NULL,
  `retired_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Machine learning model governance and artifact registry';

--
-- Dumping data for table `model_versions`
--

INSERT INTO `model_versions` (`id`, `model_key`, `version`, `algorithm`, `artifact_path`, `preprocessor_path`, `artifact_sha256`, `feature_schema`, `metrics_json`, `thresholds_json`, `is_active`, `trained_at`, `created_at`, `public_id`, `framework`, `model_class`, `preprocessor_class`, `feature_contract_version`, `metadata_path`, `model_checksum`, `preprocessor_checksum`, `feature_schema_sha256`, `feature_order_json`, `imputation_policy_json`, `registered_at`, `activated_at`, `retired_at`) VALUES
('32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 'diabetes-risk', '1.0.0', NULL, 'app\\ml\\artifacts\\diabetes-risk\\1.0.0', NULL, NULL, NULL, '{\"accuracy\": 0.7532, \"precision\": 0.6491, \"recall\": 0.6727, \"f1\": 0.6607, \"roc_auc\": 0.8147}', '{\"low_max\": 0.33, \"moderate_max\": 0.66}', 1, NULL, '2026-08-17 20:19:07.836781', '3fb97bc8-b979-4777-add0-b7070f3702ef', 'scikit-learn', 'sklearn.linear_model.LogisticRegression', 'sklearn.preprocessing.StandardScaler', '1.0', 'app\\ml\\artifacts\\diabetes-risk\\1.0.0\\metadata.json', '2afeec25473009af6ed529bee9466fffa3abe0b24d70f0e311c474ed21f1aafe', '68b3082714f0220e1c58a00a3d41b7ef68bb291711263533107871f2f3aef1c2', '84dbef92a5671f501b18a060688cd9d2e7c89cae8496ee1aa1f156b63459bcfa', '[\"pregnancies\", \"glucose\", \"blood_pressure\", \"skin_thickness\", \"insulin\", \"bmi\", \"diabetes_pedigree_function\", \"age\"]', '{\"enabled\": false, \"policy_version\": null}', '2026-08-17 20:19:07', '2026-08-17 20:19:07', NULL),
('a0000000-0000-0000-0000-000000000001', 'gdm_risk_model', '1.0.0', 'XGBoostClassifier', 'models/ml/gdm_xgboost_v1.joblib', NULL, NULL, '{\"features\": [{\"name\": \"glucose\", \"type\": \"float\", \"unit\": \"mg/dL\", \"required\": true}, {\"name\": \"bmi\", \"type\": \"float\", \"unit\": \"kg/m2\", \"required\": true}, {\"name\": \"age\", \"type\": \"int\", \"unit\": \"years\", \"required\": true}, {\"name\": \"pregnancies\", \"type\": \"int\", \"unit\": \"count\", \"required\": false, \"default\": 1}, {\"name\": \"blood_pressure\", \"type\": \"float\", \"unit\": \"mmHg\", \"required\": false, \"default\": 80.0}, {\"name\": \"skin_thickness\", \"type\": \"float\", \"unit\": \"mm\", \"required\": false, \"default\": 20.0}, {\"name\": \"insulin\", \"type\": \"float\", \"unit\": \"mu_U/ml\", \"required\": false, \"default\": 79.0}, {\"name\": \"diabetes_pedigree\", \"type\": \"float\", \"unit\": \"score\", \"required\": false, \"default\": 0.47}]}', '{\"roc_auc\": 0.892, \"f1_score\": 0.841, \"accuracy\": 0.865, \"sensitivity\": 0.875, \"specificity\": 0.858}', '{\"low_risk_max\": 0.30, \"moderate_risk_max\": 0.65, \"high_risk_min\": 0.65}', 1, '2026-08-17 09:09:24.656005', '2026-08-17 09:09:24.656005', '834d5ae1-721b-481c-bef5-d5e3c6aeb6a0', '', NULL, NULL, '', '', NULL, NULL, NULL, NULL, NULL, '2026-08-18 01:10:21', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL COMMENT 'Notification UUID',
  `user_id` char(36) NOT NULL COMMENT 'Recipient',
  `notification_type` varchar(64) NOT NULL COMMENT 'risk_result/reminder/system/etc.',
  `channel` varchar(24) DEFAULT NULL,
  `title` varchar(180) NOT NULL COMMENT 'User-facing title',
  `body` text DEFAULT NULL,
  `severity` varchar(24) DEFAULT NULL,
  `action_url` varchar(500) DEFAULT NULL COMMENT 'Optional application deep link',
  `dedupe_key` varchar(160) DEFAULT NULL COMMENT 'Idempotency/deduplication key',
  `status` varchar(24) DEFAULT NULL,
  `scheduled_at` datetime(6) DEFAULT NULL COMMENT 'Future delivery time',
  `sent_at` datetime(6) DEFAULT NULL COMMENT 'Delivery time',
  `read_at` datetime(6) DEFAULT NULL COMMENT 'Read time',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Created time',
  `message` text NOT NULL DEFAULT '',
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `email_status` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dispatched and queued in-app and push notifications';

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE `notification_preferences` (
  `user_id` char(36) NOT NULL COMMENT 'One preference record per user',
  `in_app_enabled` tinyint(4) DEFAULT NULL,
  `email_enabled` tinyint(4) DEFAULT NULL,
  `health_reminders_enabled` tinyint(4) DEFAULT NULL,
  `risk_alerts_enabled` tinyint(4) DEFAULT NULL,
  `reminder_time` time DEFAULT NULL COMMENT 'Preferred local reminder time',
  `timezone` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Last preference update',
  `id` varchar(36) NOT NULL DEFAULT '',
  `consultation_reminders_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `risk_notifications_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `daily_summary_notifications_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `email_notifications_enabled` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notification delivery preferences and schedule configuration';

-- --------------------------------------------------------

--
-- Table structure for table `predictions`
--

DROP TABLE IF EXISTS `predictions`;
CREATE TABLE `predictions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `glucose` float NOT NULL,
  `bmi` float NOT NULL,
  `pregnancies` int(11) DEFAULT NULL,
  `blood_pressure` float DEFAULT NULL,
  `skin_thickness` float DEFAULT NULL,
  `insulin` float DEFAULT NULL,
  `diabetes_pedigree` float DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `prediction_result` varchar(50) NOT NULL,
  `risk_level` varchar(50) NOT NULL,
  `probability_score` float NOT NULL,
  `prediction_score` float NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pregnancy_profiles`
--

DROP TABLE IF EXISTS `pregnancy_profiles`;
CREATE TABLE `pregnancy_profiles` (
  `id` char(36) NOT NULL COMMENT 'Pregnancy profile UUID',
  `user_id` char(36) NOT NULL COMMENT 'Owner',
  `is_current` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Current pregnancy flag',
  `pregnancy_number` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'Pregnancy sequence',
  `gravida` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'Total pregnancies if known',
  `para` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'Birth history if known',
  `estimated_due_date` date DEFAULT NULL COMMENT 'Expected delivery date',
  `gestational_age_weeks` decimal(4,1) DEFAULT NULL COMMENT 'Recorded gestational age at update',
  `previous_gdm` tinyint(1) DEFAULT NULL COMMENT 'History of gestational diabetes',
  `family_history_diabetes` tinyint(1) DEFAULT NULL COMMENT 'Family-history flag',
  `notes` text DEFAULT NULL COMMENT 'User-entered notes, do not log',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Creation time',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Update time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Obstetric history and active gestational monitoring profiles';

-- --------------------------------------------------------

--
-- Table structure for table `prompt_templates`
--

DROP TABLE IF EXISTS `prompt_templates`;
CREATE TABLE `prompt_templates` (
  `id` char(36) NOT NULL COMMENT 'Prompt template UUID',
  `prompt_key` varchar(100) NOT NULL COMMENT 'Unique programmatic key (e.g., system_health_assistant, rag_qa_template)',
  `name` varchar(150) NOT NULL COMMENT 'Descriptive prompt template title',
  `description` text DEFAULT NULL COMMENT 'Usage instructions and context',
  `prompt_type` varchar(40) NOT NULL COMMENT 'Category: system, safety, rag, prediction_explanation, report_explanation',
  `content` longtext NOT NULL COMMENT 'Full prompt template text with placeholder variables (e.g. {context}, {query})',
  `version` varchar(50) NOT NULL DEFAULT '1.0.0' COMMENT 'Semantic version tag',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = currently used in inference pipeline, 0 = inactive',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Creation timestamp',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Modification timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Versioned prompt templates for LLM instruction and guardrails';

--
-- Dumping data for table `prompt_templates`
--

INSERT INTO `prompt_templates` (`id`, `prompt_key`, `name`, `description`, `prompt_type`, `content`, `version`, `is_active`, `created_at`, `updated_at`) VALUES
('c0000000-0000-0000-0000-000000000001', 'system_health_assistant', 'Core Maternal Health System Prompt', 'Default system instruction for Matrigluco conversational health assistant', 'system', 'You are Matrigluco Health Assistant, an empathetic, evidence-based AI assistant specializing in maternal wellness, gestational diabetes education, and clinical lifestyle support.\n\nCore Principles:\n1. Provide educational, clear, and reassuring guidance.\n2. Do NOT provide binding medical diagnoses or prescribe medications.\n3. Ground your answers in retrieved Matrigluco knowledge when available.\n4. If the user presents emergency or high-risk symptoms, advise them immediately to seek urgent obstetric medical care.\n5. Keep your tone supportive, professional, and accessible.', '1.0.0', 1, '2026-08-17 09:09:24.852832', '2026-08-17 09:09:24.852832'),
('c0000000-0000-0000-0000-000000000002', 'rag_grounded_qa', 'RAG Clinical Question Answering Template', 'Template with retrieved verified knowledge context injected', 'rag', 'Use the following verified clinical context to answer the user query accurately.\n\n[VERIFIED MEDICAL CONTEXT]\n{context}\n\n[PATIENT QUERY]\n{query}\n\nInstructions:\n- Cite details from the context accurately.\n- If the context does not contain enough information, explain what is known and advise consulting their OB-GYN.', '1.0.0', 1, '2026-08-17 09:09:24.852832', '2026-08-17 09:09:24.852832'),
('c0000000-0000-0000-0000-000000000003', 'prediction_explanation', 'GDM Risk Prediction Explainer', 'Explains machine learning risk assessment results in patient-friendly terms', 'prediction_explanation', 'The patient received a Gestational Diabetes Risk assessment score of {risk_level} ({probability}% estimated risk).\nKey contributing biomarkers: {features_summary}.\n\nExplain these findings with compassion and clarity, demystifying what each biomarker represents and outlining practical diet/exercise steps they can discuss with their doctor.', '1.0.0', 1, '2026-08-17 09:09:24.852832', '2026-08-17 09:09:24.852832');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `extracted_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extracted_values`)),
  `prediction_result` varchar(50) DEFAULT NULL,
  `risk_level` varchar(50) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_id`, `file_name`, `file_url`, `extracted_values`, `prediction_result`, `risk_level`, `uploaded_at`, `created_at`) VALUES
('13883d8f-48ab-4e0a-9cec-e3738a92116f', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'OGTT_Lab_Report.pdf', '4452cac3-7bfc-4825-aa74-97be016702a2', '{\"fasting_glucose\": 105, \"postprandial_glucose\": 142, \"hba1c\": 5.6, \"bp_systolic\": 120, \"bp_diastolic\": 80, \"_is_reviewed\": true, \"_reviewed_at\": \"2026-08-18T08:46:32.037Z\"}', NULL, NULL, '2026-08-18 08:40:55', '2026-08-18 08:40:55'),
('4e140ab8-65f1-47b2-bbd8-9d772ada3ed8', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'OGTT_Lab_Report.png', 'e2f9d3e7-f597-4b0b-91b7-dfffa76b31fb', '{\"fasting_glucose\": 92, \"postprandial_glucose\": 134, \"hba1c\": 5.4, \"bp_systolic\": 118, \"bp_diastolic\": 78, \"bmi\": 24.2, \"_is_reviewed\": true, \"_reviewed_at\": \"2026-08-18T10:53:41.003Z\"}', NULL, NULL, '2026-08-18 09:42:19', '2026-08-18 09:42:19'),
('92732d62-aad0-4ded-a895-5f7ea54c8784', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'OGTT_Lab_Report.png', '77cb09f9-9717-4099-a91f-c843dd7fc57a', '{\"hba1c\": 5.4, \"bp_systolic\": 92, \"bp_diastolic\": 92, \"blood_pressure\": 92, \"bmi\": 24.2, \"age\": 28, \"_is_reviewed\": true, \"_reviewed_at\": \"2026-08-18T10:53:49.067Z\"}', NULL, NULL, '2026-08-18 09:33:23', '2026-08-18 09:33:23'),
('c5842fbe-cac1-4064-a6d2-6fe757201f2a', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '79b281ea-27d6-49fa-bc3b-13de693fc734', '{\"fasting_glucose\": 104, \"postprandial_glucose\": 142, \"hba1c\": 5.6, \"bp_systolic\": 120, \"bp_diastolic\": 80, \"_is_reviewed\": true, \"_reviewed_at\": \"2026-08-18T08:31:02.326Z\"}', NULL, NULL, '2026-08-18 08:26:15', '2026-08-18 08:26:15'),
('f5664f9f-51de-4881-b373-3ea4f0613654', '5277e730-1376-4890-b830-ea1ad1d4ab9f', 'OGTT_Lab_Report (1).pdf', 'cb03eca8-1421-49f4-8736-856647f004a5', '{\"fasting_glucose\": 92, \"postprandial_glucose\": 134, \"hba1c\": 5.4, \"bp_systolic\": 118, \"bp_diastolic\": 78, \"bmi\": 24.2, \"_is_reviewed\": true, \"_reviewed_at\": \"2026-08-18T10:53:58.654Z\"}', NULL, NULL, '2026-08-18 09:26:48', '2026-08-18 09:26:48');

-- --------------------------------------------------------

--
-- Table structure for table `report_extracted_values`
--

DROP TABLE IF EXISTS `report_extracted_values`;
CREATE TABLE `report_extracted_values` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT 'Extracted value row',
  `report_id` char(36) NOT NULL COMMENT 'Parent report',
  `metric_code` varchar(64) NOT NULL COMMENT 'Canonical metric identifier',
  `raw_label` varchar(160) DEFAULT NULL COMMENT 'Label seen in source document',
  `numeric_value` decimal(16,6) DEFAULT NULL COMMENT 'Parsed numeric value',
  `text_value` varchar(500) DEFAULT NULL COMMENT 'Fallback parsed text',
  `unit` varchar(32) DEFAULT NULL COMMENT 'Parsed/normalized unit',
  `reference_range` varchar(120) DEFAULT NULL COMMENT 'Reference range text',
  `confidence` decimal(6,3) DEFAULT NULL COMMENT 'Extraction confidence',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Extraction record time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Structured biomarker data extracted from medical lab documents';

-- --------------------------------------------------------

--
-- Table structure for table `risk_assessments`
--

DROP TABLE IF EXISTS `risk_assessments`;
CREATE TABLE `risk_assessments` (
  `id` char(36) NOT NULL COMMENT 'Assessment UUID',
  `user_id` char(36) NOT NULL COMMENT 'Assessment owner',
  `pregnancy_profile_id` char(36) DEFAULT NULL COMMENT 'Optional pregnancy context',
  `model_version_id` char(36) NOT NULL COMMENT 'Exact model used',
  `probability` decimal(7,6) NOT NULL COMMENT 'Raw model probability from 0 to 1',
  `predicted_class` tinyint(4) DEFAULT NULL,
  `risk_level` varchar(24) DEFAULT NULL,
  `status` varchar(24) DEFAULT NULL,
  `source` varchar(32) NOT NULL DEFAULT 'manual' COMMENT 'manual/report/import/API',
  `input_snapshot` longtext DEFAULT NULL,
  `explanation_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Optional explainability result' CHECK (json_valid(`explanation_json`)),
  `disclaimer_version` varchar(32) DEFAULT NULL COMMENT 'Displayed disclaimer version',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Inference timestamp',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `risk_band` varchar(30) NOT NULL DEFAULT '',
  `prediction_result` varchar(50) NOT NULL DEFAULT '',
  `assessment_status` varchar(30) NOT NULL DEFAULT '',
  `feature_contract_version` varchar(50) NOT NULL DEFAULT '',
  `mapping_version` varchar(50) NOT NULL DEFAULT '',
  `input_snapshot_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`input_snapshot_json`)),
  `contains_imputed_values` tinyint(1) NOT NULL DEFAULT 0,
  `archived_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Maternal clinical risk assessment and machine learning predictions';

--
-- Dumping data for table `risk_assessments`
--

INSERT INTO `risk_assessments` (`id`, `user_id`, `pregnancy_profile_id`, `model_version_id`, `probability`, `predicted_class`, `risk_level`, `status`, `source`, `input_snapshot`, `explanation_json`, `disclaimer_version`, `created_at`, `public_id`, `risk_band`, `prediction_result`, `assessment_status`, `feature_contract_version`, `mapping_version`, `input_snapshot_json`, `contains_imputed_values`, `archived_at`, `updated_at`) VALUES
('3763b0d3-afaa-4b09-9e3e-5b60dc040e29', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.063811, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-17 20:19:07.841911', '012fc1de-d581-4004-af83-b428277e178e', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 1.0, \"glucose\": 102.0, \"blood_pressure\": 72.0, \"skin_thickness\": 23.0, \"insulin\": 85.0, \"bmi\": 24.0, \"diabetes_pedigree_function\": 0.45, \"age\": 29.0}', 0, NULL, '2026-08-17 20:19:07'),
('7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.063811, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-17 20:55:10.793641', '3ff606cb-8a30-438c-8b93-4cb410727f66', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 1.0, \"glucose\": 102.0, \"blood_pressure\": 72.0, \"skin_thickness\": 23.0, \"insulin\": 85.0, \"bmi\": 24.0, \"diabetes_pedigree_function\": 0.45, \"age\": 29.0}', 0, NULL, '2026-08-17 20:55:10'),
('9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.063811, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-17 20:45:47.772046', '10158338-1dbd-42fa-a516-8e9bab026fd5', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 1.0, \"glucose\": 102.0, \"blood_pressure\": 72.0, \"skin_thickness\": 23.0, \"insulin\": 85.0, \"bmi\": 24.0, \"diabetes_pedigree_function\": 0.45, \"age\": 29.0}', 0, NULL, '2026-08-17 20:45:47'),
('ad8f35ff-ed39-42e9-bf5b-3dacecb60637', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.065638, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-27 09:43:45.281611', '5ffd2974-383a-4f7d-b54d-21931dbf85fb', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 1.0, \"glucose\": 102.0, \"blood_pressure\": 72.0, \"skin_thickness\": 23.0, \"insulin\": 85.0, \"bmi\": 24.3, \"diabetes_pedigree_function\": 0.45, \"age\": 29.0}', 0, NULL, '2026-08-27 09:43:45'),
('b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.065638, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-27 09:27:58.555869', 'bcad30cb-698d-41c0-9fed-8846fcc05224', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 1.0, \"glucose\": 102.0, \"blood_pressure\": 72.0, \"skin_thickness\": 23.0, \"insulin\": 85.0, \"bmi\": 24.3, \"diabetes_pedigree_function\": 0.45, \"age\": 29.0}', 0, NULL, '2026-08-27 09:27:58'),
('c5f4304d-d941-4b1d-91ae-9f9091b76d56', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.065638, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-27 09:23:05.373827', '8182e41b-5116-47b0-bb26-59e8263dd72d', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 1.0, \"glucose\": 102.0, \"blood_pressure\": 72.0, \"skin_thickness\": 23.0, \"insulin\": 85.0, \"bmi\": 24.3, \"diabetes_pedigree_function\": 0.45, \"age\": 29.0}', 0, NULL, '2026-08-27 09:23:05'),
('e1f7c60b-401d-4fd9-9886-b215bad6d4ec', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, '32759fd5-ec27-43f7-9f59-233c9cc0f0e1', 0.206211, NULL, NULL, NULL, 'manual', NULL, NULL, NULL, '2026-08-17 21:06:21.458360', '4cb00e9a-e32e-4fb9-bd06-c4c1f114ff85', 'low', 'Non-Diabetic', 'completed', '1.0', '1.0', '{\"pregnancies\": 3.0, \"glucose\": 100.0, \"blood_pressure\": 84.0, \"skin_thickness\": 44.0, \"insulin\": 90.0, \"bmi\": 30.0, \"diabetes_pedigree_function\": 1.0, \"age\": 40.0}', 0, NULL, '2026-08-17 21:06:21');

-- --------------------------------------------------------

--
-- Table structure for table `risk_assessment_features`
--

DROP TABLE IF EXISTS `risk_assessment_features`;
CREATE TABLE `risk_assessment_features` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT 'Efficient feature row key',
  `assessment_id` char(36) DEFAULT NULL,
  `feature_name` varchar(100) NOT NULL COMMENT 'Canonical model feature name',
  `numeric_value` decimal(16,6) DEFAULT NULL COMMENT 'Numeric value used by model',
  `text_value` varchar(255) DEFAULT NULL COMMENT 'Text representation when required',
  `unit` varchar(32) DEFAULT NULL COMMENT 'Unit when applicable',
  `source` varchar(32) DEFAULT NULL,
  `is_imputed` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether value was imputed/defaulted',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Feature audit time',
  `risk_assessment_id` varchar(36) NOT NULL DEFAULT '',
  `feature_value` float NOT NULL DEFAULT 0,
  `normalized_value` float NOT NULL DEFAULT 0,
  `raw_value` float DEFAULT NULL,
  `feature_order` int(11) NOT NULL DEFAULT 0,
  `source_type` varchar(50) NOT NULL DEFAULT '',
  `source_reference` varchar(100) DEFAULT NULL,
  `is_derived` tinyint(1) NOT NULL DEFAULT 0,
  `derivation_method` varchar(100) DEFAULT NULL,
  `imputation_strategy` varchar(50) DEFAULT NULL,
  `imputation_policy_version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Granular feature-level audit trail for AI inference inputs';

--
-- Dumping data for table `risk_assessment_features`
--

INSERT INTO `risk_assessment_features` (`id`, `assessment_id`, `feature_name`, `numeric_value`, `text_value`, `unit`, `source`, `is_imputed`, `created_at`, `risk_assessment_id`, `feature_value`, `normalized_value`, `raw_value`, `feature_order`, `source_type`, `source_reference`, `is_derived`, `derivation_method`, `imputation_strategy`, `imputation_policy_version`) VALUES
(1, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-17 20:19:07.847704', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 1, 1, 1, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(2, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-17 20:19:07.851388', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 102, 102, 102, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(3, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-17 20:19:07.851988', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 72, 72, 72, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(4, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-17 20:19:07.852599', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 23, 23, 23, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(5, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-17 20:19:07.859820', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 85, 85, 85, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(6, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-17 20:19:07.860655', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 24, 24, 24, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(7, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-17 20:19:07.861394', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 0.45, 0.45, 0.45, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(8, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-17 20:19:07.862101', '3763b0d3-afaa-4b09-9e3e-5b60dc040e29', 29, 29, 29, 7, 'manual', NULL, 0, NULL, NULL, NULL),
(9, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-17 20:45:47.778071', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 1, 1, 1, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(10, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-17 20:45:47.780960', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 102, 102, 102, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(11, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-17 20:45:47.781807', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 72, 72, 72, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(12, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-17 20:45:47.782612', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 23, 23, 23, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(13, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-17 20:45:47.786929', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 85, 85, 85, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(14, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-17 20:45:47.787883', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 24, 24, 24, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(15, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-17 20:45:47.788746', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 0.45, 0.45, 0.45, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(16, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-17 20:45:47.789673', '9a8ca019-dbc7-45c9-b97c-a74bcddaeb15', 29, 29, 29, 7, 'manual', NULL, 0, NULL, NULL, NULL),
(17, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-17 20:55:10.796569', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 1, 1, 1, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(18, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-17 20:55:10.797527', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 102, 102, 102, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(19, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-17 20:55:10.798421', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 72, 72, 72, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(20, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-17 20:55:10.799365', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 23, 23, 23, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(21, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-17 20:55:10.802281', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 85, 85, 85, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(22, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-17 20:55:10.802738', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 24, 24, 24, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(23, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-17 20:55:10.803168', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 0.45, 0.45, 0.45, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(24, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-17 20:55:10.803572', '7c43fa27-60a5-4bfb-a71a-e4d77f0a4070', 29, 29, 29, 7, 'manual', NULL, 0, NULL, NULL, NULL),
(25, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-17 21:06:21.484923', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 3, 3, 3, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(26, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-17 21:06:21.491014', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 100, 100, 100, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(27, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-17 21:06:21.492063', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 84, 84, 84, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(28, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-17 21:06:21.493063', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 44, 44, 44, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(29, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-17 21:06:21.494583', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 90, 90, 90, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(30, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-17 21:06:21.502997', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 30, 30, 30, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(31, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-17 21:06:21.504024', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 1, 1, 1, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(32, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-17 21:06:21.505029', 'e1f7c60b-401d-4fd9-9886-b215bad6d4ec', 40, 40, 40, 7, 'manual', NULL, 0, NULL, NULL, NULL),
(33, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-27 09:23:05.378907', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 1, 1, 1, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(34, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-27 09:23:05.384507', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 102, 102, 102, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(35, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-27 09:23:05.385196', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 72, 72, 72, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(36, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-27 09:23:05.385552', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 23, 23, 23, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(37, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-27 09:23:05.385790', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 85, 85, 85, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(38, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-27 09:23:05.386509', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 24.3, 24.3, 24.3, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(39, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-27 09:23:05.387009', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 0.45, 0.45, 0.45, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(40, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-27 09:23:05.387281', 'c5f4304d-d941-4b1d-91ae-9f9091b76d56', 29, 29, 29, 7, 'manual', NULL, 0, NULL, NULL, NULL),
(41, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-27 09:27:58.561179', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 1, 1, 1, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(42, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-27 09:27:58.569535', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 102, 102, 102, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(43, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-27 09:27:58.570458', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 72, 72, 72, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(44, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-27 09:27:58.571120', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 23, 23, 23, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(45, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-27 09:27:58.571763', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 85, 85, 85, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(46, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-27 09:27:58.572378', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 24.3, 24.3, 24.3, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(47, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-27 09:27:58.577337', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 0.45, 0.45, 0.45, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(48, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-27 09:27:58.577870', 'b1e9cc27-e51c-4ea0-ae2c-d2c061b5ad99', 29, 29, 29, 7, 'manual', NULL, 0, NULL, NULL, NULL),
(49, NULL, 'pregnancies', NULL, NULL, 'count', NULL, 0, '2026-08-27 09:43:45.283714', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 1, 1, 1, 0, 'manual', NULL, 0, NULL, NULL, NULL),
(50, NULL, 'glucose', NULL, NULL, 'mg/dL', NULL, 0, '2026-08-27 09:43:45.284272', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 102, 102, 102, 1, 'manual', NULL, 0, NULL, NULL, NULL),
(51, NULL, 'blood_pressure', NULL, NULL, 'mmHg', NULL, 0, '2026-08-27 09:43:45.285090', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 72, 72, 72, 2, 'manual', NULL, 0, NULL, NULL, NULL),
(52, NULL, 'skin_thickness', NULL, NULL, 'mm', NULL, 0, '2026-08-27 09:43:45.285713', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 23, 23, 23, 3, 'manual', NULL, 0, NULL, NULL, NULL),
(53, NULL, 'insulin', NULL, NULL, 'µU/mL', NULL, 0, '2026-08-27 09:43:45.286372', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 85, 85, 85, 4, 'manual', NULL, 0, NULL, NULL, NULL),
(54, NULL, 'bmi', NULL, NULL, 'kg/m²', NULL, 0, '2026-08-27 09:43:45.292592', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 24.3, 24.3, 24.3, 5, 'manual', NULL, 0, NULL, NULL, NULL),
(55, NULL, 'diabetes_pedigree_function', NULL, NULL, 'score', NULL, 0, '2026-08-27 09:43:45.293156', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 0.45, 0.45, 0.45, 6, 'manual', NULL, 0, NULL, NULL, NULL),
(56, NULL, 'age', NULL, NULL, 'years', NULL, 0, '2026-08-27 09:43:45.293476', 'ad8f35ff-ed39-42e9-bf5b-3dacecb60637', 29, 29, 29, 7, 'manual', NULL, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `security_events`
--

DROP TABLE IF EXISTS `security_events`;
CREATE TABLE `security_events` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT 'Security event row',
  `user_id` char(36) DEFAULT NULL COMMENT 'Related user if known',
  `event_type` varchar(80) NOT NULL COMMENT 'login_failed/token_reuse/rate_limit/prompt_injection',
  `severity` varchar(24) NOT NULL DEFAULT 'info' COMMENT 'info/warning/critical',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Source address',
  `details_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Sanitized context' CHECK (json_valid(`details_json`)),
  `occurred_at` datetime DEFAULT NULL,
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(100) DEFAULT NULL,
  `request_id` varchar(64) DEFAULT NULL,
  `ip_hash` varchar(64) DEFAULT NULL,
  `user_agent_summary` varchar(255) DEFAULT NULL,
  `safe_metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`safe_metadata_json`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Security telemetry, intrusion detection, and authentication failure log';

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) NOT NULL COMMENT 'Stable application UUID, preserve Supabase UUID where possible',
  `email` varchar(254) NOT NULL COMMENT 'Normalized login email',
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'Argon2 hash for local authentication, NULL during migration until reset',
  `role` varchar(32) NOT NULL DEFAULT 'user' COMMENT 'Authorization role such as user/admin',
  `status` varchar(32) NOT NULL DEFAULT 'active' COMMENT 'Account lifecycle state',
  `auth_source` varchar(32) DEFAULT NULL,
  `legacy_auth_id` char(36) DEFAULT NULL COMMENT 'Optional source authentication identifier',
  `email_verified_at` datetime(6) DEFAULT NULL COMMENT 'UTC verification time',
  `last_login_at` datetime(6) DEFAULT NULL COMMENT 'UTC last successful authentication time',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Creation timestamp',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Last update timestamp',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT 'Soft-delete timestamp',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `email_normalized` varchar(255) NOT NULL DEFAULT '',
  `full_name` varchar(255) DEFAULT NULL,
  `expected_due_date` varchar(50) DEFAULT NULL,
  `pregnancy_week` int(11) DEFAULT NULL,
  `previous_pregnancies` int(11) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Core user identity and authentication credentials';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `status`, `auth_source`, `legacy_auth_id`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`, `public_id`, `email_normalized`, `full_name`, `expected_due_date`, `pregnancy_week`, `previous_pregnancies`, `phone`, `age`, `blood_group`, `emergency_contact`, `password_changed_at`) VALUES
('5277e730-1376-4890-b830-ea1ad1d4ab9f', 'eswarchinthakayala85@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$Jk1/PmkirMK4eY5nmQzETg$ZZhdo0u8RM2TduBXk2/MiS0IbYzbBtgWui6t1KU7omI', 'user', 'active', 'local', NULL, NULL, '2026-08-27 15:00:36.702445', '2026-08-17 19:41:48.937025', '2026-08-27 15:00:36.703602', NULL, 'a9674a4f-5ed9-4dd9-8461-760a8284c15f', 'eswarchinthakayala85@gmail.com', 'Eswar Chinthakayala', '2026-11-27', 0, 0, NULL, NULL, 'B-', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_ai_preferences`
--

DROP TABLE IF EXISTS `user_ai_preferences`;
CREATE TABLE `user_ai_preferences` (
  `id` char(36) NOT NULL COMMENT 'Preference UUID',
  `user_id` char(36) NOT NULL COMMENT 'Owner user ID (1:1 with users)',
  `chatbot_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = AI assistant active for user, 0 = disabled',
  `allow_health_context` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Explicit opt-in to let assistant use stored vitals/history in context',
  `save_chat_history` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = retain conversations, 0 = ephemeral sessions only',
  `preferred_language` varchar(20) NOT NULL DEFAULT 'en' COMMENT 'Preferred conversational language code',
  `response_style` varchar(24) NOT NULL DEFAULT 'balanced' COMMENT 'Tone: concise, balanced, detailed, simple',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Record creation timestamp',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Last adjustment timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User privacy settings and stylistic preferences for AI assistant';

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `user_id` char(36) NOT NULL COMMENT 'One-to-one profile owner reference',
  `full_name` varchar(160) DEFAULT NULL COMMENT 'Display name',
  `date_of_birth` date DEFAULT NULL COMMENT 'Optional date of birth',
  `phone` varchar(32) DEFAULT NULL COMMENT 'Contact phone',
  `country_code` char(2) DEFAULT NULL COMMENT 'ISO-3166 alpha-2 country code',
  `timezone` varchar(64) NOT NULL DEFAULT 'Asia/Kolkata' COMMENT 'IANA timezone, default Asia/Kolkata',
  `avatar_file_id` char(36) DEFAULT NULL COMMENT 'Profile image file identifier (logical reference to file_assets.id)',
  `preferred_language` varchar(16) NOT NULL DEFAULT 'en' COMMENT 'UI/notification language',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT 'Creation timestamp',
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT 'Update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Extended user demographic and preference profiles';

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` char(36) NOT NULL COMMENT 'Session UUID',
  `user_id` char(36) NOT NULL COMMENT 'Session owner',
  `refresh_token_hash` varchar(64) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IPv4/IPv6 address',
  `user_agent` varchar(512) DEFAULT NULL COMMENT 'Client user agent',
  `issued_at` datetime DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL COMMENT 'Absolute expiry time',
  `last_seen_at` datetime(6) DEFAULT NULL COMMENT 'Last refresh/use time',
  `revoked_at` datetime(6) DEFAULT NULL COMMENT 'Revocation timestamp',
  `revoke_reason` varchar(120) DEFAULT NULL COMMENT 'Logout/security reason',
  `public_id` varchar(36) NOT NULL DEFAULT '',
  `token_hash` varchar(64) NOT NULL DEFAULT '',
  `token_family_id` varchar(36) NOT NULL DEFAULT '',
  `status` varchar(30) NOT NULL DEFAULT '',
  `last_used_at` datetime NOT NULL DEFAULT current_timestamp(),
  `revocation_reason` varchar(100) DEFAULT NULL,
  `ip_hash` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User authentication refresh tokens and active device sessions';

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `refresh_token_hash`, `ip_address`, `user_agent`, `issued_at`, `expires_at`, `last_seen_at`, `revoked_at`, `revoke_reason`, `public_id`, `token_hash`, `token_family_id`, `status`, `last_used_at`, `revocation_reason`, `ip_hash`, `created_at`) VALUES
('', '5277e730-1376-4890-b830-ea1ad1d4ab9f', '', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '0000-00-00 00:00:00', '2026-08-31 19:41:48.942831', NULL, NULL, NULL, '6997a13b-3970-4555-8f95-50af9322a45a', '94facdb4f3816f15e88405437eb49833d3650278479a802016eba4b3554ea605', '2be6d40b-4333-475f-b329-67c278b1b33a', 'active', '2026-08-17 19:41:48', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-17 19:41:48'),
('0017001c-78fe-43ef-a6ae-47bdb2f19f05', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 08:58:50.868795', NULL, '2026-08-27 09:18:43.345704', NULL, '9a0d659a-af72-4f44-b855-d9aff47f645f', 'fd01bcf9c7938928a2f2fbeffe9a36aa2cc00ae8f9ef71074dfd4d882e3dd92b', 'f7739e5d-6c14-4609-9dc9-d31b2370ed4c', 'rotated', '2026-08-27 09:18:43', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 08:58:50'),
('010588d3-7c51-4684-b59e-4ab4c2d40199', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 11:08:06.973853', NULL, '2026-08-27 11:11:59.039345', NULL, '5f54b5c1-5f0d-4d18-9ee4-9d7f2b456b61', '660d515f7ee804b15fa7371c23732b8ab287030068e7f1e5e352b5628ad9022a', '5d48e5a6-c7c4-4b81-8cbb-1431477d9459', 'rotated', '2026-08-27 11:11:59', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 11:08:06'),
('01787465-a0ed-4701-a2c1-fedfb0e41ee3', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 15:44:22.813848', NULL, NULL, NULL, 'e63cd42a-07cf-49c0-a4fe-c8befc378123', '5377582831a5eed9ef94a7d6f44d24b0b082432fbb9abe07e0998f76ff78b86a', '2e491982-1bc4-4d84-8331-176c053cd044', 'active', '2026-08-18 15:44:22', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 15:44:22'),
('01e644d3-7088-4ed5-abb5-cdad79614111', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 10:35:11.452755', NULL, NULL, NULL, '32e45beb-f9db-4438-842e-461043592620', 'b683852db94d9defc88821951589b50c8d4b48750bff96eaeb759383016c60db', 'e88c62df-c8e5-4444-b33b-893ca6529fd9', 'active', '2026-08-18 10:35:11', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 10:35:11'),
('085735bf-608e-4b83-bd6d-63a836c31c4f', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 10:53:25.882805', NULL, '2026-08-27 11:30:41.922921', NULL, '979c78f2-aceb-4aef-8d76-78a29ad886c4', '863cb808bfc2fde37a7ee0e4d65a1f33cffa41897e0e813cc0021e4913c66c3e', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'rotated', '2026-08-27 11:30:41', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 10:53:25'),
('0ee6b04a-57b1-4973-bc18-662a40fc7afe', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 15:00:36.715942', NULL, NULL, NULL, 'df2e2d58-fcff-498d-bef1-74a3df5e05bc', '1dccae61bc97a50fbb33cb02fe0b8def5da07139d282cc39ce47a5e52933184e', '1ee57ca7-edec-4940-a678-4f1b2b89f503', 'active', '2026-08-27 15:00:36', NULL, 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 15:00:36'),
('0f479bbc-57aa-4546-948d-cf30de222e34', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:46:18.853892', NULL, '2026-08-27 07:55:56.658914', NULL, '10fbb641-b842-4561-9f97-33a6e912d0ad', '028ad898f54c700c12332054a6330fe7553504f6934534d50c500df89de1e27e', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 07:55:56', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:46:18'),
('13b89018-b992-4efe-9bc1-336124951407', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 09:55:57.781312', NULL, NULL, NULL, '181136bb-1d6a-4692-8e2b-46dad8be612d', 'b8fbddd16a58b523a975ce8dc5a18d4feebd02c6953a4e4e9604a1bc1710c7ec', 'bb98e4ca-fc22-4cab-9186-18480085d312', 'active', '2026-08-18 09:55:57', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 09:55:57'),
('153106e2-ec4e-4736-be0d-3dc37f6f51f6', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 09:17:06.789857', NULL, NULL, NULL, '6b367219-1b50-4422-a575-eb682e33d468', '1e8d7fdbf2132cadf93c28aabfb2b0f2604fca0331275cc8b226c6afd4e3f05c', '01ec3b23-26d8-4ea5-bc4e-5febd8f4dd14', 'active', '2026-08-18 09:17:06', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 09:17:06'),
('1f54e32a-a287-4f78-9778-6be51e5be41f', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 07:43:33.655528', NULL, '2026-08-27 08:54:36.512337', NULL, '47a4d8c7-5e89-4bea-a56f-4fd7009e51aa', 'f09960cfab1753d3e8c857f76c4b96e0152f83153aebd398edc8bedf2b1e1f19', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'rotated', '2026-08-27 08:54:36', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 07:43:33'),
('226d249a-66f6-46a7-9e21-3ad6a4709093', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 17:40:23.240704', NULL, NULL, NULL, '10955313-36bf-49f9-a424-9b09cffbf4c0', '76dadc023251f91e9643855157406d54dec128a195876e895b3bf88ed0bd8217', '9def2dae-0347-4381-964c-8612b5f586b2', 'active', '2026-08-18 17:40:23', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 17:40:23'),
('22cba9d1-5d0a-4231-a897-97b1c9382ba9', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 08:54:36.511022', NULL, '2026-08-27 09:44:12.952869', NULL, '75fd3eab-5fd0-4fb9-91e4-00db510f10b8', '4ebe0c4e4655fe4e304b3c216d8820ad2a02eaa56bb1cfd0781e7038859fc83e', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'rotated', '2026-08-27 09:44:12', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 08:54:36'),
('2882e553-bd2c-415d-8bd8-96fa5614acf5', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 09:20:18.579101', NULL, '2026-08-27 09:27:33.692686', NULL, '5ff46606-e220-42d7-bc4a-2a12e4af99e0', '63e26d31e17e94de7478eef5c8c5585d07e2dcbca5e5bbb80f4b045e8bdc1034', 'f7739e5d-6c14-4609-9dc9-d31b2370ed4c', 'rotated', '2026-08-27 09:27:33', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 09:20:18'),
('2b2ea33a-b2e8-41e7-82b2-4b6fd72ae901', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 09:18:43.344298', NULL, '2026-08-27 09:20:18.581512', NULL, 'd0a235d0-3604-4f9c-87b3-789922492af3', '06aa3b87105bab68939ea3158ea9db26a1914816038357c7173ec95a73975d25', 'f7739e5d-6c14-4609-9dc9-d31b2370ed4c', 'rotated', '2026-08-27 09:20:18', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 09:18:43'),
('3880b4ad-bdb2-47e9-b939-60f143fbd563', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 17:35:51.574761', NULL, NULL, NULL, '7550b48a-759c-4b31-a810-a7599a5ff273', '12d37f06e6f132cfae2726cce5cbcea13d6d4f4f82b32636b3ebb9591691d520', '2f1cff6b-13d7-4ca8-819b-6c10430a2b83', 'active', '2026-08-18 17:35:51', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 17:35:51'),
('389fe68f-a72d-4150-8b05-6cd7962d6cbb', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 09:44:12.951193', NULL, '2026-08-27 10:53:25.888316', NULL, '10ae93ae-69f8-4d14-ab76-20e758ce8159', 'c2e8593c95199b3716a055774f39c1b36630959967ed22c38e4f81dea75a5d68', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'rotated', '2026-08-27 10:53:25', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 09:44:12'),
('3a7641e6-4d06-4e27-bd48-84fe644ed3a9', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-08-31 20:34:39.582854', NULL, NULL, NULL, '2eec138b-89c1-4f65-b231-b7e8210c8615', 'cfb961c4652d1b3270e606ef6499c163010635751ed7881eecd20f88271858d6', '0b2f8ae1-151b-4b47-8fda-5cf90212042e', 'active', '2026-08-17 20:34:39', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-17 20:34:39'),
('43e9583d-2659-48dc-8cf5-ab86854b31f5', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 10:52:07.081400', NULL, NULL, NULL, '2fc3bc89-219b-4cf8-a360-ed3d67ec25ec', 'd5bfa2295779bae2e487594589a41a11208709eda10f60f7dfb61cb42011b556', '502a6246-2a80-4c97-a7dd-275c4432f7f2', 'active', '2026-08-18 10:52:07', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 10:52:07'),
('46230aba-17fe-429a-87c1-373a58186716', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 13:12:24.657662', NULL, NULL, NULL, '3d08f79e-b116-43b5-a288-7d62f261ef03', '7b5bd9cc3fdb4e3576f1b049bc83b0de03e203c5e9195898bc24547a81386e9d', 'aea2a11c-9d06-4447-8e80-a2b57b7b85c2', 'active', '2026-08-18 13:12:24', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 13:12:24'),
('503e185e-d096-4d02-85c7-a0f78cf318ca', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 06:51:56.646970', NULL, NULL, NULL, 'e4ebb7d5-a014-4df1-885f-7d3a9a8d27bd', '4f0393943891d19c50e86e97148f69222593d423bab606eca97f13118dfc2e02', '7eda0836-dca3-4d4c-ae9b-6db45da798d7', 'active', '2026-08-18 06:51:56', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 06:51:56'),
('563d645b-1588-47f1-987d-d4dacb7b4867', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 08:56:00.512275', NULL, '2026-08-27 08:58:50.869913', NULL, '4f623506-1849-47ae-a7a9-268d888b8b15', 'ab25c32544e4e0e19c7458d5ccd27b389a50f69867094ec5904363e19405bed9', 'f7739e5d-6c14-4609-9dc9-d31b2370ed4c', 'rotated', '2026-08-27 08:58:50', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 08:56:00'),
('57682662-5863-4a57-b833-bc4b8bdfa8a1', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 09:32:59.593089', NULL, NULL, NULL, '4631ffcb-a2a2-4040-b360-b3a48a7e27d6', 'f583d7b0b0097aead485fec5996529887813c6e7878accab3a7cd25686328c87', 'fafa9203-7dc2-4aad-8814-00836ca8f7ba', 'active', '2026-08-18 09:32:59', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 09:32:59'),
('5a003bbd-271e-464c-8ac9-65bd2b395bb5', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 14:02:04.001506', NULL, NULL, NULL, 'b4c7e126-354e-44dd-8731-5b1b25194523', '23f74b1fbb3f9402e3d72604bcabaa20fcc649566bfd2cf468106b7ee7d43aba', 'e25b6cac-a068-4edc-854c-221e3bb16c34', 'active', '2026-08-18 14:02:04', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 14:02:04'),
('5f8ef754-7b87-43e5-a79e-d81c05dcc9dc', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 10:52:21.869678', NULL, '2026-08-18 13:12:24.660109', NULL, 'c153a038-fb18-4d78-97cb-dbe6b31cc9ef', '4e5381b7b5c029375883c86012790b2acb451fb7803517104ee34ade0585d928', 'aea2a11c-9d06-4447-8e80-a2b57b7b85c2', 'rotated', '2026-08-18 13:12:24', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 10:52:21'),
('67e53338-1fc9-4e57-b266-40383a6cad34', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:15:19.881855', NULL, '2026-08-27 07:15:58.215070', NULL, '1b437778-5e74-4d38-9e96-b85c8e75c5df', 'd71345e9477647651ae4b61cf6770dc4f25d53056ef216ba352a1484ec5e747c', 'b2e5bbc9-7424-41b4-8ef6-1fbd0128e155', 'revoked', '2026-08-27 07:15:58', 'logout', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:15:19'),
('6c002f4f-0155-4b53-b050-de9a03240411', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 07:15:41.011589', NULL, '2026-08-27 07:43:33.657576', NULL, '81a97a60-e664-4389-9a1b-9ca105887287', '3723a438080966b3733612b340d0ccd9c9dc04d9db127611dab0482b7d49f504', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'rotated', '2026-08-27 07:43:33', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 07:15:41'),
('6dfb42c5-0edc-4152-8431-c15d3656f5cb', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 10:53:44.551822', NULL, '2026-08-27 11:03:51.826885', NULL, '372b96f1-72f5-41d0-8dea-c504dd4e234f', 'ac35787341dab048c6823dc75ab6d6631a3721b4c09eb813d219702e2c6dfb85', '5d48e5a6-c7c4-4b81-8cbb-1431477d9459', 'rotated', '2026-08-27 11:03:51', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 10:53:44'),
('714c4acb-e5eb-4b2e-86af-d4af5be3fd0a', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 08:55:35.893303', NULL, '2026-08-27 08:55:56.669072', NULL, '51a5768c-cf3f-4c10-8b6a-d8caa8aa8961', '0ad48fea34fa72aa3ad6535b8e2fafe386a22454fa50ec8784a32845a0e9e3fb', '265ac42a-74d1-40f9-b457-e6989a83e729', 'revoked', '2026-08-27 08:55:56', 'logout', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 08:55:35'),
('71a85787-ed8c-4fbf-9590-d2fe9231fc9c', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 08:20:41.726082', NULL, NULL, NULL, 'bc54e8f1-fab9-40b0-9098-ea831ca78081', '90f5ca0787b24ccd38de178779cdf658be38388bb62fad21741d8c35c95f62d6', 'cf52b895-d88d-4586-8d90-bfe2bcd6c093', 'active', '2026-08-18 08:20:41', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 08:20:41'),
('72aab6b9-bebd-425a-8f76-5443a67e2740', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-08-31 20:54:32.058563', NULL, NULL, NULL, 'c2e462db-f0fe-4fa9-a47d-a05e87674060', 'f4e7ae4b1a7ebd67e34938fc4e404972bc675bacf90ee258a27126abb4a11bf7', 'eeca43c8-a446-4343-9692-58497aeb0daa', 'active', '2026-08-17 20:54:32', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-17 20:54:32'),
('7fcf4cdf-d5dc-4f66-b116-7b1d38f9ab91', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:55:56.658222', NULL, '2026-08-27 07:58:07.644638', NULL, '30511963-e82d-4a17-9e4c-601bb35f7461', '8e462ba1c81427844601971d2cf1cfbb7248f0c791512a270a04c08ff6c96766', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 07:58:07', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:55:56'),
('80c65280-8180-4e0b-bd2c-a7f15c9b93cf', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 10:11:20.364239', NULL, '2026-08-18 10:35:11.454084', NULL, 'e630997c-dde3-434a-97a0-7ec6e020e681', '1923da9e12115e24fc42201495d0b9ac622f0b6ab1d2a42dbec442e6a148e596', 'e88c62df-c8e5-4444-b33b-893ca6529fd9', 'rotated', '2026-08-18 10:35:11', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 10:11:20'),
('84d4952e-0fe2-4439-9bbc-f4e6d3b575aa', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 14:22:03.255010', NULL, NULL, NULL, '1c47a328-3ca3-45aa-94ce-b794d9250c06', 'dc2d14b7223003b305f9da163209c5179d7cc949c61e3bcf75be6b61c28d22cb', '9240af89-f00d-42e6-ab40-739e99496e88', 'active', '2026-08-18 14:22:03', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 14:22:03'),
('88446415-b627-484e-aaa7-96249a1da5ee', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 13:18:03.843312', NULL, NULL, NULL, '9e78cd17-cc39-436b-98cd-d297744d65c6', '0c851c08f39e4cbc0a89ed5aada329f5f3d49fdbbe747a4036b4b945666f8166', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'active', '2026-08-27 13:18:03', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 13:18:03'),
('8fcf4050-e01d-4a18-a9a7-fa2d0c1c6295', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 08:53:33.339878', NULL, NULL, NULL, '2bdcc9bc-f130-4c50-a845-e2087271e1a9', 'd33d12839b707189a1685fed45dc2d5c8888b77426871345f1663e47b3521255', '4cfb6b18-dc95-4677-8d98-c4e98c1dad01', 'active', '2026-08-18 08:53:33', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 08:53:33'),
('90bd3cc9-2cc7-4c6f-9b42-bbf0150b807c', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 13:18:21.828116', NULL, NULL, NULL, '6e90f777-2c06-4371-816b-35694e71041b', '0d3be3bb397391256391d392a47807829b04744c5dbef32a5d7febd04e405422', 'a65b3659-b068-424c-b9e6-5694c2d1f5a7', 'active', '2026-08-27 13:18:21', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 13:18:21'),
('94d536b5-f6a0-4755-886b-94df751c0d98', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-10 11:30:41.920277', NULL, '2026-08-27 13:18:03.845696', NULL, 'fc7e5c51-3389-4f9d-905e-9071c6e707d5', 'e154cf9795cdd678d576bbdbb72f65e6dd1bc872c7c5b8b0f0ae8cd325aed0e7', 'f49757d6-23fa-413a-88d1-39f779f2c4da', 'rotated', '2026-08-27 13:18:03', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 11:30:41'),
('97491c2c-8920-462a-a7e2-ff5077c9455a', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 16:51:17.588616', NULL, NULL, NULL, '283a20e1-be80-49d8-af8b-3d93a4d2e612', 'dd07412208ddb9a60b3f4acb3035ce4123717a94418baef30b421d4554bd5d74', '8a4ac6fc-950f-4344-85e6-381ab4cff4de', 'active', '2026-08-18 16:51:17', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 16:51:17'),
('a4cb277d-7167-4fe2-9ac9-9498561d9ed4', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', NULL, '2026-09-01 16:22:59.208425', NULL, '2026-08-18 16:51:17.592466', NULL, 'e10c0582-63ec-440b-9f86-915b6dc32b74', '5f9eb4e3c793e1b42c1c4b60cf51989641332f9a8b2b442df626eff762fa645b', '8a4ac6fc-950f-4344-85e6-381ab4cff4de', 'rotated', '2026-08-18 16:51:17', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 16:22:59'),
('aaa7caed-b3a0-4c85-847a-ed05f13aca08', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 08:37:24.940899', NULL, NULL, NULL, 'b492a7fb-94a5-4eef-b6d7-f135712f2f80', '99b7074a1a14de9ebfa0294cd0116e867201a15f3b0cff200e02dcf6ce0c9aa4', 'e505a3b8-f258-4af4-8424-250b93d9be57', 'active', '2026-08-18 08:37:24', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 08:37:24'),
('b91b73c6-25d2-405c-af01-1b0b48566aa4', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 09:43:45.205882', NULL, NULL, NULL, 'aede852f-f33e-4b80-ac95-d50d3310f4a1', 'b69f2e7c36d10210f0b23fcae14be7fae6fd41f8b063b492878c4d9a0f398cbe', 'f7739e5d-6c14-4609-9dc9-d31b2370ed4c', 'active', '2026-08-27 09:43:45', NULL, 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 09:43:45'),
('bc28b9e4-eee2-41f4-a2d5-56968d248b12', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 08:03:26.011252', NULL, NULL, NULL, '0f5378ff-8d3b-4a4a-aed1-ba30bf346e5e', 'b7a4770b06566824b7ec77a7cc1124d444cac03bdf461222836edd2675672784', 'f075118c-74eb-4fce-917f-9c66304fc718', 'active', '2026-08-18 08:03:26', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 08:03:26'),
('bf651758-c586-4e48-9473-bb44577cd69f', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:16:46.050232', NULL, '2026-08-27 07:24:34.849390', NULL, 'ce5ca7f2-f6dc-4408-b725-0e8a4806253b', '99180c09cd61c2de751306d87f2ad38f2e05c2e9cd80a04846a4fc61901a249b', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 07:24:34', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:16:46'),
('c6992ea1-ea97-444b-bb1c-d7838a824ea0', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-08-31 20:34:57.372891', NULL, NULL, NULL, '9c1ef2c6-dbaa-4aad-9ee1-35bbc58616c8', 'c595348a6072eb2629b75bc00b82a9f8afaff8a9449f7490f9bf7d85aa94a9e8', '9d3c0040-6fcf-4702-a5f1-107d04a38e49', 'active', '2026-08-17 20:34:57', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-17 20:34:57'),
('c6cc7507-49c3-4df7-a507-33f5c42b3556', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:58:07.643339', NULL, '2026-08-27 08:01:00.958457', NULL, '8554a9ab-fd2e-4173-b5e6-74dad9342223', 'f0941f88bdb16c71055a3922ebdce0bb9e87dfbb4509b98317e1f62092eb4819', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 08:01:00', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:58:07'),
('ccd8048a-e896-4560-ad0c-6992bb604d74', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', NULL, '2026-09-01 17:38:55.934403', NULL, NULL, NULL, '8012a9ad-cb1f-49bf-9c8b-b0bde04571e9', '04389253d540ab955d923cf2b501b265a52e5c57fa7f0ffffe2a0f6f272bae5c', '15ecdaff-4ca5-4e7a-9493-c2a11f9db74a', 'active', '2026-08-18 17:38:55', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 17:38:55'),
('d632f84c-9249-4f45-b0e1-2fe66b02b2e8', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:31:03.640788', NULL, '2026-08-27 07:33:37.648834', NULL, 'f46d08be-2eea-4952-bc9d-20a4f1e2b988', 'f3ce862b6f1ffcf7c5bc3f6f19e39e8818d120f3b4e0eff23f62e8242fe114bc', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 07:33:37', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:31:03'),
('d8ba6a6f-45c4-4a97-988b-c3a1928f4592', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:33:37.647631', NULL, '2026-08-27 07:46:18.855081', NULL, 'b5649534-6198-4d90-b8bc-314678af54c3', 'd0ae990993788f77ceb24db191d443043552cec48af88fe01fb19f3fdd26df1e', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 07:46:18', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:33:37'),
('d9a5de7e-736c-47c2-b746-2c930edf9e26', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 11:03:51.825403', NULL, '2026-08-27 11:08:06.975633', NULL, '5a26a0de-4c66-43a4-a6e3-47383906064b', '7420187efa96c2ac3251833e73ce4670a4c6bc8a3cb00308c6c48ad41c7ac7d0', '5d48e5a6-c7c4-4b81-8cbb-1431477d9459', 'rotated', '2026-08-27 11:08:06', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 11:03:51'),
('db062fbe-04fe-4565-91f0-fc0b984b9120', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:14:57.547429', NULL, '2026-08-27 07:15:00.545786', NULL, '32f0c5bb-aba2-4343-8e6b-e5fadd6c2dd5', '987c3cd4b77beb6821ec0e17c40c405bf6a644cf39116cc1ad7af9a9b6ee3f1c', '1edfdae7-6a62-4002-b2ba-c62b63e146cd', 'revoked', '2026-08-27 07:15:00', 'logout', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:14:57'),
('dfa39073-2bc5-4fc2-a8ff-2600f5d62104', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 09:27:33.691622', NULL, '2026-08-27 09:43:45.207143', NULL, '2919346b-bbbd-4eca-a99e-5dee5f9150fc', '153487313699a83a1ec5285f6b5ca67604f8650d875c7548668a733251c53111', 'f7739e5d-6c14-4609-9dc9-d31b2370ed4c', 'rotated', '2026-08-27 09:43:45', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 09:27:33'),
('e04b1f6b-8296-4e7e-a67a-0b4b19381c28', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 14:55:54.007441', NULL, NULL, NULL, '65f74b8e-5105-4d32-a5d5-a171e0b39de9', 'a878b3c9320a75fba0b84356e3ad1c7174717757f4c2f5a134c8029ae52a2a9f', '463d1d58-fc4d-4ce0-8094-8014f5f389d5', 'active', '2026-08-18 14:55:54', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 14:55:54'),
('e22c4bb8-f247-43b5-9253-04a6d2905bff', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-08-31 20:13:15.242968', NULL, NULL, NULL, '2eaab993-710e-4651-b091-609048f7a985', 'e4cd43e748519a304fbc178c32abda0eedc407ddd6ccbb5a5256c2171557b196', 'a34ba675-ade4-4079-a35b-7ce214a5091d', 'active', '2026-08-17 20:13:15', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-17 20:13:15'),
('e317dca5-715e-47f5-a242-6ac84a589289', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 11:11:59.038048', NULL, NULL, NULL, 'f5470449-5c57-42f5-9d14-4bacb484143b', 'e7f858603743fda4108765f6aa9588f7eb96f7d8c7a0a66bd382f7dc59e35c6c', '5d48e5a6-c7c4-4b81-8cbb-1431477d9459', 'active', '2026-08-27 11:11:59', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-27 11:11:59'),
('e6c9c667-8b29-4561-ac20-b6b8a72c44fd', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 06:36:31.384686', NULL, NULL, NULL, 'e34dee61-40ae-4808-b98d-60bd1eff3b11', 'a452bddf2e18cf7955f6aca61a6d6d68b2107245f8bcedb8e7aeb39fa5711c18', '0a242998-2b84-4dd1-8b4e-f246b3d4d96f', 'active', '2026-08-18 06:36:31', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 06:36:31'),
('e7d85a44-93bd-4791-80fc-6d969deaddec', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 08:21:26.658805', NULL, '2026-08-27 08:55:35.895209', NULL, '75c31266-bc59-45eb-bf56-9dc283e42000', '8e528f8bfab39a4263e4dfe1ddcea14054a98d6933724be7009b0afe25e4f51a', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 08:55:35', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 08:21:26'),
('f1453e78-0d18-460f-8612-6fc24f49d978', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 14:37:35.545849', NULL, NULL, NULL, '7816332e-2f2a-4ca2-bd2a-94e5a4a3978c', '8dea45b1670d4739be1e212d17e0b9bc1dcc638f2d3f93b00c2a147f1d9648dc', '60ef13c3-c615-4012-a514-71315a125b26', 'active', '2026-08-18 14:37:35', NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 14:37:35'),
('f53660f5-4e2f-42cc-aa3b-eda5ab41b2a6', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:24:34.848072', NULL, '2026-08-27 07:31:03.642389', NULL, 'ada8f4a8-74fb-446e-90d5-c6885f0b2fa3', '45ff41c28f32105bcbe7a3cf0b04e4fd5debe54e2d096ab8ed3602908a7c171e', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 07:31:03', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:24:34'),
('f6caefc1-6b6a-4f46-aa91-c7577096af45', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 08:01:00.956939', NULL, '2026-08-27 08:21:26.659480', NULL, 'f15d602c-751b-452e-b119-8d4c2cd7e69d', 'f5804a4aa090b5502de74e6984bd3e954f52b3382cc4454f285dc582923598ed', '265ac42a-74d1-40f9-b457-e6989a83e729', 'rotated', '2026-08-27 08:21:26', 'rotation', 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 08:01:00'),
('f752580b-6594-40fc-bf11-3186f0e892ee', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'okhttp/5.1.0', NULL, '2026-09-10 07:13:57.419502', NULL, NULL, NULL, '48754c62-af20-4afd-977b-706b9e3fd34b', '021b8b974003a8c17e8058fcaedd12c9207be42385b04755381cb4f3eb5da6ed', '5440303a-4bb3-466f-b4ea-365a4a3580de', 'active', '2026-08-27 07:13:57', NULL, 'e3909c33b5581f03c2d42797d5116e975537bdf1cb2ac453bf47075bdc979c61', '2026-08-27 07:13:57'),
('fd6a0553-3d73-479f-8eb9-dbb76d53aced', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 10:36:19.693300', NULL, '2026-08-18 10:52:07.091144', NULL, '49c34332-c6b1-498d-8284-4342833b4c93', 'a41dc747af4a0e956c813484a0d696707247d1159e8158b05f5bdbd44fd09efb', '502a6246-2a80-4c97-a7dd-275c4432f7f2', 'rotated', '2026-08-18 10:52:07', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 10:36:19'),
('fdd21428-047f-4276-91fc-c22d75dd698a', '5277e730-1376-4890-b830-ea1ad1d4ab9f', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', NULL, '2026-09-01 07:40:33.601337', NULL, '2026-08-18 08:03:26.016863', NULL, 'aa9d029c-308e-4e02-a9ba-53f8c9cb6a87', '8ca228ba0f279c9ad21effcb26db8c640839c88fc8ac84210582dec4161b3bd0', 'f075118c-74eb-4fce-917f-9c66304fc718', 'rotated', '2026-08-18 08:03:26', 'rotation', '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', '2026-08-18 07:40:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_models`
--
ALTER TABLE `ai_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ai_models_model_key` (`model_key`);

--
-- Indexes for table `ai_usage_logs`
--
ALTER TABLE `ai_usage_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ai_usage_created` (`created_at`),
  ADD KEY `idx_ai_usage_model` (`model_id`),
  ADD KEY `idx_ai_usage_user` (`user_id`),
  ADD KEY `idx_ai_usage_operation` (`operation`),
  ADD KEY `idx_ai_usage_conversation` (`conversation_id`),
  ADD KEY `fk_ai_usage_msg` (`message_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_actor` (`actor_user_id`),
  ADD KEY `idx_audit_logs_event` (`event_name`),
  ADD KEY `idx_audit_logs_resource` (`resource_type`,`resource_id`),
  ADD KEY `idx_audit_logs_created_at` (`created_at`),
  ADD KEY `idx_audit_logs_request_id` (`request_id`);

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_auth_tokens_hash` (`token_hash`),
  ADD KEY `idx_auth_tokens_user_type` (`user_id`,`token_type`),
  ADD KEY `idx_auth_tokens_expires_at` (`expires_at`),
  ADD KEY `idx_auth_tokens_consumed_at` (`consumed_at`);

--
-- Indexes for table `background_jobs`
--
ALTER TABLE `background_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_background_jobs_celery` (`celery_task_id`),
  ADD KEY `idx_background_jobs_user` (`user_id`),
  ADD KEY `idx_background_jobs_state` (`state`),
  ADD KEY `idx_background_jobs_task` (`task_name`),
  ADD KEY `idx_background_jobs_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_background_jobs_queued_at` (`queued_at`);

--
-- Indexes for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_conversations_user` (`user_id`),
  ADD KEY `idx_chat_conversations_status` (`status`),
  ADD KEY `idx_chat_conversations_updated` (`updated_at`),
  ADD KEY `idx_chat_user_updated` (`user_id`,`updated_at`),
  ADD KEY `idx_chat_conversations_model` (`llm_model_id`);

--
-- Indexes for table `chat_feedbacks`
--
ALTER TABLE `chat_feedbacks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_chat_feedbacks_user_id` (`user_id`),
  ADD KEY `ix_chat_feedbacks_message_id` (`message_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_messages_conversation` (`conversation_id`,`created_at`),
  ADD KEY `idx_chat_messages_role` (`role`),
  ADD KEY `idx_chat_messages_model` (`model_id`),
  ADD KEY `idx_chat_messages_parent` (`parent_message_id`),
  ADD KEY `idx_chat_messages_status` (`message_status`);

--
-- Indexes for table `chat_message_feedback`
--
ALTER TABLE `chat_message_feedback`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_chat_feedback_user_message` (`message_id`,`user_id`),
  ADD KEY `idx_chat_feedback_rating` (`rating`),
  ADD KEY `idx_chat_feedback_user` (`user_id`);

--
-- Indexes for table `chat_sources`
--
ALTER TABLE `chat_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_chat_message_source` (`message_id`,`knowledge_chunk_id`),
  ADD KEY `idx_chat_source_message` (`message_id`),
  ADD KEY `idx_chat_source_chunk` (`knowledge_chunk_id`);

--
-- Indexes for table `consent_records`
--
ALTER TABLE `consent_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_consent_records_user_type` (`user_id`,`consent_type`),
  ADD KEY `idx_consent_records_recorded_at` (`recorded_at`);

--
-- Indexes for table `consultations`
--
ALTER TABLE `consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_consultations_user_scheduled` (`user_id`,`scheduled_at`),
  ADD KEY `idx_consultations_status` (`status`);

--
-- Indexes for table `conversation_summaries`
--
ALTER TABLE `conversation_summaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation_summary` (`conversation_id`,`created_at`),
  ADD KEY `idx_conversation_summary_model` (`model_id`),
  ADD KEY `fk_conv_summary_msg` (`summarized_until_message_id`);

--
-- Indexes for table `daily_health_summaries`
--
ALTER TABLE `daily_health_summaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_summary_date` (`user_id`,`summary_date`),
  ADD KEY `idx_dhs_summary_date` (`summary_date`);

--
-- Indexes for table `doctor_appointments`
--
ALTER TABLE `doctor_appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_doctor_appointments_user_id` (`user_id`);

--
-- Indexes for table `file_assets`
--
ALTER TABLE `file_assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_file_assets_storage_key` (`storage_key`),
  ADD KEY `idx_file_assets_user` (`user_id`),
  ADD KEY `idx_file_assets_sha256` (`sha256`),
  ADD KEY `idx_file_assets_deleted_at` (`deleted_at`);

--
-- Indexes for table `health_measurements`
--
ALTER TABLE `health_measurements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_health_measurements_user_metric` (`user_id`,`metric_type`,`measured_at`),
  ADD KEY `idx_health_measurements_measured_at` (`measured_at`),
  ADD KEY `idx_health_measurements_pregnancy` (`pregnancy_profile_id`);

--
-- Indexes for table `knowledge_chunks`
--
ALTER TABLE `knowledge_chunks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_document_chunk` (`document_id`,`chunk_index`),
  ADD KEY `idx_knowledge_chunk_document` (`document_id`),
  ADD KEY `idx_knowledge_chunk_embedding` (`embedding_reference`);

--
-- Indexes for table `knowledge_documents`
--
ALTER TABLE `knowledge_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_knowledge_doc_type` (`document_type`),
  ADD KEY `idx_knowledge_doc_active` (`is_active`),
  ADD KEY `idx_knowledge_doc_verified` (`is_verified`),
  ADD KEY `fk_knowledge_doc_verifier` (`verified_by`);

--
-- Indexes for table `llm_models`
--
ALTER TABLE `llm_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_llm_models_key` (`model_key`),
  ADD KEY `idx_llm_model_active` (`is_active`),
  ADD KEY `idx_llm_model_default` (`is_default`);

--
-- Indexes for table `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_medical_reports_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_medical_reports_file` (`file_id`),
  ADD KEY `idx_medical_reports_status` (`processing_status`),
  ADD KEY `idx_medical_reports_celery` (`celery_task_id`);

--
-- Indexes for table `model_versions`
--
ALTER TABLE `model_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_model_versions_key_ver` (`model_key`,`version`),
  ADD KEY `idx_model_versions_active` (`is_active`),
  ADD KEY `idx_model_versions_key` (`model_key`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_status` (`user_id`,`status`),
  ADD KEY `idx_notifications_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_notifications_dedupe` (`dedupe_key`),
  ADD KEY `idx_notifications_scheduled` (`scheduled_at`,`status`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `predictions`
--
ALTER TABLE `predictions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_predictions_user_id` (`user_id`);

--
-- Indexes for table `pregnancy_profiles`
--
ALTER TABLE `pregnancy_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pregnancy_user_current` (`user_id`,`is_current`),
  ADD KEY `idx_pregnancy_due_date` (`estimated_due_date`);

--
-- Indexes for table `prompt_templates`
--
ALTER TABLE `prompt_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_prompt_templates_key` (`prompt_key`),
  ADD KEY `idx_prompt_active` (`is_active`),
  ADD KEY `idx_prompt_type` (`prompt_type`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_reports_user_id` (`user_id`);

--
-- Indexes for table `report_extracted_values`
--
ALTER TABLE `report_extracted_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rev_report_id` (`report_id`),
  ADD KEY `idx_rev_metric_code` (`metric_code`),
  ADD KEY `idx_rev_report_metric` (`report_id`,`metric_code`);

--
-- Indexes for table `risk_assessments`
--
ALTER TABLE `risk_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_risk_assessments_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_risk_assessments_model` (`model_version_id`),
  ADD KEY `idx_risk_assessments_level` (`risk_level`),
  ADD KEY `idx_risk_assessments_pregnancy` (`pregnancy_profile_id`);

--
-- Indexes for table `risk_assessment_features`
--
ALTER TABLE `risk_assessment_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_raf_assessment_id` (`assessment_id`),
  ADD KEY `idx_raf_feature_name` (`feature_name`),
  ADD KEY `idx_raf_assessment_feature` (`assessment_id`,`feature_name`);

--
-- Indexes for table `security_events`
--
ALTER TABLE `security_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_security_events_user` (`user_id`),
  ADD KEY `idx_security_events_type_severity` (`event_type`,`severity`),
  ADD KEY `idx_security_events_occurred_at` (`occurred_at`),
  ADD KEY `idx_security_events_ip` (`ip_address`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD UNIQUE KEY `uq_users_legacy_auth_id` (`legacy_auth_id`),
  ADD KEY `idx_users_role_status` (`role`,`status`),
  ADD KEY `idx_users_created_at` (`created_at`),
  ADD KEY `idx_users_deleted_at` (`deleted_at`);

--
-- Indexes for table `user_ai_preferences`
--
ALTER TABLE `user_ai_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_ai_pref_user` (`user_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `idx_user_profiles_phone` (`phone`),
  ADD KEY `idx_user_profiles_avatar` (`avatar_file_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_user_sessions_token_hash` (`token_hash`),
  ADD KEY `idx_user_sessions_user_id` (`user_id`),
  ADD KEY `idx_user_sessions_expires_at` (`expires_at`),
  ADD KEY `idx_user_sessions_revoked_at` (`revoked_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Append-only audit row', AUTO_INCREMENT=151;

--
-- AUTO_INCREMENT for table `daily_health_summaries`
--
ALTER TABLE `daily_health_summaries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Summary row';

--
-- AUTO_INCREMENT for table `report_extracted_values`
--
ALTER TABLE `report_extracted_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Extracted value row';

--
-- AUTO_INCREMENT for table `risk_assessment_features`
--
ALTER TABLE `risk_assessment_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Efficient feature row key', AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `security_events`
--
ALTER TABLE `security_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Security event row';

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_usage_logs`
--
ALTER TABLE `ai_usage_logs`
  ADD CONSTRAINT `fk_ai_usage_conv` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ai_usage_model` FOREIGN KEY (`model_id`) REFERENCES `llm_models` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ai_usage_msg` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ai_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `fk_auth_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `background_jobs`
--
ALTER TABLE `background_jobs`
  ADD CONSTRAINT `fk_background_jobs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD CONSTRAINT `fk_chat_conversations_model` FOREIGN KEY (`llm_model_id`) REFERENCES `llm_models` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_conversations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_feedbacks`
--
ALTER TABLE `chat_feedbacks`
  ADD CONSTRAINT `fk_chat_feedbacks_message_id_chat_messages` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_chat_feedbacks_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_chat_messages_conv` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_messages_model` FOREIGN KEY (`model_id`) REFERENCES `llm_models` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_messages_parent` FOREIGN KEY (`parent_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `chat_message_feedback`
--
ALTER TABLE `chat_message_feedback`
  ADD CONSTRAINT `fk_chat_feedback_msg` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_sources`
--
ALTER TABLE `chat_sources`
  ADD CONSTRAINT `fk_chat_sources_chunk` FOREIGN KEY (`knowledge_chunk_id`) REFERENCES `knowledge_chunks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_sources_msg` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `consent_records`
--
ALTER TABLE `consent_records`
  ADD CONSTRAINT `fk_consent_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `fk_consultations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conversation_summaries`
--
ALTER TABLE `conversation_summaries`
  ADD CONSTRAINT `fk_conv_summary_conv` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conv_summary_model` FOREIGN KEY (`model_id`) REFERENCES `llm_models` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conv_summary_msg` FOREIGN KEY (`summarized_until_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `daily_health_summaries`
--
ALTER TABLE `daily_health_summaries`
  ADD CONSTRAINT `fk_dhs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctor_appointments`
--
ALTER TABLE `doctor_appointments`
  ADD CONSTRAINT `fk_doctor_appointments_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `file_assets`
--
ALTER TABLE `file_assets`
  ADD CONSTRAINT `fk_file_assets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `health_measurements`
--
ALTER TABLE `health_measurements`
  ADD CONSTRAINT `fk_health_measurements_pregnancy` FOREIGN KEY (`pregnancy_profile_id`) REFERENCES `pregnancy_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_health_measurements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `knowledge_chunks`
--
ALTER TABLE `knowledge_chunks`
  ADD CONSTRAINT `fk_knowledge_chunk_doc` FOREIGN KEY (`document_id`) REFERENCES `knowledge_documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `knowledge_documents`
--
ALTER TABLE `knowledge_documents`
  ADD CONSTRAINT `fk_knowledge_doc_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD CONSTRAINT `fk_medical_reports_file` FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_medical_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `fk_notif_prefs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `predictions`
--
ALTER TABLE `predictions`
  ADD CONSTRAINT `fk_predictions_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pregnancy_profiles`
--
ALTER TABLE `pregnancy_profiles`
  ADD CONSTRAINT `fk_pregnancy_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_reports_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report_extracted_values`
--
ALTER TABLE `report_extracted_values`
  ADD CONSTRAINT `fk_rev_report` FOREIGN KEY (`report_id`) REFERENCES `medical_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `risk_assessments`
--
ALTER TABLE `risk_assessments`
  ADD CONSTRAINT `fk_risk_assessments_model` FOREIGN KEY (`model_version_id`) REFERENCES `model_versions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_risk_assessments_pregnancy` FOREIGN KEY (`pregnancy_profile_id`) REFERENCES `pregnancy_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_risk_assessments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `risk_assessment_features`
--
ALTER TABLE `risk_assessment_features`
  ADD CONSTRAINT `fk_raf_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `risk_assessments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `security_events`
--
ALTER TABLE `security_events`
  ADD CONSTRAINT `fk_security_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_ai_preferences`
--
ALTER TABLE `user_ai_preferences`
  ADD CONSTRAINT `fk_user_ai_pref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
