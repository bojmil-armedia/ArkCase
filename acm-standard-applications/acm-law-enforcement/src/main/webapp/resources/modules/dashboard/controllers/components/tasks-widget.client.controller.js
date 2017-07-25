'use strict';

angular.module('dashboard.tasks', ['adf.provider'])
    .config(function (dashboardProvider) {
        dashboardProvider
            .widget('tasks', {
                title: 'dashboard.widgets.tasks.title',
                description: 'dashboard.widgets.tasks.description',
                controller: 'Dashboard.TasksController',
                reload: true,
                templateUrl: 'modules/dashboard/views/components/tasks-widget.client.view.html',
                commonName: 'tasks'
            });
    })
    .controller('Dashboard.TasksController', ['$scope', '$translate', '$stateParams', '$q',
        'UtilService', 'Case.InfoService', 'Complaint.InfoService','Authentication', 'Dashboard.DashboardService', 'ObjectService', 'Object.TaskService', 'ConfigService', 'Helper.ObjectBrowserService', 'Helper.UiGridService',
            function ($scope, $translate, $stateParams, $q,
                      Util, CaseInfoService, ComplaintInfoService, Authentication, DashboardService, ObjectService, ObjectTaskService, ConfigService, HelperObjectBrowserService, HelperUiGridService) {

                var promiseConfig;
                var promiseInfo;
                var modules = [
                    {name: "CASE_FILE", configName: "cases", getInfo: ObjectTaskService.queryChildTasks, objectType: ObjectService.ObjectTypes.CASE_FILE}
                    , {name: "COMPLAINT", configName: "complaints", getInfo: ObjectTaskService.queryChildTasks, objectType: ObjectService.ObjectTypes.COMPLAINT}
                ];

                var module = _.find(modules, function (module) {
                    return module.name == $stateParams.type;
                });

                $scope.gridOptions = {
                    enableColumnResizing: true,
                    columnDefs: []
                };

                var currentObjectId = HelperObjectBrowserService.getCurrentObjectId();
                if (module && Util.goodPositive(currentObjectId, false)) {
                    promiseConfig = ConfigService.getModuleConfig(module.configName);
                    promiseInfo = module.getInfo(module.objectType, currentObjectId, 0, 5);
                    var gridHelper = new HelperUiGridService.Grid({scope: $scope});
                    var promiseUsers = gridHelper.getUsers();

                    $q.all([promiseConfig, promiseInfo, promiseUsers]).then(function (data) {
                            var config = _.find(data[0].components, {id: "main"});
                            var info = data[1];
                            var widgetInfo = _.find(config.widgets, function (widget) {
                                return widget.id === "tasks";
                            });
                            gridHelper.setUserNameFilterToConfig(promiseUsers, widgetInfo);
                            $scope.config = config;
                            $scope.gridOptions.columnDefs = widgetInfo.columnDefs;

                            var tasks = info.response.docs;
                            if(!Util.isArrayEmpty(tasks)) {
                                $scope.gridOptions.data = tasks;
                                $scope.gridOptions.noData = false;
                                $scope.gridOptions.totalItems = info.response.numFound;
                            }
                            else {
                                $scope.gridOptions.data = [];
                                $scope.gridOptions.noData = true;
                                $scope.gridOptions.totalItems = 0;
                                $scope.noDataMessage = $translate.instant('dashboard.widgets.tasks.noDataMessage');
                            }
                        },
                        function (err) {

                        }
                    );
                }
        }
    ]);