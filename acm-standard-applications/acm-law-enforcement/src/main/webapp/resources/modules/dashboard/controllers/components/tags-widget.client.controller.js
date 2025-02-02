'use strict';

angular.module('dashboard.tags', [ 'adf.provider' ]).config(function(dashboardProvider) {
    dashboardProvider.widget('tags', {
        title: 'preference.overviewWidgets.tags.title',
        description: 'dashboard.widgets.tags.description',
        controller: 'Dashboard.TagsController',
        reload: true,
        templateUrl: 'modules/dashboard/views/components/tags-widget.client.view.html',
        commonName: 'tags'
    });
}).controller(
        'Dashboard.TagsController',
        [ '$scope', '$stateParams', '$q', '$translate', 'UtilService', 'Case.InfoService', 'Complaint.InfoService', 'Task.InfoService', 'Authentication', 'Dashboard.DashboardService', 'ObjectService', 'Object.TagsService', 'ConfigService', 'Helper.ObjectBrowserService', 'Helper.UiGridService',
                function($scope, $stateParams, $q, $translate, Util, CaseInfoService, ComplaintInfoService, TaskInfoService, Authentication, DashboardService, ObjectService, ObjectTagsService, ConfigService, HelperObjectBrowserService, HelperUiGridService) {

                    var promiseConfig;
                    var promiseInfo;
                    var modules = [ {
                        name: "CASE_FILE",
                        configName: "cases",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.CASE_FILE
                    }, {
                        name: "COMPLAINT",
                        configName: "complaints",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.COMPLAINT
                    }, {
                        name: "TASK",
                        configName: "tasks",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.TASK
                    }, {
                        name: "DOC_REPO",
                        configName: "document-repository",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.DOC_REPO
                    }, {
                        name: "MY_DOC_REPO",
                        configName: "my-documents",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.MY_DOC_REPO
                    }, {
                        name: "TIMESHEET",
                        configName: "time-tracking",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.TIMESHEET
                    }, {
                        name: "COSTSHEET",
                        configName: "cost-tracking",
                        getInfo: ObjectTagsService.getAssociateTags,
                        objectType: ObjectService.ObjectTypes.COSTSHEET
                    } ];

                    var module = _.find(modules, function(module) {
                        return module.name == $stateParams.type;
                    });

                    $scope.gridOptions = {
                        enableColumnResizing: true,
                        columnDefs: []
                    };

                    var gridHelper = new HelperUiGridService.Grid({
                        scope: $scope
                    });

                    var currentObjectId = HelperObjectBrowserService.getCurrentObjectId();
                    if (module && Util.goodPositive(currentObjectId, false)) {
                        promiseConfig = ConfigService.getModuleConfig(module.configName);
                        promiseInfo = module.getInfo(currentObjectId, module.objectType);
                        var promiseUsers = gridHelper.getUsers();

                        $q.all([ promiseConfig, promiseInfo, promiseUsers ]).then(function(data) {
                            var config = _.find(data[0].components, {
                                id: "main"
                            });
                            var info = data[1];
                            var widgetInfo = _.find(config.widgets, function(widget) {
                                return widget.id === "tags";
                            });
                            gridHelper.setUserNameFilterToConfig(promiseUsers, widgetInfo);
                            $scope.config = config;
                            gridHelper.setColumnDefs(widgetInfo);
                            var tags = info;
                            gridHelper.setWidgetsGridData(tags);
                        }, function(err) {

                        });
                    }
                } ]);