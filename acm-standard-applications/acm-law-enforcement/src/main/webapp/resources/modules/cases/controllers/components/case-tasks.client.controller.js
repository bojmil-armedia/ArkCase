'use strict';

angular.module('cases').controller('Cases.TasksController', ['$scope', '$state', '$stateParams', '$q', '$translate'
    , 'UtilService', 'ConfigService', 'ObjectService', 'Object.TaskService', 'Task.WorkflowService'
    , 'Helper.UiGridService', 'Helper.ObjectBrowserService', 'Case.InfoService'
    , function ($scope, $state, $stateParams, $q, $translate
        , Util, ConfigService, ObjectService, ObjectTaskService, TaskWorkflowService
        , HelperUiGridService, HelperObjectBrowserService, CaseInfoService) {

        var componentHelper = new HelperObjectBrowserService.Component({
            scope: $scope
            , stateParams: $stateParams
            , moduleId: "cases"
            , componentId: "tasks"
            , retrieveObjectInfo: CaseInfoService.getCaseInfo
            , validateObjectInfo: CaseInfoService.validateCaseInfo
            , onConfigRetrieved: function (componentConfig) {
                return onConfigRetrieved(componentConfig);
            }
            , onObjectInfoRetrieved: function (objectInfo) {
                onObjectInfoRetrieved(objectInfo);
            }
        });

        var gridHelper = new HelperUiGridService.Grid({scope: $scope});
        var promiseUsers = gridHelper.getUsers();

        var onConfigRetrieved = function (config) {
            gridHelper.setColumnDefs(config);
            gridHelper.setBasicOptions(config);
            gridHelper.disableGridScrolling(config);
            gridHelper.setExternalPaging(config, retrieveGridData);
            gridHelper.setUserNameFilter(promiseUsers);

            for (var i = 0; i < $scope.config.columnDefs.length; i++) {
                if (HelperUiGridService.Lookups.TASK_OUTCOMES == $scope.config.columnDefs[i].lookup) {
                    $scope.gridOptions.columnDefs[i].cellTemplate = '<span ng-hide="row.entity.acm$_taskActionDone"><select'
                        + ' ng-options="option.value for option in row.entity.acm$_taskOutcomes track by option.id"'
                        + ' ng-model="row.entity.acm$_taskOutcome">'
                        + ' </select>'
                        + ' <span ng-hide="\'noop\'==row.entity.acm$_taskOutcome.id"><i class="fa fa-gear fa-lg" ng-click="grid.appScope.action(row.entity)"></i></span></span>';
                }
            }

            componentHelper.doneConfig(config);

            return false;
        };


        var onObjectInfoRetrieved = function (objectInfo) {
            $scope.objectInfo = objectInfo;
            retrieveGridData();
        };

        //jwu: for testing, remove meeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
        //$scope.isReadOnly = function (objectInfo) {
        //    return true;
        //};

        var retrieveGridData = function () {
            var currentObjectId = Util.goodMapValue($scope.objectInfo, "id");
            if (Util.goodPositive(currentObjectId, false)) {
                ObjectTaskService.queryChildTasks(ObjectService.ObjectTypes.CASE_FILE
                    , currentObjectId
                    , Util.goodValue($scope.start, 0)
                    , Util.goodValue($scope.pageSize, 10)
                    , Util.goodValue($scope.sort.by)
                    , Util.goodValue($scope.sort.dir)
                ).then(function (data) {
                    var tasks = data.response.docs;
                    $scope.gridOptions = $scope.gridOptions || {};
                    $scope.gridOptions.data = tasks;
                    $scope.gridOptions.totalItems = data.response.numFound;

                    for (var i = 0; i < tasks.length; i++) {
                        var task = tasks[i];
                        task.acm$_taskOutcomes = [{
                            id: "noop",
                            value: $translate.instant("common.select.option.none")
                        }];
                        task.acm$_taskOutcome = {
                                id: "noop",
                                value: $translate.instant("common.select.option.none")
                        };
                        task.acm$_taskActionDone = true;

                        if (task.status_s === "ACTIVE" && task.adhocTask_b) {
                            task.acm$_taskOutcomes.push({id: "complete", value: "Complete"});
                            task.acm$_taskOutcomes.push({id: "delete", value: "Delete"});
                            task.acm$_taskActionDone = false;
                        }
                        else if (task.status_s === "ACTIVE" && !task.adhocTask_b && !Util.isArrayEmpty(task.outcome_value_ss)) {
                            var availableOutcomes = Util.goodArray(task.outcome_value_ss);
                            if (availableOutcomes !== undefined && availableOutcomes.length > 0) {
                                for (var j = 0; j < availableOutcomes.length; j++) {
                                    var outcome = {
                                            id: Util.goodValue(availableOutcomes[j]),
                                            value: Util.goodValue(availableOutcomes[j])
                                    };
                                    task.acm$_taskOutcomes.push(outcome);
                                }
                            }
                            task.acm$_taskActionDone = (1 >= availableOutcomes.length); //1 for '(Select One)'
                        }
                    }
                    return data;
                });
            }
        };

        $scope.addNew = function () {
            $state.go("newTaskFromParentObject", {
                parentType: ObjectService.ObjectTypes.CASE_FILE,
                parentObject: $scope.objectInfo.caseNumber,
                parentTitle: $scope.objectInfo.title
            });
        };

        var completeTask = function (rowEntity) {
            TaskWorkflowService.completeTask(rowEntity.id).then(
                function (taskInfo) {
                    rowEntity.acm$_taskActionDone = true;
                    rowEntity.status_s = TaskWorkflowService.WorkflowStatus.COMPLETE;
                    return taskInfo;
                }
            );
        };
        var deleteTask = function (rowEntity) {
            TaskWorkflowService.deleteTask(rowEntity.id).then(
                function (taskInfo) {
                    rowEntity.acm$_taskActionDone = true;
                    var tasks = Util.goodArray($scope.gridOptions.data);
                    for (var i = 0; i < tasks.length; i++) {
                        if (tasks[i].id == rowEntity.id) {
                            tasks.splice(i, 1);
                            break;
                        }
                    }
                    return taskInfo;
                }
            );
        };
        var completeTaskWithOutcome = function (rowEntity) {
            var task = Util.omitNg(rowEntity);       //todo: need to convert taskSolr to taskInfo
            var outcome = "fixme";
            TaskWorkflowService.completeTaskWithOutcome(task, outcome).then(
                function (successData) {
                    rowEntity.acm$_taskActionDone = true;
                    rowEntity.status_s = TaskWorkflowService.WorkflowStatus.COMPLETE;
                    return successData;
                }
            );
        };
        $scope.action = function (rowEntity) {
            console.log("act, rowEntity.id=" + rowEntity.id + ", action=" + rowEntity.acm$_taskOutcome.id);
            if ("complete" == rowEntity.acm$_taskOutcome.id) {
                completeTask(rowEntity);
            } else if ("delete" == rowEntity.acm$_taskOutcome.id) {
                deleteTask(rowEntity);
            } else {
                completeTaskWithOutcome(rowEntity);
            }
        };

        $scope.onClickObjLink = function (event, rowEntity) {
            event.preventDefault();
            var targetType = (Util.goodMapValue(rowEntity, "adhocTask_b", false)) ? ObjectService.ObjectTypes.ADHOC_TASK : ObjectService.ObjectTypes.TASK;
            //var targetType = Util.goodMapValue(rowEntity, "object_type_s");
            var targetId = Util.goodMapValue(rowEntity, "object_id_s");
            gridHelper.showObject(targetType, targetId);
        };

        //$scope.$on("object-refreshed", function (e, objectId) {
        //    ObjectTaskService.resetChildTasks(ObjectService.ObjectTypes.CASE_FILE, $scope.objectInfo.id);
        //});
    }
]);