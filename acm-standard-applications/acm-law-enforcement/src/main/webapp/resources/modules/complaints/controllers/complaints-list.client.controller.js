'use strict';

angular.module('complaints').controller(
        'ComplaintsListController',
        [
                '$scope',
                '$state',
                '$stateParams',
                '$translate',
                'UtilService',
                'ObjectService',
                'Complaint.ListService',
                'Complaint.InfoService',
                'Helper.ObjectBrowserService',
                'ServCommService',
                'MessageService',
                'Object.CalendarService',
                function($scope, $state, $stateParams, $translate, Util, ObjectService, ComplaintListService, ComplaintInfoService,
                        HelperObjectBrowserService, ServCommService, MessageService, CalendarService) {

                    // maybe optional listener for "close-complaint"?
                    var eventName = "object.inserted";
                    $scope.$bus.subscribe(eventName, function(data) {
                        if (data.objectType === ObjectService.ObjectTypes.COMPLAINT) {
                            var frevvoRequest = ServCommService.popRequest("frevvo", "new-complaint");
                            var objectTypeString = $translate.instant('common.objectTypes.' + data.objectType);
                            var objectWasCreatedMessage = $translate.instant('common.objects.objectWasCreatedMessage ', {
                                objectTypeString : objectTypeString,
                                objectId : data.objectId
                            });
                            if (frevvoRequest) {
                                ObjectService.showObject(ObjectService.ObjectTypes.COMPLAINT, data.objectId);
                                MessageService.info(objectWasCreatedMessage);
                            } else {
                                MessageService.info(objectWasCreatedMessage);
                            }
                        }
                    });

                    //"treeConfig", "treeData", "onLoad", and "onSelect" will be set by Tree Helper
                    new HelperObjectBrowserService.Tree({
                        scope : $scope,
                        state : $state,
                        stateParams : $stateParams,
                        moduleId : "complaints",
                        resetTreeData : function() {
                            return ComplaintListService.resetComplaintsTreeData();
                        },
                        updateTreeData : function(start, n, sort, filters, query, nodeData) {
                            return ComplaintListService.updateComplaintsTreeData(start, n, sort, filters, query, nodeData);
                        },
                        getTreeData : function(start, n, sort, filters, query) {
                            CalendarService.isCalendarConfigurationEnabled('COMPLAINT').then(
                                    function(data) {
                                        if (!data) {
                                            MessageService.info($translate
                                                    .instant('dashboard.widgets.calendar.calendarIntegrationDisabledMessage'));
                                        }
                                    });
                            return ComplaintListService.queryComplaintsTreeData(start, n, sort, filters, query);
                        },
                        getNodeData : function(complaintId) {
                            return ComplaintInfoService.getComplaintInfo(complaintId);
                        },
                        makeTreeNode : function(complaintInfo) {
                            return {
                                nodeId : Util.goodValue(complaintInfo.complaintId, 0),
                                nodeType : ObjectService.ObjectTypes.COMPLAINT,
                                nodeTitle : Util.goodValue(complaintInfo.complaintTitle),
                                nodeToolTip : Util.goodValue(complaintInfo.complaintTitle)
                            };
                        }
                    });

                } ]);
