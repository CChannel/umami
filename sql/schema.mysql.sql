-- CreateTable
CREATE TABLE `account` (
    `user_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`user_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event` (
    `event_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `session_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `url` VARCHAR(500) NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `event_value` VARCHAR(50) NOT NULL,
    INDEX `event_created_at_idx`(`created_at`),
    INDEX `event_session_id_idx`(`session_id`),
    INDEX `event_website_id_idx`(`website_id`),
    PRIMARY KEY (`event_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pageview` (
    `view_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `session_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `url` VARCHAR(500) NOT NULL,
    `referrer` VARCHAR(500) NULL,
    INDEX `pageview_created_at_idx`(`created_at`),
    INDEX `pageview_session_id_idx`(`session_id`),
    INDEX `pageview_website_id_created_at_idx`(`website_id`, `created_at`),
    INDEX `pageview_website_id_idx`(`website_id`),
    INDEX `pageview_website_id_session_id_created_at_idx`(`website_id`, `session_id`, `created_at`),
    PRIMARY KEY (`view_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `session_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `session_uuid` VARCHAR(36) NOT NULL,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `hostname` VARCHAR(100) NULL,
    `browser` VARCHAR(20) NULL,
    `os` VARCHAR(20) NULL,
    `device` VARCHAR(20) NULL,
    `screen` VARCHAR(11) NULL,
    `language` VARCHAR(35) NULL,
    `country` CHAR(2) NULL,
    `ip` VARCHAR(255) NULL,
    `user_agent` TEXT NULL,
    UNIQUE INDEX `session_uuid`(`session_uuid`),
    INDEX `session_created_at_idx`(`created_at`),
    INDEX `session_website_id_idx`(`website_id`),
    PRIMARY KEY (`session_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website` (
    `website_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_uuid` VARCHAR(36) NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `domain` VARCHAR(500) NULL,
    `share_id` VARCHAR(64) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    UNIQUE INDEX `website_uuid`(`website_uuid`),
    UNIQUE INDEX `share_id`(`share_id`),
    INDEX `website_user_id_idx`(`user_id`),
    PRIMARY KEY (`website_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateAdminUser
INSERT INTO
    account (username, password, is_admin)
values
    (
        'admin',
        '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa',
        true
    );