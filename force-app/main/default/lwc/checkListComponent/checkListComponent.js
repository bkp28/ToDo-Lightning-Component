import { LightningElement, track, wire, api } from "lwc";
import getTasks from "@salesforce/apex/CheckListController.getTasks";
import insertNewTask from "@salesforce/apex/CheckListController.insertNewTask";
import deleteTask from "@salesforce/apex/CheckListController.deleteTask";
import getCheckListDetails from "@salesforce/apex/CheckListController.getCheckListDetails";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import CHECKLIST_TYPE from "@salesforce/schema/CheckList_Detail__c.CheckList_Type__c";
import insertNewCheckList from "@salesforce/apex/CheckListController.insertNewCheckList";

export default class CheckListComponent extends LightningElement {
  @track newTask = "";
  @api appName = "CheckList App";
  @track dataLoadProgress = true;
  @track newCheckList = "";
  @track lstToDoItems = [];
  @track checkListDetail = [];
  @track error;
  @track checkListTypes;
  @track typeValue;
  @track isCheckListAvailable = false;
  @track ToDoTaskResponse;

  connectedCallback() {
    this.fetchCheckListDetails();
  }

  handleNewTask(event) {
    this.newTask = event.target.value;
  }

  handleNewCheckList(event) {
    this.newCheckList = event.target.value;
  }

  handleCheckListType(event) {
    this.typeValue = event.target.value;
  }

  handleReset() {
    this.newCheckList = "";
    this.typeValue = "";
  }

  fetchCheckListDetails() {
    getCheckListDetails()
      .then((result) => {
        this.checkListDetail = result;
        this.error = undefined;
        this.isCheckListAvailable = true;
      })
      .catch((error) => {
        console.error("Error in fetching checklist details" + error);
        this.checkListDetail = undefined;
        this.error = error;
      });
  }

  @wire(getTasks)
  getToDoTasks(response) {
    this.ToDoTaskResponse = response;
    let data = response.data;
    let err = response.error;

    //To stop spinner if we get data/err response from the wire method / server
    if (data || err) {
      this.dataLoadProgress = false;
    }

    if (data) {
      this.lstToDoItems = [];
      data.forEach((task) => {
        this.lstToDoItems.push({
          id:
            this.lstToDoItems[this.lstToDoItems.length - 1].id + 1
              ? this.lstToDoItems[this.lstToDoItems.length - 1].id + 1
              : 0,
          description: task.Description__c,
          recordId: task.Id,
          status: task.status__c
        });
      });
    } else if (err) {
      console.log(err);
    }
  }

  //Get Picklist values for check list type field from Check List object
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: CHECKLIST_TYPE
  })
  wiredCheckListValues({ data, error }) {
    if (data) {
      console.log("picklist values" + data);
      this.checkListTypes = data.values;
      this.error = undefined;
    }
    if (error) {
      console.log("error in returning picklist values" + error);
      this.checkListTypes = undefined;
      this.error = error;
    }
  }

  addTaskToList() {
    //first lets check if this.newTask is blank then we should not allow the user to add the task as its empty
    if (this.newTask === "") {
      return;
    }

    //Make dataLoadProgress true again as we are making it false after initial data load
    this.dataLoadProgress = true;

    insertNewTask({ Description: this.newTask })
      .then((result) => {
        this.lstToDoItems.push({
          id: this.lstToDoItems.length + 1,
          description: this.newTask,
          status: false,
          recordId: result.Id
        });
        this.newTask = "";
        const evt = new ShowToastEvent({
          title: "Success",
          message: "Task Added Successfully",
          variant: "success",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
      })
      .catch((error) => {
        console.log(error);
        const evt = new ShowToastEvent({
          title: "Toast Error",
          message: "Unable to add new task",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
      })
      .finally(() => (this.dataLoadProgress = false));
  }

  createNewCheckList() {
    //if anyone of the field is empty then simply return do nothing on button click.
    if (this.typeValue === "" || this.newCheckList === "") {
      return;
    }

    this.dataLoadProgress = true;

    insertNewCheckList({ title: this.newCheckList, type: this.typeValue })
      .then((result) => {
        if (result) {
          this.isCheckListAvailable = true;
        } else {
          console.log("Unable to create new checklist!!");
        }
        const evt = new ShowToastEvent({
          title: "Success",
          message: "New CheckList Created",
          variant: "success",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
      })
      .catch((error) => {
        console.log(error);
        const evt = new ShowToastEvent({
          title: "Toast Error",
          message: "Unable to Create New CheckList",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
      })
      .finally(() => (this.dataLoadProgress = false), location.reload());
  }

  deleteTask(event) {
    let taskIdToDel = event.target.name;
    let taskIndexToDel;
    let recordIdToDelete;
    this.dataLoadProgress = true;

    for (let i = 0; i < this.lstToDoItems.length; i++) {
      if (taskIdToDel === this.lstToDoItems[i].id) {
        taskIndexToDel = i;
      }
    }
    recordIdToDelete = this.lstToDoItems[taskIndexToDel].recordId;

    deleteTask({ recordId: recordIdToDelete })
      .then((result) => {
        //remove task from JS side once we get response from salesforce and task record is deleted successfully from server
        if (result) {
          this.lstToDoItems.splice(taskIndexToDel, 1);
        } else {
          console.log("Unable to delete task!!");
        }
        const evt = new ShowToastEvent({
          title: "Success",
          message: "Task Deleted",
          variant: "success",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
      })
      .catch((error) => {
        console.log("err" + error);
        const evt = new ShowToastEvent({
          title: "Toast Error",
          message: "Unable to delete a task",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
      })
      .finally(() => (this.dataLoadProgress = false));
  }
}
