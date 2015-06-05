/**
 * eBrief customization
 *
 * @author jwu
 */
CaseFile.prepare = function() {

    CaseFile.Model.Tree.Key.nodeTypeMap = [
        {nodeType: "prevPage"      ,icon: "i i-arrow-up"     ,tabIds: ["tabBlank"]}
        ,{nodeType: "nextPage"     ,icon: "i i-arrow-down"   ,tabIds: ["tabBlank"]}
        ,{nodeType: "p"            ,icon: ""                 ,tabIds: ["tabBlank"]}
        ,{nodeType: "p/CASE_FILE"  ,icon: "i i-folder"       ,tabIds: ["tabTitle"
            ,"tabTasks"
            ,"tabParticipants"
            ,"tabPeople"
            ,"tabDocs"
            ,"tabHistory"
        ]}
        ,{nodeType: "p/CASE_FILE/task"      ,icon: "", res: "casefile:navigation.leaf-title.tasks"         ,tabIds: ["tabTasks"]}
        ,{nodeType: "p/CASE_FILE/par"       ,icon: "", res: "ebrief:navigation.leaf-title.participants"    ,tabIds: ["tabParticipants"]}
        ,{nodeType: "p/CASE_FILE/ppl"       ,icon: "", res: "casefile:navigation.leaf-title.people"        ,tabIds: ["tabPeople"]}
        ,{nodeType: "p/CASE_FILE/doc"       ,icon: "", res: "casefile:navigation.leaf-title.documents"     ,tabIds: ["tabDocs"]}
        ,{nodeType: "p/CASE_FILE/his"       ,icon: "", res: "casefile:navigation.leaf-title.history"       ,tabIds: ["tabHistory"]}
    ];

    CaseFile.Model.interface.nodeTitle = function(objSolr) {
        return Acm.goodValue(objSolr.title_parseable);
    }

    CaseFile.View.Ribbon = {
        create: function() {
            this.$labCaseNumber   = $("#caseNumber");
            this.$lnkAssignee     = $("#assigned");
            this.$lnkOrganisation = $("#organisation");
            this.$lnkHearingDate  = $("#hearingDate");
            this.$lnkCourt        = $("#court");

            this.$lnkCaseTitle    = $("#caseTitle");
            //this.$lnkStatus       = $("#status");


            AcmEx.Object.XEditable.useEditable(this.$lnkCaseTitle, {
                success: function(response, newValue) {
                    CaseFile.Controller.viewChangedCaseTitle(CaseFile.View.getActiveCaseFileId(), newValue);
                }
            });

            AcmEx.Object.XEditable.useEditableDate(this.$lnkHearingDate, {
                success: function(response, newValue) {
                    CaseFile.Controller.viewChangedDueDate(CaseFile.View.getActiveCaseFileId(), newValue);
                }
            });


            var choices = [];
            var myCfg = App.Model.Config.getMyConfig();
            var courtLocations = Acm.goodValue(myCfg.courtLocations, {});
            $.each(courtLocations, function(idx, val) {
                var opt = {};
                opt.value = val;
                opt.text = val;
                choices.push(opt);
            });
            AcmEx.Object.XEditable.useEditable(CaseFile.View.Ribbon.$lnkCourt, {
                source: choices
                ,success: function(response, newValue) {
                    Acm.log("set count location:" + newValue);
                    //CaseFile.Controller.viewChangedSubjectType(CaseFile.View.getActiveCaseFileId(), newValue);
                }
            });


            Acm.Dispatcher.addEventListener(ObjNav.Controller.VIEW_SELECTED_OBJECT             ,this.onViewSelectedObject);
            Acm.Dispatcher.addEventListener(ObjNav.Controller.MODEL_RETRIEVED_OBJECT           ,this.onModelRetrievedObject);

            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_FOUND_ASSIGNEES          ,this.onModelFoundAssignees);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_RETRIEVED_GROUPS         ,this.onModelRetrievedGroups);
            //Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_FOUND_SUBJECT_TYPES      ,this.onModelFoundSubjectTypes);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_CASE_TITLE         ,this.onModelSavedCaseTitle);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_ASSIGNEE           ,this.onModelSavedAssignee);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_GROUP	           ,this.onModelSavedGroup);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_SUBJECT_TYPE       ,this.onModelSavedSubjectType);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_DUE_DATE           ,this.onModelSavedDueDate);
            //Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_FOUND_PRIORITIES         ,this.onModelFoundPriorities);
            //Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_INCIDENT_DATE      ,this.onModelSavedIncidentDate);
            //Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_PRIORITY           ,this.onModelSavedPriority);

        }
        ,onInitialized: function() {
        }

        ,onViewSelectedObject: function(objType, objId) {
            var objData = ObjNav.Model.Detail.getCacheObject(objType, objId);
            CaseFile.View.Ribbon.populateCaseFile(objData);
        }
        ,onModelRetrievedObject: function(objData) {
            CaseFile.View.Ribbon.populateCaseFile(objData);
        }

        ,onModelFoundAssignees: function(assignees) {
            var choices = [];
            $.each(assignees, function(idx, val) {
                var opt = {};
                opt.value = val.userId;
                opt.text = val.fullName;
                choices.push(opt);
            });

            AcmEx.Object.XEditable.useEditable(CaseFile.View.Ribbon.$lnkAssignee, {
                source: choices
                ,success: function(response, newValue) {
                    CaseFile.Controller.viewChangedAssignee(CaseFile.View.getActiveCaseFileId(), newValue);
                }
                ,currentValue: CaseFile.Model.Detail.getAssignee(CaseFile.View.getActiveCaseFile())
            });

            // This is happen after loading the object, for that reason we should check here as well.
            // We need both, assignees and groups for checking.
            // For this to be happened, assignees and groups should be loaded. If in this stage
            // assignees or groups are not loaded, checking for assignees and groups will be skipped.
            CaseFile.View.Action.populateRestriction(CaseFile.View.getActiveCaseFile());
        }
        ,onModelRetrievedGroups: function(groups) {
            var choices = [];
            $.each(groups, function(idx, val) {
                var opt = {};
                opt.value = val.object_id_s;
                opt.text = val.name;
                choices.push(opt);
            });

            AcmEx.Object.XEditable.useEditable(CaseFile.View.Ribbon.$lnkOrganisation, {
                source: choices
                ,success: function(response, newValue) {
                    CaseFile.Controller.viewChangedGroup(CaseFile.View.getActiveCaseFileId(), newValue);
                }
                ,currentValue: CaseFile.Model.Detail.getGroup(CaseFile.View.getActiveCaseFile())
            });

            // This is happen after loading the object, for that reason we should check here as well.
            // We need both, assignees and groups for checking.
            // For this to be happened, assignees and groups should be loaded. If in this stage
            // assignees or groups are not loaded, checking for assignees and groups will be skipped.
            CaseFile.View.Action.populateRestriction(CaseFile.View.getActiveCaseFile());
        }
//        ,onModelFoundSubjectTypes: function(subjectTypes) {
//            var choices = [];
//            $.each(subjectTypes, function(idx, val) {
//                var opt = {};
//                opt.value = val;
//                opt.text = val;
//                choices.push(opt);
//            });
//
//            AcmEx.Object.XEditable.useEditable(CaseFile.View.Ribbon.$lnkCourt, {
//                source: choices
//                ,success: function(response, newValue) {
//                    CaseFile.Controller.viewChangedSubjectType(CaseFile.View.getActiveCaseFileId(), newValue);
//                }
//            });
//        }

        ,onModelSavedCaseTitle: function(caseFileId, title) {
            if (title.hasError) {
                CaseFile.View.Ribbon.setTextLnkCaseTitle($.t("casefile:detail.error-value"));
            }
        }
        ,onModelSavedAssignee: function(caseFileId, assginee) {
            if (assginee.hasError) {
                CaseFile.View.Ribbon.setTextLnkAssignee($.t("casefile:detail.error-value"));
            }
        }
        ,onModelSavedGroup: function(caseFileId, group) {
            if (group.hasError) {
                CaseFile.View.Ribbon.setTextLnkOrganisation($.t("casefile:detail.error-value"));
            }
        }
        ,onModelSavedSubjectType: function(caseFileId, subjectType) {
            if (subjectType.hasError) {
                CaseFile.View.Ribbon.setTextLnkCourt($.t("casefile:detail.error-value"));
            }
        }
        ,onModelSavedDueDate: function(caseFileId, created) {
            if (created.hasError) {
                CaseFile.View.Ribbon.setTextLnkHearingDate($.t("casefile:detail.error-value"));
            }
        }

        ,populateCaseFile: function(c) {
            if (CaseFile.Model.Detail.validateCaseFile(c)) {
                // DGM fixes... sorry about this bad code
                //var displayTitle = Acm.goodValue(c.title) + " (" + Acm.goodValue(c.status) +")";
                //var displayTitle = Acm.goodValue(c.caseNumber) + ", " + Acm.goodValue(c.title);
                //this.setTextLabCaseNumber(Acm.goodValue(displayTitle));
                this.setTextLabCaseNumber(Acm.goodValue(c.caseNumber));
                this.setTextLnkCaseTitle(Acm.goodValue(c.title));
                this.setTextLnkCourt(Acm.goodValue(c.caseType));
                this.setTextLnkHearingDate(Acm.getDateFromDatetime(c.dueDate));

                var assignee = CaseFile.Model.Detail.getAssignee(c);
                this.setTextLnkAssignee(Acm.goodValue(assignee));

                var group = CaseFile.Model.Detail.getGroup(c);
                this.setTextLnkOrganisation(Acm.goodValue(group));
            }
        }
        ,setTextLabCaseNumber: function(txt) {
            Acm.Object.setText(this.$labCaseNumber, txt);
        }
        ,setTextLnkCaseTitle: function(txt) {
            AcmEx.Object.XEditable.setValue(this.$lnkCaseTitle, txt);
        }
        ,setTextLnkAssignee: function(txt) {
            AcmEx.Object.XEditable.setValue(this.$lnkAssignee, txt);
        }
        ,setTextLnkOrganisation: function(txt) {
            AcmEx.Object.XEditable.setValue(this.$lnkOrganisation, txt);
        }
        ,setTextLnkCourt: function(txt) {
            AcmEx.Object.XEditable.setValue(this.$lnkCourt, txt);
        }
        ,setTextLnkHearingDate: function(txt) {
            AcmEx.Object.XEditable.setDate(this.$lnkHearingDate, txt);
        }

        ////////////////////////

        ,onModelFoundPriorities: function(priorities) {
            var choices = []; //[{value: "", text: "Choose Priority"}];
            $.each(priorities, function(idx, val) {
                var opt = {};
                opt.value = val;
                opt.text = val;
                choices.push(opt);
            });

            AcmEx.Object.XEditable.useEditable(CaseFile.View.Ribbon.$lnkPriority, {
                source: choices
                ,success: function(response, newValue) {
                    CaseFile.Controller.viewChangedPriority(CaseFile.View.getActiveCaseFileId(), newValue);
                }
            });
        }
        ,onModelSavedIncidentDate: function(caseFileId, incidentDate) {
            if (incidentDate.hasError) {
                CaseFile.View.Ribbon.setTextLnkIncidentDate($.t("casefile:detail.error-value"));
            }
        }
        ,onModelSavedPriority: function(caseFileId, priority) {
            if (priority.hasError) {
                CaseFile.View.Ribbon.setTextLnkPriority($.t("casefile:detail.error-value"));
            }
        }

        ,setTextLnkIncidentDate: function(txt) {
            //AcmEx.Object.XEditable.setDate(this.$lnkIncidentDate, txt);
            Acm.Object.setText(this.$lnkIncidentDate, txt);
        }
        ,setTextLnkPriority: function(txt) {
            AcmEx.Object.XEditable.setValue(this.$lnkPriority, txt);
        }
        ,setTextLnkStatus: function(txt) {
            Acm.Object.setText(this.$lnkStatus, txt);
        }

    };

    CaseFile.Service.Participants = {
        create: function() {
        }
        ,onInitialized: function() {
        }
        ,API_RETRIEVE_PROFILE_INFO         : "/api/latest/plugin/profile/get/"
        ,validateProfile: function(data) {
            if (Acm.isEmpty(data)) {
                return false;
            }
            if (Acm.isEmpty(data.userId) || Acm.isEmpty(data.email)) {
                return false;
            }
            if (!Acm.isArray(data.groups)) {
                return false;
            }
            return true;
        }
        ,retrieveProfileInfo : function(participant, user) {
            var url = this.API_RETRIEVE_PROFILE_INFO + user;
            return Acm.Service.promise({type: "GET"
                ,url: url
                ,callback: function(response) {
                    if (!response.hasError) {
                        if (CaseFile.Service.Participants.validateProfile(response)) {
                            var profileInfo = response;
                            CaseFile.View.Participants.updateParticipant(participant,profileInfo);
                            return profileInfo;
                        }
                    } //end else
                }
            })
        }
//        ,resolveProfileInfo: function(requests) {
//            var resolver = $.Deferred();
//            $.when.apply(this, requests).then(function(data) {
//                    resolver.resolve();
//                }, function(e) {
//                    resolver.reject();
//                }
//            );
//            return resolver;
//        }
    }

    CaseFile.View.Participants = {
        create: function() {
            this.$divParticipants    = $("#divParticipants");
            this.createJTableParticipants(this.$divParticipants);

            Acm.Dispatcher.addEventListener(ObjNav.Controller.MODEL_RETRIEVED_OBJECT    ,this.onModelRetrievedObject);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_ASSIGNEE    ,this.onModelSavedAssignee);
            Acm.Dispatcher.addEventListener(CaseFile.Controller.MODEL_SAVED_GROUP	    ,this.onModelSavedGroup);
            Acm.Dispatcher.addEventListener(ObjNav.Controller.VIEW_SELECTED_OBJECT      ,this.onViewSelectedObject);
        }
        ,onInitialized: function() {
        }
        ,onModelRetrievedObject: function(objData) {
            var caseFile = CaseFile.View.getActiveCaseFile();
            var participants = caseFile.participants;
            var requests = [];
            for(var i= 0; i< participants.length; i++){
                var participant = participants[i];
                if(Acm.goodValue(participant.participantType) !== "*" && Acm.goodValue(participant.participantType) !== "owning group"){
                    var user = participant.participantLdapId;
                    var req = CaseFile.Service.Participants.retrieveProfileInfo(participant,user);
                    requests.push(req);
                }
            }
            //CaseFile.Service.Participants.resolveProfileInfo(requests)
            Acm.Promise.resolvePromises(requests)
                .done(function() {
                    AcmEx.Object.JTable.load(CaseFile.View.Participants.$divParticipants);
                })
                .fail(function() {
                    App.View.MessageBoard.show("Error retrieving participants");
                });
        }

        ,onModelSavedAssignee: function(caseFileId, assginee) {
            if (!assginee.hasError) {
                AcmEx.Object.JTable.load(CaseFile.View.Participants.$divParticipants);
            }
        }
        ,onModelSavedGroup: function(caseFileId, group) {
            if (!group.hasError) {
                AcmEx.Object.JTable.load(CaseFile.View.Participants.$divParticipants);
                CaseFile.Service.Lookup.retrieveAssignees();
            }
        }
        ,onViewSelectedObject: function(objType, objId) {
            AcmEx.Object.JTable.load(CaseFile.View.Participants.$divParticipants);
        }
        ,updateParticipant: function(participant,profileInfo) {
            if(Acm.isNotEmpty(profileInfo)){
                participant.organisation = Acm.goodValue(profileInfo.companyName);
                participant.email = Acm.goodValue(profileInfo.email);
                participant.phone = Acm.goodValue(profileInfo.phone);
            }
        }
        ,createJTableParticipants: function($s) {
            AcmEx.Object.JTable.useBasic($s, {
                title: $.t("ebrief:participants.table.title")
                ,paging: true //fix me
                ,sorting: true //fix me
                ,pageSize: 10 //Set page size (default: 10)
                ,messages: {
                    addNewRecord: $.t("ebrief:participants.msg.add-new-record")
                }
                ,actions: {
                    listAction: function(postData, jtParams) {
                        var rc = AcmEx.Object.JTable.getEmptyRecords();
                        //var caseFileId = CaseFile.View.getActiveCaseFileId();
                        var c = CaseFile.View.getActiveCaseFile();
                        if (CaseFile.Model.Detail.validateCaseFile(c)) {
                            for (var i = 0; i < c.participants.length; i++) {
                                var participant = c.participants[i];
                                if(Acm.goodValue(participant.participantType) !== "*" && Acm.goodValue(participant.participantType) !== "owning group") {
                                    var record = {};
                                    record.id = Acm.goodValue(participant.id, 0);
                                    // Here I am not taking user full name. It will be automatically shown because now
                                    // I am sending key-value object with key=username and value=fullname
                                    record.title = Acm.goodValue(participant.participantLdapId);
                                    //record.title = Acm.__FixMe__getUserFullName(Acm.goodValue(participant.participantLdapId));
                                    record.type = Acm.goodValue(participant.participantType);

                                    record.organisation = Acm.goodValue(participant.organisation);
                                    record.email = Acm.goodValue(participant.email);
                                    record.phone = Acm.goodValue(participant.phone);

                                    rc.Records.push(record);
                                }
                            }
                            rc.TotalRecordCount = rc.Records.length;
                        }
                        return rc;
                    }
                    ,createAction: function(postData, jtParams) {
                        var record = Acm.urlToJson(postData);
                        var rc = AcmEx.Object.JTable.getEmptyRecord();
                        //var caseFileId = CaseFile.View.getActiveCaseFileId();
                        var caseFile = CaseFile.View.getActiveCaseFile();
                        if (caseFile) {
                            rc.Record.title = record.title;
                            rc.Record.type = record.type;
                        }
                        return rc;
                    }
                    ,updateAction: function(postData, jtParams) {
                        var record = Acm.urlToJson(postData);
                        var rc = AcmEx.Object.JTable.getEmptyRecord();
                        //var caseFileId = CaseFile.View.getActiveCaseFileId();
                        var caseFile = CaseFile.View.getActiveCaseFile();
                        if (caseFile) {
                            rc.Record.title = record.title;
                            rc.Record.type = record.type;
                        }
                        return rc;
                    }
                    ,deleteAction: function(postData, jtParams) {
                        return {
                            "Result": "OK"
                        };
                    }
                }
                ,fields: {
                    id: {
                        title: $.t("ebrief:participants.table.field.id")
                        ,key: true
                        ,list: false
                        ,create: false
                        ,edit: false
                    }
                    ,title: {
                        title: $.t("ebrief:participants.table.field.name")
                        ,width: '25%'
                        ,dependsOn: 'type'
                        ,options: function (data) {
                            if (data.dependedValues.type == '*') {
                                // Default user. This is needed to show default user in the table.
                                // I am setting it here, because i don't want to show it in the popup while
                                // creating new participant. If we set it in the popup, it should be removed from here.
                                // This is used only to recognize the * type.
                                return {"*": "*"}
                            }else if (data.dependedValues.type == 'owning group') {
                                var caseFileId = CaseFile.View.getActiveCaseFileId();
                                return Acm.createKeyValueObject(CaseFile.Model.Lookup.getGroups(caseFileId));
                            } else {
                                return Acm.createKeyValueObject(CaseFile.Model.Lookup.getUsers());
                            }
                        }
                    }
                    ,organisation: {
                        title: $.t("ebrief:participants.table.field.organisation")
                        ,width: '20%'
                    }
                    ,type: {
                        title: $.t("ebrief:participants.table.field.type")
                        ,width: '20%'
                        ,options: CaseFile.Model.Lookup.getParticipantTypes()
                        ,display: function (data) {
                            if (data.record.type == '*') {
                                // Default user. This is needed to show default user in the table.
                                // I am setting it here, because i don't want to show it in the popup while
                                // creating new participant. If we set it in the popup, it should be removed from here.
                                // This is used only to recognize the * type.
                                return '*';
                            } else {
                                var options = CaseFile.Model.Lookup.getParticipantTypes();
                                return options[data.record.type];
                            }
                        }
                    }
                    ,email: {
                        title: $.t("ebrief:participants.table.field.email")
                        ,width: '20%'
                    }
                    ,phone: {
                        title: $.t("ebrief:participants.table.field.phone")
                        ,width: '15%'
                    }
                }
                ,recordAdded : function (event, data) {
                    var record = data.record;
                    var caseFileId = CaseFile.View.getActiveCaseFileId();
                    if (0 < caseFileId) {
                        var participant = {};
                        participant.participantLdapId = record.title;
                        participant.participantType = record.type;
                        CaseFile.Controller.viewAddedParticipant(caseFileId, participant);
                    }
                }
                ,recordUpdated : function (event, data) {
                    var whichRow = data.row.prevAll("tr").length;  //count prev siblings
                    var record = data.record;
                    var caseFileId = CaseFile.View.getActiveCaseFileId();
                    var c = CaseFile.View.getActiveCaseFile();
                    if (c && Acm.isArray(c.participants)) {
                        if (0 < c.participants.length && whichRow < c.participants.length) {
                            var participant = c.participants[whichRow];
                            participant.participantLdapId = record.title;
                            participant.participantType = record.type;
                            CaseFile.Controller.viewUpdatedParticipant(caseFileId, participant);
                        }
                    }
                }
                ,recordDeleted : function (event, data) {
                    var whichRow = data.row.prevAll("tr").length;  //count prev siblings
                    var record = data.record;
                    var caseFileId = CaseFile.View.getActiveCaseFileId();
                    var c = CaseFile.View.getActiveCaseFile();
                    if (c && Acm.isArray(c.participants)) {
                        if (0 < c.participants.length && whichRow < c.participants.length) {
                            var participant = c.participants[whichRow];
                            CaseFile.Controller.viewDeletedParticipant(caseFileId, participant.id);
                        }
                    }
                }
            });
        }
    };


    CaseFile.View.Documents.createOrig = Acm.copyObjectFunction(CaseFile.View.Documents, "create", "createOrig");
    $.extend(CaseFile.View.Documents, {
        create: function() {
            CaseFile.View.Documents.createOrig();

            this.$btnNewFolder  = $("#btnNewFolder") .on("click", function(e) {CaseFile.View.Documents.onClickBtnNewFolder(e, this);});
            this.$btnLodgeDocs  = $("#btnLodgeDocs") .on("click", function(e) {CaseFile.View.Documents.onClickBtnLodgeDocs(e, this);});
            this.$btnRejectDocs = $("#btnRejectDocs").on("click", function(e) {CaseFile.View.Documents.onClickBtnRejectDocs(e, this);});

            this.$dlgLodgeDocs = $("#dlgLodgeDocs");
            this.$edtBmailAddr = $("#edtBmailAddr");
            this.$ulLodgeDocs  = $("#ulLodgeDocs");

            this.dlgRejectDocs    = $("#dlgRejectDocs");
            this.$edtBmailReject  = $("#edtBmailReject");
            this.$edtRejectReason = $("#edtRejectReason");
            this.$ulRejectDocs    = $("#ulRejectDocs");

        }
        ,onClickBtnNewFolder: function(event, ctrl) {
            //DocTree.View.$tree.trigger("command", {cmd: "newFolder"});

            var node = DocTree.View.tree.getActiveNode();
            var names = DocTree.View.getNodePathNames(node);
            var n = DocTree.View.findNodeByPathNames(names);
            var last = names.pop();
            var n2 = DocTree.View.findNodeByPathNames(names);
            var z = 1;
            //var topNode = DocTree.View.getTopNode();
            //DocTree.View.Op.createFolder(topNode, "hahahaha");
        }
        ,onClickBtnLodgeDocs: function(event, ctrl) {
            var parent = DocTree.View.tree.getRootNode();
            var node = DocTree.View.tree.getActiveNode();
            var names = DocTree.View.getNodePathNames(node);
            names.push("abc");
            DocTree.View.Op.createFolders(parent, names)
                .done(function(data){
                    var z = 1;
                })
                .fail(function(data){
                    var z = 2;
                })
            ;
            var z = 3;
            return;
            //get list of sel nodes
            //for each loop
            //   get path names
            //   create target folders
            //   find target folder
            //   node


            Acm.log("lodge doc??");
            Acm.Dialog.modal(CaseFile.View.Documents.$dlgLodgeDocs, function() {
                var lodgeFolderId = CaseFile.View.Documents.getLodgeFolderId();

                var selNodes = DocTree.View.tree.getSelectedNodes();
                var node = DocTree.View.tree.getActiveNode();
                var nodes = (Acm.isArrayEmpty(selNodes))? [node] : selNodes;

                DocTree.View.tree.batMove(frNodes, toNode, "child");
                Acm.log("lodge doc: Yes" + lodgeFolderId);
            });
        }
        ,onClickBtnRejectDocs: function(event, ctrl) {
            Acm.Dialog.modal(CaseFile.View.Documents.dlgRejectDocs, function() {
                Acm.log("reject doc: Yes");
            });
        }
        ,onViewSelectedTreeNode: function(key) {
            DocTree.View.expandTopNode();
        }

        ,_lodgeFolderId: 0
        ,getLodgeFolderId: function() {
            if (0 >= this._lodgeFolderId) {
                var topNode = DocTree.View.getTopNode();
                if (topNode) {
                    for (var i = 0; i < topNode.children.length; i++) {
                        var child = topNode.children[i];
                        if ("Court Brief" == Acm.goodValue(child.data.name)) {
                            this._lodgeFolderId = Acm.goodValue(child.data.objectId, 0);
                            break;
                        }
                    }
                }
            }
            return this._lodgeFolderId;
        }


    });


    CaseFile.View.DetailNote = {};
    CaseFile.View.Notes = {};
    CaseFile.View.References = {};
    CaseFile.View.Correspondence = {};
    CaseFile.View.Time = {};
    CaseFile.View.Cost = {};
    Calendar = {};

    CaseFile.Model.Config.requestOrig = Acm.copyObjectFunction(CaseFile.Model.Config, "request", "requestOrig");
    CaseFile.Model.Config.request = function() {
        CaseFile.Model.Config.requestOrig();

        App.Model.Config.requestConfig(Application.CONFIG_NAME_ACM_FORMS).done(function(data) {
            var cfg = App.Model.Config.getConfig(Application.CONFIG_NAME_ACM_FORMS);
            if (Acm.isNotEmpty(cfg)) {
                var myCfg = App.Model.Config.getMyConfig();
                myCfg.courtLocations  = {};
                Acm.goodValue(cfg["ebrief.court.locations"], "").split(",").forEach(function(x){
                    var arr = x.split("=");
                    arr[1] && (myCfg.courtLocations[arr[0]] = arr[1]);
                });
            }
        });
        App.Model.Config.requestConfig(CaseFile.Model.Config.CONFIG_NAME_CASE_FILE).done(function(data) {
            var cfg = App.Model.Config.getConfig(CaseFile.Model.Config.CONFIG_NAME_CASE_FILE);
            if (Acm.isNotEmpty(cfg)) {
                var myCfg = App.Model.Config.getMyConfig();
//                myCfg.caseTypes  = Acm.goodValue(cfg["casefile.case-types"], "").split(",");
//                myCfg.treeFilter = Acm.parseJson(cfg["search.tree.filter"], "[]");
//                myCfg.treeSort   = Acm.parseJson(cfg["search.tree.sort"], "[]");
            }
        });
    };

};


