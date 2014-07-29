DROP PROCEDURE IF EXISTS {{CIVIDB}}.`nyss_debug_log`;
/* don't need the delimiters when running through multi_query */
/* DELIMITER // */
CREATE DEFINER=CURRENT_USER() PROCEDURE {{CIVIDB}}.`nyss_debug_log`(IN `msg` TEXT)
	LANGUAGE SQL
	NOT DETERMINISTIC
	CONTAINS SQL
	SQL SECURITY DEFINER
	COMMENT ''
BEGIN
	IF @nyss_debug_flag IS NOT NULL THEN
		BEGIN
			SET @nyss_debug_function_thismsg = msg;
			IF IFNULL(@nyss_debug_function_thismsg,'') = '' THEN 
				SET @nyss_debug_function_thismsg='No Message Provided';
			END IF;
			SELECT COUNT(*) INTO @nyss_debug_function_table_count
				FROM information_schema.tables 
				WHERE table_schema = DATABASE() AND table_name = 'nyss_debug';
			IF IFNULL(@nyss_debug_function_table_count,0) < 1 THEN
				BEGIN
					DROP TABLE IF EXISTS nyss_debug;
				   CREATE TABLE nyss_debug (
						id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
						msg TEXT,
						ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);
				END;
			END IF;
			INSERT INTO nyss_debug (`msg`) VALUES (@nyss_debug_function_thismsg);
			SET @nyss_debug_function_thismsg = NULL;
			SET @nyss_debug_function_table_count = NULL;
		END;
	END IF;
END;
/* don't need the delimiters when running through multi_query */
/* //
DELIMITER ; */


CALL {{CIVIDB}}.nyss_debug_log('Begin install script');


/* create the summary table
   NOTE this table is created as a staging table initially to speed up the prepopulation routines
   This table will be altered at the end to drop any irrelevant columns */
DROP TABLE IF EXISTS {{CIVIDB}}.`nyss_changelog_summary`;
CREATE
   TABLE {{CIVIDB}}.`nyss_changelog_summary` (
      /* generated change sequence...will be fed back to seed the sequence table after all is done */
      `log_change_seq` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
      /* 5 fields to duplicate the original changelog grouping.  this yields a "changeset" */
      `log_date_extract` INT(10) NOT NULL,
      `log_conn_id` INT(11) NULL DEFAULT NULL,
      `log_user_id` INT(10) UNSIGNED DEFAULT NULL,
      `altered_contact_id` INT(10) UNSIGNED NOT NULL,
      `log_type_label` ENUM('Contact','Group','Tag','Activity','Relationship','Case','Note','Comment') COLLATE utf8_unicode_ci NOT NULL,
      /* the actual date, needed in the final summary table */
      `log_date` TIMESTAMP NOT NULL DEFAULT 0,
      /* the contrived action label, allows for special processing of group_contact (et al..?) */
      `log_action_label` ENUM('Insert','Update','Delete','Added','Removed') NOT NULL DEFAULT 'Update' COLLATE 'utf8_unicode_ci',
      /* points to the id of the entity being changed for this contact, i.e., log_id in detail */
      `log_entity_info` VARCHAR(255) NULL DEFAULT NULL,
      PRIMARY KEY (`log_change_seq`),
      /* actual index used for prepopulation */
      INDEX idx__changelog_summary__stage_index (`log_date_extract`,`log_conn_id`,`log_user_id`,`altered_contact_id`,`log_type_label`)
   )
ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CALL {{CIVIDB}}.nyss_debug_log('Dropped/created nyss_changelog_summary');

/* create the detail table and trigger (staging version)
   NOTE this table stages all 17 log tables into a single location
   As each row is inserted, the summary table is built using this data
*/
DROP TRIGGER IF EXISTS {{CIVIDB}}.`nyss_changelog_detail_before_insert`;
DROP TABLE IF EXISTS {{CIVIDB}}.`nyss_changelog_detail`;
CREATE
  TABLE {{CIVIDB}}.`nyss_changelog_detail` (
   `log_id` INT(10) UNSIGNED NOT NULL COMMENT 'original log table id being changed',
   `log_action` ENUM('Initialization','Insert','Update','Delete') COLLATE utf8_unicode_ci DEFAULT NULL,
   `action_column` ENUM('Insert','Update','Delete','Added','Removed') COLLATE utf8_unicode_ci DEFAULT NULL,
   `log_table_name` VARCHAR(64) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'the original log table name',
   `log_type` VARCHAR(64) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'generated by original insert/trigger',
   `log_type_label` VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT 'for arbitrary grouping in summary',
   `log_user_id` INT(10) UNSIGNED DEFAULT NULL COMMENT 'contact id for who changed the record',
   `log_date` TIMESTAMP NOT NULL DEFAULT 0,
   `log_date_extract` INT(10) NOT NULL,
   `log_conn_id` INT(11) NULL DEFAULT NULL COMMENT 'This field is obsolete, and will be removed after staging',
   `log_change_seq` BIGINT(20) NOT NULL DEFAULT 0 COMMENT 'unique-per-session value generated for each record',
   `altered_contact_id` INT(10) UNSIGNED NOT NULL COMMENT 'contact id for record being changed',
   `log_entity_info` VARCHAR(255) NULL DEFAULT NULL,
   /* staging index */
   INDEX `idx__changelog_staging__search_help` (`log_date_extract`,`log_conn_id`,`log_user_id`,`altered_contact_id`)
  )
ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/* don't need the delimiters when running through multi_query */
/* DELIMITER // */
CREATE
   DEFINER = CURRENT_USER
   TRIGGER {{CIVIDB}}.`nyss_changelog_detail_before_insert`
   BEFORE INSERT
   ON {{CIVIDB}}.`nyss_changelog_detail` FOR EACH ROW
   BEGIN
      /* calculate the action and type label */
      SET @this_log_action=NEW.`log_action`;
      SET NEW.`log_table_name` = LOWER(NEW.`log_table_name`);
      /* Calculate the log_type_label, used for grouping purposes */
      /* Also, calculate the log_action field if looking at a group_contact record */
      CASE NEW.`log_table_name`
         WHEN 'log_civicrm_email' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_phone' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_address' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_openid' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_im' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_website' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_value_constituent_information_1' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_value_district_information_7' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_value_contact_details_8' THEN SET NEW.`log_type_label`='Contact';
         WHEN 'log_civicrm_activity' THEN SET NEW.`log_type_label`='Activity';
         WHEN 'log_civicrm_activity_contact' THEN SET NEW.`log_type_label`='Activity';
         WHEN 'log_civicrm_value_activity_details_6' THEN SET NEW.`log_type_label`='Activity';
         WHEN 'log_civicrm_note' THEN
           BEGIN
             IF NEW.log_type='Comment' THEN SET NEW.`log_type_label`='Comment'; 
             ELSE SET NEW.`log_type_label`='Note'; END IF;
           END;
         WHEN 'log_civicrm_group_contact' THEN
            BEGIN
               SET NEW.`log_type_label`='Group';
               /* "delete"=old action (no change), "update"=status column, "insert"="Added" */
               IF NEW.`log_action` = 'Update' THEN
                  SET @this_log_action = NEW.`action_column`;
               ELSEIF NEW.`log_action` = 'Insert' THEN
                  SET @this_log_action = 'Added';
               END IF;
            END;
         ELSE
            BEGIN
               SET @rev_type = REVERSE(NEW.`log_table_name`);
               SET NEW.`log_type_label`=REVERSE(SUBSTR(@rev_type,1,LOCATE('_',@rev_type)-1));
            END;
      END CASE;
      /* Capitalize first letter of the type label for consistency */
      SET NEW.`log_type_label` = CONCAT(UCASE(LEFT(NEW.`log_type_label`,1)),
                                        SUBSTR(NEW.`log_type_label`,2));
      /* Calculate the log_date_extract field, used for grouping purposes */
      SET NEW.`log_date_extract`=DATE_FORMAT(NEW.`log_date`, '%Y%m%d%H');
      /* Initialize the change_seq identifier */
      SET @this_change_seq=NULL;
      /* Check to see if a change_seq exists for this unique grouping */
      IF NEW.`log_type_label`='Contact' THEN
        BEGIN
          SELECT `log_change_seq`
             INTO @this_change_seq
             FROM {{CIVIDB}}.`nyss_changelog_summary`
             WHERE
                `log_date_extract`=NEW.`log_date_extract`
                AND `log_conn_id`=NEW.`log_conn_id`
                AND IFNULL(`log_user_id`,-1)=IFNULL(NEW.`log_user_id`-1)
                AND `altered_contact_id`=NEW.`altered_contact_id`
                AND `log_type_label`=NEW.`log_type_label`;
         END;
      END IF;
      /* check if this grouping already has a change sequence */
      IF @this_change_seq IS NULL THEN
         /* If it doesn't, insert a new summary row and set the change sequence */
         BEGIN
            INSERT INTO {{CIVIDB}}.`nyss_changelog_summary`
               (`log_date_extract`, `log_conn_id`, `log_user_id`, `altered_contact_id`,
                `log_type_label`, `log_date`, `log_action_label`, `log_entity_info`)
               VALUES
               (NEW.`log_date_extract`, NEW.`log_conn_id`, NEW.`log_user_id`, NEW.`altered_contact_id`,
                NEW.`log_type_label`, NEW.`log_date`, @this_log_action, NEW.`log_entity_info`);
            SET @this_change_seq = LAST_INSERT_ID();
         END;
      ELSE
         /* if it does, this changeset includes multiple changes...the label should be 'Update' */
         BEGIN
            UPDATE {{CIVIDB}}.`nyss_changelog_summary`
               SET `log_action_label`='Update'
               WHERE `log_change_seq`=@this_change_seq;
         END;
      END IF;
      /* set the change sequence for this detail row */
      SET NEW.`log_change_seq` = @this_change_seq;
   END;
/* //
DELIMITER ;  */

CALL {{CIVIDB}}.nyss_debug_log('Dropped/created nyss_changelog_detail and staging trigger');
/* create the dated lookup table for entity information */

/* for group */
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_group;
CREATE TEMPORARY TABLE {{LOGDB}}.nyss_temp_staging_group (
  	id INT(10) UNSIGNED NOT NULL,
  	title VARCHAR(64) NULL DEFAULT NULL,
  	log_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  	log_end_date TIMESTAMP NULL DEFAULT NULL,
  	INDEX `idx__staging_date` (`log_date`,`log_end_date`),
  	INDEX `idx__staging_id` (`id`)
	)
	SELECT 
	  a.id,a.title,a.log_date,
	  IFNULL((SELECT DATE_SUB(b.log_date,INTERVAL 1 SECOND) from {{LOGDB}}.log_civicrm_group b
	WHERE b.log_date > a.log_date and a.id=b.id
	ORDER BY b.log_date LIMIT 1),NOW()) as log_end_date
	FROM {{LOGDB}}.log_civicrm_group a
	GROUP BY a.id,a.log_date,a.log_conn_id,a.log_user_id;

CALL {{CIVIDB}}.nyss_debug_log('Created nyss_temp_staging_group');


/* for tag */
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_tag;
CREATE TEMPORARY TABLE {{LOGDB}}.nyss_temp_staging_tag (
	id INT(10) UNSIGNED NOT NULL,
	name VARCHAR(64) NULL DEFAULT NULL,
	log_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	log_end_date TIMESTAMP NULL DEFAULT NULL,
	INDEX `idx__staging_date` (`log_date`,`log_end_date`),
	INDEX `idx__staging_id` (`id`)
	)
	SELECT a.id,a.name,a.log_date,
	IFNULL((SELECT DATE_SUB(b.log_date,INTERVAL 1 SECOND) from {{LOGDB}}.log_civicrm_tag b
	WHERE b.log_date > a.log_date and a.id=b.id
	ORDER BY b.log_date LIMIT 1),NOW()) as log_end_date
	FROM {{LOGDB}}.log_civicrm_tag a;

CALL {{CIVIDB}}.nyss_debug_log('Created nyss_temp_staging_tag');


/* for relationship type */
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_relationship;
CREATE TEMPORARY TABLE {{LOGDB}}.nyss_temp_staging_relationship (
	id INT(10) UNSIGNED NOT NULL,
	label_a_b VARCHAR(64) NULL DEFAULT NULL,
	log_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	log_end_date TIMESTAMP NULL DEFAULT NULL,
	INDEX `idx__staging_date` (`log_date`,`log_end_date`),
	INDEX `idx__staging_id` (`id`)
	)
	SELECT a.id,a.label_a_b,a.log_date,
	IFNULL((SELECT DATE_SUB(b.log_date,INTERVAL 1 SECOND) from {{LOGDB}}.log_civicrm_relationship_type b
	WHERE b.log_date > a.log_date and a.id=b.id
	ORDER BY b.log_date LIMIT 1),NOW()) as log_end_date
	FROM {{LOGDB}}.log_civicrm_relationship_type a;

CALL {{CIVIDB}}.nyss_debug_log('Created nyss_temp_staging_relationship');


/* for activity */
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_activity;
CREATE TEMPORARY TABLE {{LOGDB}}.nyss_temp_staging_activity (
	id INT(10) UNSIGNED NOT NULL,
	label VARCHAR(255) NOT NULL,
	log_action ENUM('Initialization','Insert','Update','Delete'),
	log_user_id INT(11) NULL DEFAULT NULL,
	log_conn_id INT(11) NULL DEFAULT NULL,
	log_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	log_end_date TIMESTAMP NULL DEFAULT NULL,
	INDEX `idx__staging_date` (`log_date`,`log_end_date`),
	INDEX `idx__staging_id` (`id`)
	)
	SELECT a.id, IFNULL(d.label,'NO LABEL'), a.log_action, a.log_user_id, a.log_conn_id, a.log_date,
	IFNULL((SELECT DATE_SUB(b.log_date,INTERVAL 1 SECOND) from {{LOGDB}}.log_civicrm_activity b
	WHERE b.log_date > a.log_date and a.id=b.id
	ORDER BY b.log_date LIMIT 1),NOW()) as log_end_date
	FROM {{LOGDB}}.log_civicrm_activity a
		inner join 
		({{CIVIDB}}.civicrm_option_group c INNER JOIN
		 {{CIVIDB}}.civicrm_option_value d ON c.name='activity_type' AND c.id=d.option_group_id)
		ON a.activity_type_id=d.value
	WHERE a.log_action != 'Initialization';
		
CALL {{CIVIDB}}.nyss_debug_log('Created nyss_temp_staging_activity');


/* for case */
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_case;
CREATE TEMPORARY TABLE {{LOGDB}}.nyss_temp_staging_case (
	id INT(10) UNSIGNED NOT NULL,
	label VARCHAR(255) NOT NULL,
	log_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	log_end_date TIMESTAMP NULL DEFAULT NULL,
	INDEX `idx__staging_date` (`log_date`,`log_end_date`),
	INDEX `idx__staging_id` (`id`)
	)
	SELECT a.id, d.label, a.log_date,
	IFNULL((SELECT DATE_SUB(b.log_date,INTERVAL 1 SECOND) from {{LOGDB}}.log_civicrm_case b
	WHERE b.log_date > a.log_date and a.id=b.id
	ORDER BY b.log_date LIMIT 1),NOW()) as log_end_date
	FROM {{LOGDB}}.log_civicrm_case a
		inner join 
		({{CIVIDB}}.civicrm_option_group c INNER JOIN
		 {{CIVIDB}}.civicrm_option_value d ON c.name='case_type' AND c.id=d.option_group_id)
		ON a.case_type_id=d.value;

CALL {{CIVIDB}}.nyss_debug_log('Created nyss_temp_staging_case');


CALL {{CIVIDB}}.nyss_debug_log('Done with temp staging.  Begin detail population');

/* prepopulate the staging table with existing records (17 queries) */
/* ---------------------------- begin prepopulation queries ---------------------------- */
INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
   `id`, `log_action`, `log_action`, 'log_civicrm_contact', 'log_civicrm_contact',
   `log_user_id`, `log_date`, `id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_contact`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated contact');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
   `id`, `log_action`, `log_action`, 'log_civicrm_email', 'log_civicrm_email',
   `log_user_id`, `log_date`, `contact_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_email`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated email');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
   `id`, `log_action`, `log_action`, 'log_civicrm_phone', 'log_civicrm_phone',
   `log_user_id`, `log_date`, `contact_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_phone`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated phone');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
   `id`, `log_action`, `log_action`, 'log_civicrm_address', 'log_civicrm_address',
   `log_user_id`, `log_date`, `contact_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_address`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated address');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`, `log_entity_info`)
   SELECT
     `id`, `log_action`, `log_action`, 'log_civicrm_note', 'log_civicrm_note',
     `log_user_id`, `log_date`, `entity_id`, `log_conn_id`, `subject`
   FROM {{LOGDB}}.`log_civicrm_note`
   WHERE (`log_action` != 'Initialization') AND `entity_table` = 'civicrm_contact';

CALL {{CIVIDB}}.nyss_debug_log('Populated note');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`,`log_entity_info`)
   SELECT
     a.`id`, a.`log_action`, a.`log_action`, 'log_civicrm_note', 'log_civicrm_note_comment',
     a.`log_user_id`, a.`log_date`, b_alias.`entity_id`, a.`log_conn_id`, a.`subject`
   FROM {{LOGDB}}.`log_civicrm_note` a
     INNER JOIN
     (SELECT DISTINCT b.`id`, b.`entity_id` FROM {{CIVIDB}}.`civicrm_note` b
      WHERE b.`entity_table`='civicrm_contact') b_alias
      ON a.`entity_id` = b_alias.`id` 
   WHERE (a.`log_action` != 'Initialization') AND a.`entity_table` = 'civicrm_note';

CALL {{CIVIDB}}.nyss_debug_log('Populated comment');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`,`log_entity_info`)
   SELECT
   a.`id`, a.`log_action`, a.`status`, 'log_civicrm_group_contact', 'log_civicrm_group_contact',
   a.`log_user_id`, a.`log_date`, a.`contact_id`, a.`log_conn_id`, b.`title`
   FROM {{LOGDB}}.`log_civicrm_group_contact` a LEFT JOIN
        {{LOGDB}}.`nyss_temp_staging_group` b
         ON a.`group_id`=b.`id` AND a.`log_date` BETWEEN b.`log_date` AND b.`log_end_date`
   WHERE (a.`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated group_contact');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`, `log_entity_info`)
   SELECT
   a.`id`, a.`log_action`, a.`log_action`, 'log_civicrm_entity_tag', 'log_civicrm_entity_tag',
   a.`log_user_id`, a.`log_date`, a.`entity_id`, a.`log_conn_id`, b.`name`
   FROM {{LOGDB}}.`log_civicrm_entity_tag` a
        LEFT JOIN {{LOGDB}}.`nyss_temp_staging_tag` b
        ON a.`tag_id`=b.`id` AND a.`log_date` BETWEEN b.`log_date` AND b.`log_end_date`
   WHERE (a.`log_action` != 'Initialization') AND (a.`entity_table` = 'civicrm_contact');

CALL {{CIVIDB}}.nyss_debug_log('Populated tag');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`, `log_entity_info`)
   SELECT
   a.`id`, a.`log_action`, a.`log_action`, 'log_civicrm_relationship', 'log_civicrm_relationship',
   a.`log_user_id`, a.`log_date`, a.`contact_id_a`, a.`log_conn_id`, b.`label_a_b`
   FROM {{LOGDB}}.`log_civicrm_relationship` a
        LEFT JOIN {{LOGDB}}.`nyss_temp_staging_relationship` b
        ON a.`relationship_type_id`=b.`id` AND a.`log_date` BETWEEN b.`log_date` AND b.`log_end_date`
   WHERE (a.`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated relationship');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`, `log_entity_info`)
  SELECT 
  	a.`id`, a.`log_action`, a.`log_action`, 'log_civicrm_activity',
  	CONCAT('log_civicrm_activity_for_',
  			CASE b.`record_type_id` 
  			  WHEN 1 THEN 'target' 
  			  WHEN 2 THEN 'source' 
  			  WHEN 3 THEN 'assignee' 
  			  ELSE 'unknown' 
  			END
  	  ) as group_field,
  	a.`log_user_id`, a.`log_date`, b.`contact_id`, a.`log_conn_id`, a.`label`
  FROM
  	{{LOGDB}}.`nyss_temp_staging_activity` a INNER JOIN {{LOGDB}}.`log_civicrm_activity_contact` b 
  		ON a.`id`=b.`activity_id`
  WHERE
  	a.`log_action` != 'Initialization' AND 
  	b.`log_date` BETWEEN a.`log_date` AND a.`log_end_date`;
	
CALL {{CIVIDB}}.nyss_debug_log('Populated activity');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`, `log_entity_info`)
   SELECT a.`id`, a.`log_action`, a.`log_action`, 'log_civicrm_case', 'log_civicrm_case',
   a.`log_user_id`, a.`log_date`, b.`contact_id`, a.`log_conn_id`, c.`label`
   FROM
      {{LOGDB}}.`log_civicrm_case` a
         INNER JOIN {{LOGDB}}.`log_civicrm_case_contact` b
            ON a.`id`=b.`case_id`
         LEFT JOIN {{LOGDB}}.`nyss_temp_staging_case` c
            ON a.`id`=c.`id` AND a.`log_date` BETWEEN c.`log_date` AND c.`log_end_date`
   WHERE (a.`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated case');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
     `id`,
      `log_action`, `log_action`,
      'log_civicrm_value_constituent_information_1', 'log_civicrm_value_constituent_information_1',
      `log_user_id`,
      `log_date`, `entity_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_value_constituent_information_1`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated constituent_information');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
     `id`,
      `log_action`, `log_action`,
      'log_civicrm_value_organization_constituent_informa_3', 'log_civicrm_value_organization_constituent_informa_3',
      `log_user_id`,
      `log_date`, `entity_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_value_organization_constituent_informa_3`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated organization_constituent_information');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
     `id`,
      `log_action`, `log_action`,
      'log_civicrm_value_attachments_5', 'log_civicrm_value_attachments_5',
      `log_user_id`,
      `log_date`, `entity_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_value_attachments_5`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated attachments');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
     `id`,
      `log_action`, `log_action`,
      'log_civicrm_value_contact_details_8', 'log_civicrm_value_contact_details_8',
      `log_user_id`,
      `log_date`, `entity_id`, `log_conn_id`
   FROM {{LOGDB}}.`log_civicrm_value_contact_details_8`
   WHERE (`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated contact_details');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
   SELECT
     a.`id`,
      a.`log_action`, a.`log_action`,
      'log_civicrm_value_district_information_7', 'log_civicrm_value_district_information_7',
      a.`log_user_id`,
      a.`log_date`,
      b.`contact_id`, a.`log_conn_id`
   FROM
      {{LOGDB}}.`log_civicrm_value_district_information_7` a
         INNER JOIN {{LOGDB}}.`log_civicrm_address` b
            ON a.`entity_id`=b.`id`
   WHERE (a.`log_action` != 'Initialization');

CALL {{CIVIDB}}.nyss_debug_log('Populated district_information');

INSERT IGNORE INTO {{CIVIDB}}.`nyss_changelog_detail`
  (`log_id`,`log_action`,`action_column`,`log_table_name`,`log_type`,
   `log_user_id`, `log_date`,`altered_contact_id`, `log_conn_id`)
  SELECT
       a.`id`, a.`log_action`, a.`log_action`, 'log_civicrm_value_activity_details_6',
        CONCAT('log_civicrm_value_activity_details_6_for_',
           CASE b.`record_type_id`
              WHEN 1 THEN 'target'
              WHEN 2 THEN 'source'
              WHEN 3 THEN 'assignee'
              ELSE 'unknown'
              END
           ) as group_field,
        a.`log_user_id`, a.`log_date`, b.`contact_id`, a.`log_conn_id`
     FROM
        {{LOGDB}}.`log_civicrm_value_activity_details_6` a INNER JOIN {{LOGDB}}.`log_civicrm_activity_contact` b
           ON a.`id`=b.`activity_id` AND b.`record_type_id` IN (1,2,3) AND a.log_conn_id=b.log_conn_id
         LEFT JOIN {{LOGDB}}.`nyss_temp_staging_activity` c
         ON a.`id`=c.`id` AND a.`log_date` BETWEEN c.`log_date` AND c.`log_end_date`
     WHERE (a.`log_action` != 'Initialization')
  GROUP BY a.log_date, group_field;

CALL {{CIVIDB}}.nyss_debug_log('Populated activity_details');
/* ---------------------------- end prepopulation queries ---------------------------- */

CALL {{CIVIDB}}.nyss_debug_log('Done with prepopulation, begin clean-up');

/* Get the current maximum seed */
SELECT IFNULL(MAX(`log_change_seq`),0) INTO @max_stage_seed FROM {{CIVIDB}}.`nyss_changelog_summary`;

/* Create the sequence table and seed it */
DROP TABLE IF EXISTS {{CIVIDB}}.`nyss_changelog_sequence`;
CREATE TABLE {{CIVIDB}}.`nyss_changelog_sequence` (
  `seq` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
INSERT INTO {{CIVIDB}}.`nyss_changelog_sequence` (`seq`) VALUES (@max_stage_seed + 1);

CALL {{CIVIDB}}.nyss_debug_log('nyss_changelog_sequence initialized');

/* Create the sequence generator function */
DROP FUNCTION IF EXISTS {{CIVIDB}}.`nyss_fnGetChangelogSequence`;
/* DELIMITER //  */
CREATE DEFINER=CURRENT_USER FUNCTION {{CIVIDB}}.`nyss_fnGetChangelogSequence`()
   RETURNS bigint(20)
   LANGUAGE SQL
   NOT DETERMINISTIC
   CONTAINS SQL
   SQL SECURITY DEFINER
   COMMENT ''
   BEGIN
      IF @nyss_changelog_sequence IS NULL THEN
         BEGIN
            SELECT `seq` INTO @nyss_changelog_sequence FROM {{CIVIDB}}.`nyss_changelog_sequence` ORDER BY `seq` DESC LIMIT 1;
            UPDATE {{CIVIDB}}.`nyss_changelog_sequence` SET `seq`=`seq`+1;
         END;
      END IF;
      RETURN @nyss_changelog_sequence;
   END;
/* //
DELIMITER ;  */

CALL {{CIVIDB}}.nyss_debug_log('Sequence function created');

/* Alter the summary table to reflect the proper structure, not staging */
ALTER TABLE {{CIVIDB}}.`nyss_changelog_summary`
   DROP INDEX `idx__changelog_summary__stage_index`,
   CHANGE `log_change_seq` `log_change_seq` BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
   CHANGE `log_date` `log_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   DROP `log_date_extract`,
   ADD INDEX idx__changelog_summary__user_id (`log_user_id`),
   ADD INDEX idx__changelog_summary__altered_id (`altered_contact_id`);
   
DROP TRIGGER IF EXISTS {{CIVIDB}}.`nyss_changelog_summary_before_insert`;

/* DELIMITER //  */
CREATE
   DEFINER = CURRENT_USER
   TRIGGER {{CIVIDB}}.`nyss_changelog_summary_before_insert`
   BEFORE INSERT
   ON {{CIVIDB}}.`nyss_changelog_summary` FOR EACH ROW
   BEGIN
      IF NEW.`log_user_id` IS NULL THEN
        SET NEW.`log_user_id` = @civicrm_user_id;
      END IF;
    SET NEW.`log_change_seq`=nyss_fnGetChangelogSequence();
   END;
/* //
DELIMITER ;  */

CALL {{CIVIDB}}.nyss_debug_log('Altered changelog_summary and trigger');


/* Alter the detail table to reflect the proper structure, not staging 
   Leaving in the connection id to support Reverter & Differ objects */
ALTER TABLE {{CIVIDB}}.`nyss_changelog_detail`
   DROP `action_column`,
   DROP `log_type_label`,
   DROP `log_user_id`,
   DROP `log_date`,
   DROP `log_date_extract`,
   DROP `altered_contact_id`,
   DROP INDEX `idx__changelog_staging__search_help`,
   ADD INDEX `idx__changelog_detail__change_seq` (`log_change_seq`);
   
   
/* Recreate the detail table trigger */
DROP TRIGGER IF EXISTS {{CIVIDB}}.`nyss_changelog_detail_before_insert`;
/* DELIMITER //  */
CREATE
   DEFINER = CURRENT_USER
   TRIGGER {{CIVIDB}}.`nyss_changelog_detail_before_insert`
   BEFORE INSERT
   ON {{CIVIDB}}.`nyss_changelog_detail` FOR EACH ROW
   BEGIN
      /* **** IMPORTANT
       This trigger expects to receive the altered_contact_id in place of
       the log_change_seq field.  The change_seq is generated from a session
       variable, and does not need to be passed in the original insert.  On
       the other hand, the summary table needs the altered_contact_id, but
       the detail has no where to store it.  The log_change_seq field is used
       as a temporary delivery mechanism.  Sloppy, but it works. */
      /* retrieve the altered_contact_id from the changeset field */
      SET @this_altered_contact_id=NEW.`log_change_seq`;
      SET @this_log_action=NEW.`log_action`;
      SET @this_log_type_label='';
      /* Calculate the log_type_label, used for grouping purposes */
      /* Also, calculate the log_action field if looking at a group_contact record */
      CASE NEW.`log_table_name`
         WHEN 'log_civicrm_email' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_phone' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_address' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_openid' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_im' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_website' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_value_constituent_information_1' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_value_organization_constituent_informa_3' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_value_attachments_5' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_value_district_information_7' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_value_contact_details_8' THEN SET @this_log_type_label='Contact';
         WHEN 'log_civicrm_activity_contact' THEN SET @this_log_type_label='Activity';
         WHEN 'log_civicrm_value_activity_details_6' THEN SET @this_log_type_label='Activity';
         WHEN 'log_civicrm_case_contact' THEN SET @this_log_type_label='Case'; 
         WHEN 'log_civicrm_note' THEN
           BEGIN
             IF NEW.log_type='Comment' THEN SET @this_log_type_label='Comment'; 
             ELSE SET @this_log_type_label='Note'; END IF;
           END;
         WHEN 'log_civicrm_group_contact' THEN
            BEGIN
               SET @this_log_type_label='Group';
               /* "delete"=old action (no change), "update"=status column, "insert"="Added" */
               IF NEW.`log_action` = 'Update' THEN
                  SET @this_log_action = 'Update';
               ELSEIF NEW.`log_action` = 'Insert' THEN
                  SET @this_log_action = 'Added';
               END IF;
            END;
         ELSE
            BEGIN
               SET @rev_type = REVERSE(NEW.`log_table_name`);
               SET @this_log_type_label=REVERSE(SUBSTR(@rev_type,1,LOCATE('_',@rev_type)-1));
            END;
      END CASE;
      /* Capitalize first letter of the type label for consistency */
      SET @this_log_type_label = CONCAT(UCASE(LEFT(@this_log_type_label,1)),
                                        SUBSTR(@this_log_type_label,2));
      /* check if this grouping already has a change sequence */
      IF @this_log_type_label = 'Activity' THEN 
        BEGIN 
          SET @nyss_changelog_sequence = NULL; 
          SELECT `log_change_seq` 
            INTO @nyss_changelog_sequence 
            FROM `nyss_changelog_summary` 
            WHERE 
              altered_contact_id=@this_altered_contact_id  
              AND log_conn_id = CONNECTION_ID() 
              AND log_type_label = 'Activity' 
            ORDER BY log_change_seq DESC LIMIT 1; 
        END; 
      ELSEIF @this_log_type_label <> 'Contact' THEN  
        BEGIN  
          SET @nyss_changelog_sequence = NULL;  
        END;  
      END IF; 
      
      IF @nyss_changelog_sequence IS NULL THEN
         /* If it doesn't, insert a new summary row and set the change sequence */
         BEGIN
            INSERT INTO {{CIVIDB}}.`nyss_changelog_summary`
               (`log_action_label`,`log_type_label`,`altered_contact_id`,`log_conn_id`,`log_entity_info`)
               VALUES
               (@this_log_action, @this_log_type_label, @this_altered_contact_id, CONNECTION_ID(),NEW.`log_entity_info`);
         END;
      ELSE
         /* if it does, this changeset includes multiple changes...the label should be 'Update' */
         BEGIN
            UPDATE {{CIVIDB}}.`nyss_changelog_summary`
               SET `log_action_label`='Update'
               WHERE `log_change_seq`=@nyss_changelog_sequence;
         END;
      END IF;
      /* set the change sequence for this detail row */
      SET NEW.`log_change_seq` = @nyss_changelog_sequence;
   END;
/* //
DELIMITER ;  */

CALL {{CIVIDB}}.nyss_debug_log('Altered changelog_detail and trigger');
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_group;
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_tag;
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_relationship;
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_activity;
DROP TEMPORARY TABLE IF EXISTS {{LOGDB}}.nyss_temp_staging_case;

CALL {{CIVIDB}}.nyss_debug_log('Dropped all temporary staging tables');
CALL {{CIVIDB}}.nyss_debug_log('Completed Install Script');
