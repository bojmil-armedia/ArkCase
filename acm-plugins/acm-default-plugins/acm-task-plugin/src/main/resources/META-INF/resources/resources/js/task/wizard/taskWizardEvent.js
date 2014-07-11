/**
 * TaskWizard.Event
 *
 * event handlers for objects
 *
 * @author jwu
 */
TaskWizard.Event = {
    initialize : function() {
    }

    ,onClickBtnSave : function(e) {
        var data = TaskWizard.Object.getTaskData();
        TaskWizard.Service.createAdhocTask(data);
        e.preventDefault();
    }


    ,onPostInit: function() {
        Acm.keepTrying(TaskWizard.Event._tryInitOwners, 8, 200);
    }

    ,_tryInitOwners: function() {
        var data = Acm.Object.getApprovers();
        if (Acm.isNotEmpty(data)) {
            TaskWizard.Object.initOwners(data);
            return true;
        } else {
            return false;
        }
    }
};
