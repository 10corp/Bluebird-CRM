TRUNCATE TABLE rules_config;
TRUNCATE TABLE rules_dependencies;
TRUNCATE TABLE rules_trigger;

INSERT INTO rules_config (id, name, label, plugin, active, weight, status, module, data, dirty, access_exposed) VALUES
(1, 'rules_notify_creator_of_approval', 'Notify Creator of Approval', 'reaction rule', 1, 0, 1, 'rules', 0x4f3a31373a2252756c65735265616374696f6e52756c65223a31343a7b733a393a22002a00706172656e74223b4e3b733a323a226964223b733a313a2231223b733a31323a22002a00656c656d656e744964223b693a313b733a363a22776569676874223b733a313a2230223b733a383a2273657474696e6773223b613a303a7b7d733a343a226e616d65223b733a33323a2272756c65735f6e6f746966795f63726561746f725f6f665f617070726f76616c223b733a363a226d6f64756c65223b733a353a2272756c6573223b733a363a22737461747573223b733a313a2231223b733a353a226c6162656c223b733a32363a224e6f746966792043726561746f72206f6620417070726f76616c223b733a343a2274616773223b613a303a7b7d733a31313a22002a006368696c6472656e223b613a313a7b693a303b4f3a31313a2252756c6573416374696f6e223a363a7b733a393a22002a00706172656e74223b723a313b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a343b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a343a7b733a323a22746f223b733a32323a227b6d61696c696e672e63726561746f72456d61696c7d223b733a373a227375626a656374223b733a35323a225374617475733a207b6d61696c696e672e617070726f76616c5374617475737d20287b6d61696c696e672e7375626a6563747d29223b733a373a226d657373616765223b733a3437393a223c703e54686520666f6c6c6f77696e6720656d61696c20686173206265656e203c7374726f6e673e7b6d61696c696e672e617070726f76616c5374617475737d3c2f7374726f6e673e3a207b6d61696c696e672e6e616d657d3c2f703e0d0a0d0a3c703e54686520666f6c6c6f77696e6720656d61696c20617070726f76616c2f72656a656374696f6e206d65737361676520686173206265656e20696e636c756465643a3c6272202f3e0d0a7b6d61696c696e672e617070726f76616c4e6f74657d3c2f703e0d0a0d0a3c703e596f752068617665206e6f206675727468657220737465707320746f2074616b652e2054686520656d61696c2077696c6c20656e74657220746865206d61696c696e6720717565756520616e642062652064656c6976657265642073686f72746c792e204e6f7465207468617420656d61696c73206d617920657870657269656e636520736f6d652064656c6179206261736564206f6e207468652073697a65206f662074686520656d61696c20616e6420766f6c756d65206f6620726563697069656e74732e3c2f703e0d0a0d0a3c703e54686520636f6e74656e74206f662074686520656d61696c2069733a3c2f703e0d0a3c6469763e0d0a7b6d61696c696e672e68746d6c7d0d0a3c2f6469763e223b733a343a2266726f6d223b4e3b7d733a31343a22002a00656c656d656e744e616d65223b733a31383a226d61696c696e675f73656e645f656d61696c223b7d7d733a373a22002a00696e666f223b613a303a7b7d733a31333a22002a00636f6e646974696f6e73223b4f3a383a2252756c6573416e64223a383a7b733a393a22002a00706172656e74223b723a313b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a323b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a303a7b7d733a31313a22002a006368696c6472656e223b613a313a7b693a303b4f3a31343a2252756c6573436f6e646974696f6e223a373a7b733a393a22002a00706172656e74223b723a32353b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a333b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a313a7b733a32313a22617070726f76616c7374617475733a73656c656374223b733a373a226d61696c696e67223b7d733a31343a22002a00656c656d656e744e616d65223b733a34303a226369766963726d5f72756c65735f636f6e646974696f6e5f6d61696c696e675f617070726f766564223b733a393a22002a006e6567617465223b623a303b7d7d733a373a22002a00696e666f223b613a303a7b7d733a393a22002a006e6567617465223b623a303b7d733a393a22002a006576656e7473223b613a313a7b693a303b733a31363a226d61696c696e675f617070726f766564223b7d7d, 0, 0),
(2, 'rules_notify_creator_of_rejection', 'Notify Creator of Rejection', 'reaction rule', 1, 0, 1, 'rules', 0x4f3a31373a2252756c65735265616374696f6e52756c65223a31343a7b733a393a22002a00706172656e74223b4e3b733a323a226964223b733a313a2232223b733a31323a22002a00656c656d656e744964223b693a313b733a363a22776569676874223b733a313a2230223b733a383a2273657474696e6773223b613a303a7b7d733a343a226e616d65223b733a33333a2272756c65735f6e6f746966795f63726561746f725f6f665f72656a656374696f6e223b733a363a226d6f64756c65223b733a353a2272756c6573223b733a363a22737461747573223b733a313a2231223b733a353a226c6162656c223b733a32373a224e6f746966792043726561746f72206f662052656a656374696f6e223b733a343a2274616773223b613a303a7b7d733a31313a22002a006368696c6472656e223b613a313a7b693a303b4f3a31313a2252756c6573416374696f6e223a363a7b733a393a22002a00706172656e74223b723a313b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a343b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a343a7b733a323a22746f223b733a32323a227b6d61696c696e672e63726561746f72456d61696c7d223b733a373a227375626a656374223b733a35323a225374617475733a207b6d61696c696e672e617070726f76616c5374617475737d20287b6d61696c696e672e7375626a6563747d29223b733a373a226d657373616765223b733a3533343a223c703e54686520666f6c6c6f77696e6720656d61696c20686173206265656e203c7374726f6e673e7b6d61696c696e672e617070726f76616c5374617475737d3c2f7374726f6e673e3a207b6d61696c696e672e6e616d657d3c2f703e0d0a0d0a3c703e54686520666f6c6c6f77696e6720656d61696c20617070726f76616c2f72656a656374696f6e206d65737361676520686173206265656e20696e636c756465643a3c6272202f3e0d0a3c656d3e7b6d61696c696e672e617070726f76616c4e6f74657d3c2f656d3e3c2f703e0d0a0d0a3c703e596f752077696c6c2066696e64207468652072656a656374656420656d61696c20696e20426c75656269726420756e6465722074686520647261667420656d61696c206d616e6167656d656e7420706167652e20596f752063616e2072657669657720616e64206564697420746865206d61696c20686572653a3c2f703e0d0a3c756c3e3c6c693e7b6d61696c696e672e6564697455726c7d3c2f6c693e3c2f756c3e0d0a0d0a3c703e4f6e636520796f7527766520757064617465642074686520656d61696c20796f752077696c6c206e65656420746f2072657363686564756c6520697420616e64207375626d697420666f7220617070726f76616c2e2054686520636f6e74656e74206f662074686520656d61696c2069733a3c2f703e0d0a3c6469763e0d0a7b6d61696c696e672e68746d6c7d0d0a3c2f6469763e223b733a31313a2266726f6d3a73656c656374223b733a303a22223b7d733a31343a22002a00656c656d656e744e616d65223b733a31383a226d61696c696e675f73656e645f656d61696c223b7d7d733a373a22002a00696e666f223b613a303a7b7d733a31333a22002a00636f6e646974696f6e73223b4f3a383a2252756c6573416e64223a383a7b733a393a22002a00706172656e74223b723a313b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a323b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a303a7b7d733a31313a22002a006368696c6472656e223b613a313a7b693a303b4f3a31343a2252756c6573436f6e646974696f6e223a373a7b733a393a22002a00706172656e74223b723a32353b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a353b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a313a7b733a32313a22617070726f76616c7374617475733a73656c656374223b733a373a226d61696c696e67223b7d733a31343a22002a00656c656d656e744e616d65223b733a34303a226369766963726d5f72756c65735f636f6e646974696f6e5f6d61696c696e675f72656a6563746564223b733a393a22002a006e6567617465223b623a303b7d7d733a373a22002a00696e666f223b613a303a7b7d733a393a22002a006e6567617465223b623a303b7d733a393a22002a006576656e7473223b613a313a7b693a303b733a31363a226d61696c696e675f617070726f766564223b7d7d, 0, 0),
(3, 'rules_notify_approvers_of_submission', 'Notify Approvers of Submission', 'reaction rule', 1, 0, 1, 'rules', 0x4f3a31373a2252756c65735265616374696f6e52756c65223a31343a7b733a393a22002a00706172656e74223b4e3b733a323a226964223b733a313a2233223b733a31323a22002a00656c656d656e744964223b693a313b733a363a22776569676874223b733a313a2230223b733a383a2273657474696e6773223b613a303a7b7d733a343a226e616d65223b733a33363a2272756c65735f6e6f746966795f617070726f766572735f6f665f7375626d697373696f6e223b733a363a226d6f64756c65223b733a353a2272756c6573223b733a363a22737461747573223b733a313a2231223b733a353a226c6162656c223b733a33303a224e6f7469667920417070726f76657273206f66205375626d697373696f6e223b733a343a2274616773223b613a303a7b7d733a31313a22002a006368696c6472656e223b613a313a7b693a303b4f3a31313a2252756c6573416374696f6e223a363a7b733a393a22002a00706172656e74223b723a313b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a343b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a343a7b733a323a22746f223b733a33343a227b757365722e7065726d697373696f6e2d617070726f7665206d61696c696e67737d223b733a373a227375626a656374223b733a35373a224d61696c696e67207363686564756c656420616e6420726561647920666f72207265766965773a207b6d61696c696e672e7375626a6563747d223b733a373a226d657373616765223b733a3333343a223c703e54686520666f6c6c6f77696e6720656d61696c20686173206265656e203c7374726f6e673e7363686564756c65643c2f7374726f6e673e3a207b6d61696c696e672e6e616d657d3c2f703e0d0a3c703e596f7520617265207065726d697373696f6e656420746f20617070726f7665206f722072656a6563742074686973206d61696c696e672e20506c6561736520636f6f7264696e61746f722077697468206f74686572206d61696c696e6720617070726f7665727320696e20796f7572206f666669636520746f20636f6f7264696e6174652072657669657720616e642065697468657220617070726f7665206f722072656a65637420746865206d61696c696e672e0d0a3c703e54686520636f6e74656e74206f662074686520656d61696c2069733a3c2f703e0d0a0d0a3c6469763e0d0a7b6d61696c696e672e68746d6c7d0d0a3c2f6469763e223b733a343a2266726f6d223b4e3b7d733a31343a22002a00656c656d656e744e616d65223b733a31383a226d61696c696e675f73656e645f656d61696c223b7d7d733a373a22002a00696e666f223b613a303a7b7d733a31333a22002a00636f6e646974696f6e73223b4f3a383a2252756c6573416e64223a383a7b733a393a22002a00706172656e74223b723a313b733a323a226964223b4e3b733a31323a22002a00656c656d656e744964223b693a323b733a363a22776569676874223b693a303b733a383a2273657474696e6773223b613a303a7b7d733a31313a22002a006368696c6472656e223b613a303a7b7d733a373a22002a00696e666f223b613a303a7b7d733a393a22002a006e6567617465223b623a303b7d733a393a22002a006576656e7473223b613a313a7b693a313b733a31373a226d61696c696e675f7363686564756c6564223b7d7d, 0, 0)
;

INSERT INTO rules_dependencies (id, module) VALUES
(1, 'civicrm'), (2, 'civicrm'), (3, 'civicrm'),
(1, 'civicrm_rules'), (2, 'civicrm_rules'), (3, 'civicrm_rules')
;

INSERT INTO rules_trigger (id, event) VALUES
(1, 'mailing_approved'),
(2, 'mailing_approved'),
(3, 'mailing_scheduled')
;