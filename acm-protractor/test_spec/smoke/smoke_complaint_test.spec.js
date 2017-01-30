var logger = require('../../log');
var utils = require('../../util/utils.js');
var complaintPage = require('../../Pages/complaint_page.js');
var casePage = require('../../Pages/case_page.js');
var userPage = require('../../Pages/user_profile_page.js');
var taskPage = require('../../Pages/task_page.js');
var Objects = require('../../json/Objects.json');
var loginPage = require('../../Pages/login_page.js');
var timeTrackingPage = require('../../Pages/time_tracking_page.js');
var costTrackingPage = require('../../Pages/cost_tracking_page.js');
var preferencesPage = require('../../Pages/preference_page.js');
var flag = false;

function testAsync(done) {

    setTimeout(function() {
        flag = true;
        done();
    }, 30000);

}

describe('Create new complaint ', function() {

    beforeEach(function(done) {

        loginPage.Login(Objects.loginpage.data.supervisoruser.username, Objects.loginpage.data.supervisoruser.password);
        testAsync(done);

    });

    afterEach(function() {

        loginPage.Logout();

    });

    //Create New Complaint, Make sure new object is created

    it('should create new complaint ', function() {

        complaintPage.clickNewButton().clickComplaintButton().switchToIframes().submitInitiatorInformation(Objects.complaintPage.data.firstName, Objects.complaintPage.data.lastName).reenterFirstName(Objects.complaintPage.data.firstName).clickTab("Incident").insertIncidentInformation("Arson", Objects.complaintPage.data.title).clickSubmitButton();
        complaintPage.switchToDefaultContent();
        complaintPage.waitForComplaintsPage();
        expect(complaintPage.returnComplaintsTitle()).toEqual(Objects.complaintPage.data.title);

    });

    //Add a document to document management

    it('Verify adding correspondence document', function() {

        complaintPage.clickNewButton().clickComplaintButton().switchToIframes().submitInitiatorInformation(Objects.complaintPage.data.firstName, Objects.complaintPage.data.lastName);
        expect(complaintPage.returnFirstNameValue()).toEqual(Objects.complaintPage.data.firstName);
        expect(complaintPage.returnLastNameValue()).toEqual(Objects.complaintPage.data.lastName);
        complaintPage.reenterFirstName(Objects.complaintPage.data.firstName).clickTab("Incident").insertIncidentInformation("Arson", Objects.complaintPage.data.title).clickSubmitButton();
        complaintPage.switchToDefaultContent().clickExpandFancyTreeTopElementAndSubLink("Documents");
        complaintPage.rightClickRootFolder().addCorrespondence("complaint", "Notice of Investigation");
        complaintPage.validateDocGridData(true, "Notice of Investigation", ".docx", "Notice of Investigation", utils.returnToday("/"), utils.returnToday("/"), userPage.returnUserNavigationProfile(), "1.0", "ACTIVE");
    });

    //Add Notes

    it('Add new note and verify added note', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.clickNotesLink();
        complaintPage.addNote(Objects.casepage.data.note);
        expect(complaintPage.returnNoteName()).toEqual(Objects.casepage.data.note, "The note is succesfully added");
    });

    //Email document (Click Email)

    it('should verify sending document through email', function () {

        complaintPage.clickModuleComplaints();
        complaintPage.switchToDefaultContent().clickExpandFancyTreeTopElementAndSubLink("Documents");
        complaintPage.clickDocTreeExpand().rightClickFileTitle().clickDocAction("Email");
        complaintPage.sendEmail(Objects.basepage.data.email);
    });

    //Create a task associated to complaint

    it('Add task from tasks table verify the task', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.clickTasksLinkBtn();
        complaintPage.clickAddTaskButton();
        taskPage.insertSubject(Objects.taskpage.data.Subject).insertDueDateToday().clickSave();
        taskPage.clickComplaintTitleInTasks();
        complaintPage.clickTasksLinkBtn().waitForTasksTable();
        expect(complaintPage.returnTaskTableTitle()).toContain(Objects.taskpage.data.Subject);
        expect(complaintPage.returnTaskTableAssignee()).toEqual(Objects.casepage.data.assigneeSamuel);
        expect(complaintPage.returnTaskTableCreatedDate()).toEqual(utils.returnToday("/"));
        expect(complaintPage.returnTaskTablePriority()).toEqual(Objects.casepage.data.priorityMedium);
        expect(complaintPage.returnTaskTableDueDate()).toEqual(utils.returnToday("/"));
        expect(complaintPage.returnTaskTableStatus()).toEqual("ACTIVE");
    });

    //Add a document to document management

    it('should create new complaint and verify adding new document', function() {

        complaintPage.clickNewButton().clickComplaintButton().switchToIframes().submitInitiatorInformation(Objects.complaintPage.data.firstName, Objects.complaintPage.data.lastName);
        expect(complaintPage.returnFirstNameValue()).toEqual(Objects.complaintPage.data.firstName);
        expect(complaintPage.returnLastNameValue()).toEqual(Objects.complaintPage.data.lastName);
        complaintPage.reenterFirstName(Objects.complaintPage.data.firstName).clickTab("Incident").insertIncidentInformation("Arson", Objects.complaintPage.data.title).clickSubmitButton();
        complaintPage.switchToDefaultContent().clickExpandFancyTreeTopElementAndSubLink("Documents");
        complaintPage.rightClickRootFolder().addDocument("Notice of Investigation");
        utils.uploadDocx();
        complaintPage.validateDocGridData(true, "ArkCaseTesting", ".docx", "Notice of Investigation", utils.returnToday("/"), utils.returnToday("/"), userPage.returnUserNavigationProfile(), "1.0", "ACTIVE");

    });

    //Add details on new created complaint

    it('Verify text details add verify if is saved', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.switchToDefaultContent().clickExpandFancyTreeTopElementAndSubLink("Details");
        complaintPage.insertDetailsTextAreaText(Objects.taskspage.data.detailsTextArea);
        complaintPage.clickSaveDetailsButton();
        complaintPage.clickRefreshButton();
        expect(complaintPage.returnDetailsTextArea()).toEqual(Objects.taskspage.data.detailsTextArea, 'After refresh the details text is not saved');

    });

    //Close complaint (open case) and approve task and make sure the new case was created

    it('should navigate to complaints and close complaint with Open Investigation, approve automatic generated task and validate created case', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.clickCloseComplaint().switchToIframes().closeComplaint("Open Investigation", Objects.complaintPage.data.description, Objects.complaintPage.data.approver);
        complaintPage.switchToDefaultContent().clickExpandFancyTreeTopElementAndSubLink("Tasks");
        complaintPage.waitForTasksTable();
        complaintPage.clickRefreshButton();
        expect(complaintPage.returnAutomatedTask()).toContain(Objects.complaintPage.data.automaticTaskNameCloseComplaint);
        complaintPage.clickTaskTitle();
        taskPage.clickApproveBtn();
        expect(taskPage.returnTaskState()).toEqual(Objects.taskspage.data.taskStateClosed, 'The task state should be CLOSED');
        complaintPage.navigateToPage("Cases").clickExpandFancyTreeTopElementAndSubLink("Details");
        expect(complaintPage.returnDetailsTextArea()).toContain(Objects.casepage.data.automatedTaskTitle);

    });

    //verify people initiator on new added complaint

    it('Verify people initiator', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.clickPeopleLinkBtn();
        expect(complaintPage.returnPeopleType()).toEqual(Objects.casepage.data.peopleTypeInitiaor);
        expect(complaintPage.returnPeopleFirstName()).toEqual(Objects.complaintPage.data.firstName);
        expect(complaintPage.returnPeopleLastName()).toEqual(Objects.complaintPage.data.lastName);
    });

    //verify the assignee on new added complaint

    it('Verify the assignee by default', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.participantTable();
        expect(complaintPage.returnParticipantTypeFirstRow()).toEqual("*");
        expect(complaintPage.returnParticipantNameFirstRow()).toEqual("*");
        expect(complaintPage.returnParticipantTypeSecondRow()).toEqual("assignee");
        expect(complaintPage.returnParticipantNameSecondRow()).toEqual("Samuel Supervisor");
        expect(complaintPage.returnParticipantTypeThirdRow()).toEqual("owning group");
        expect(complaintPage.returnParticipantNameThirdRow()).toEqual("ACM_INVESTIGATOR_DEV");
        expect(complaintPage.returnParticipantTypeForthRow()).toEqual("reader");
        expect(complaintPage.returnParticipantNameForthRow()).toEqual("Samuel Supervisor");
    });

    //verify the event in history on new added complaint

    it('should Verify the event in the history table', function() {

        complaintPage.clickModuleComplaints();
        complaintPage.historyTable();
        expect(complaintPage.returnHistoryEventName()).toEqual("Complaint Created");
        expect(complaintPage.returnHistoryDate()).toContain(utils.returnToday("/"));
        expect(complaintPage.returnHistoryUser()).toEqual(Objects.casepage.data.assigneeSamuel);
    });

});
