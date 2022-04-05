import { LightningElement, track ,wire,api} from 'lwc';
import getTasks from '@salesforce/apex/TaskController.getTasks';
import { refreshApex } from '@salesforce/apex';
import insertNewTask from '@salesforce/apex/TaskController.insertNewTask';
import deleteTask from '@salesforce/apex/TaskController.deleteTask';
import getCheckListDetails from '@salesforce/apex/TaskController.getCheckListDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import CHECKLIST_TYPE from '@salesforce/schema/Check_List__c.Check_List_Type__c';
import insertNewCheckList from '@salesforce/apex/TaskController.insertNewCheckList';

/*
    getPicklistValues : 
    Parameters : 
    1. RecordTypeId -- required 
    2. fieldApiName -- required
*/

export default class LwcDemo4 extends LightningElement {
    newTask='';
    @api appName;
    dataLoadProgress = true;
    @track newCheckList='';

    //using track decorator framwork can track this property and changes can be reflected immediately on UI

    @track lstToDoItems = [];
    @track checkListDetail = [];
    @track error;
    @track checkListTypes;
    @track typeValue;
    @track isCheckListAvailable=false;
    
    ToDoTaskResponse; // variable will hold response and will be used to synch records between salesforce and UI

    //When component loads fetch user specific checklist details based on that render correct template from markup
     connectedCallback(){
         console.log('connectedCallback called');
         this.fetchCheckListDetails();
     }

    handleNewTask(event){
        this.newTask = event.target.value;
    }

    //to capture the value entered inside checklist textbox
    handleNewCheckList(event){
        this.newCheckList = event.target.value;
    }

    //simply reset both checklist textbox and combobox
    handleReset(){
        this.newCheckList='';
        this.typeValue='';
    }

    addTaskToList(event){
        //first lets check if this.newTask is blank then we should not allow the user to add the task as its empty
        if(this.newTask == ''){return}

        //Make dataLoadProgress true again as we are making it false after initial data load 
        this.dataLoadProgress = true;

        insertNewTask({Description:this.newTask})
        .then(result =>{
            console.log(result)
            this.lstToDoItems.push({
            id:this.lstToDoItems.length+1,
            description:this.newTask,
            status:false,
            recordId: result.Id
        })
        this.newTask = '';
            const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Task Added Successfully',
            variant: 'success',
            mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        })
        .catch(error =>{
            const evt = new ShowToastEvent({
            title: 'Toast Error',
            message: 'Unable to add new task',
            variant: 'error',
            mode: 'dismissable'
        });
            this.dispatchEvent(evt);
        })
        .finally(()=>this.dataLoadProgress = false);
        //finally block will always executed no matter response is success or err so making spinner false 
        //in finally block
        //push function used to add element at end of the array
        //Using Unshift function - we can add task at the beginning of the arry   
    }

    //Method to store the new checklist details for the user. 
    //Each user can have only one checklist record under them.
    createNewCheckList(event){
        //if anyone of the field is empty then simply return do nothing on button click.
        if(this.typeValue == '' || this.newCheckList == ''){return}

        this.dataLoadProgress = true;

        insertNewCheckList({title:this.newCheckList,type:this.typeValue})
        .then(result =>{
            if(result){
                this.isCheckListAvailable = true;
            }else{
                console.log('Unable to create new checklist!!');
            }
            const evt = new ShowToastEvent({
                title: 'Success',
                message: 'New CheckList Created',
                variant: 'success',
                mode: 'dismissable'
                });
                this.dispatchEvent(evt);})
        .catch(error =>{
            const evt = new ShowToastEvent({
            title: 'Toast Error',
            message: 'Unable to Create New CheckList',
            variant: 'error',
            mode: 'dismissable'
        });
            this.dispatchEvent(evt);
        })
        .finally(()=>this.dataLoadProgress = false,
        location.reload());
    }


    deleteTask(event){
        let taskIdToDel = event.target.name;
        let taskIndexToDel;
        let recordIdToDelete;
        // METHOD 1 TO REMOVE TASK FROM THE ARRAY 
        this.dataLoadProgress = true;
        
        for(let i=0;i<this.lstToDoItems.length;i++){
            if(taskIdToDel === this.lstToDoItems[i].id){
                taskIndexToDel = i;
            }
        }
        recordIdToDelete = this.lstToDoItems[taskIndexToDel].recordId;
        //console.log(recordIdToDelete)
        deleteTask({recordId:recordIdToDelete})
        .then(result =>{
              console.log(result)
              //remove task from JS side once we get response from salesforce and task record is deleted successfully from server
              if(result){
                this.lstToDoItems.splice(taskIndexToDel,1);
              }
              else{
                console.log('Unable to delete task!!');
              }
              const evt = new ShowToastEvent({
                title: 'Success',
                message: 'Task Deleted',
                variant: 'success',
                mode: 'dismissable'
                });
                this.dispatchEvent(evt); 
        })
        .catch(error=>{
            const evt = new ShowToastEvent({
            title: 'Toast Error',
            message: 'Unable to delete a task',
            variant: 'error',
            mode: 'dismissable'
        });
            this.dispatchEvent(evt);
        })
        .finally(() => this.dataLoadProgress=false); 

        //Using JS splice function we can replace/remove items from the array
        //Para1 : array index from which we need to remove an element(s)
        //PARA 2 : No of elements to remove from the index passed in PARA 1  
       
        

        // METHOD 2 TO REMOVE TASK FROM THE ARRAY 
        /*this.lstToDoItems.splice(
            this.lstToDoItems.findIndex(function(todoTask){
                return todoTask.id === taskIdToDel;
            }),
            1
        );*/

        //METHOD 3 TO REMOVE TASK FROM THE ARRY IN SINGLE LINE 
        //this.lstToDoItems.splice(this.lstToDoItems.findIndex(toDoTask => toDoTask.id === taskIdToDel),1);
    }

   //@wire(getTasks)
   //lstToDoItems;

   /*
   *    @wire will return data in form of object as below in bind variable i.e lstToDoItems : 
   *    lstToDoItems = {
   *        data : [list of tasks],
   *        error : 'error message'
   *    };
   * 
   *    If we bind property with @wire then it becomes immutable/cant update data in it , so 
   *    in case if we want to update data then bing with the wire method instead
   */

   @wire(getTasks)
   getToDoTasks(response){ 
    this.ToDoTaskResponse = response;
    let data = response.data;
    let err = response.error;

    //To stop spinner if we get data/err response from the wire method / server
    if(data || err){
        this.dataLoadProgress = false;
    }

    //LN:167 - added check if list has element with valid index available in the array then only consider it to generate new Id else 
    // define 0 as new Id for the element as list will be empty

    if(data){
        //console.log(data);
        this.lstToDoItems = [];
        data.forEach(task => {
                this.lstToDoItems.push({
                id : this.lstToDoItems[this.lstToDoItems.length - 1].id + 1 ? this.lstToDoItems[this.lstToDoItems.length - 1].id + 1 : 0,
                description : task.Description__c,
                recordId : task.Id,
                status:task.status__c
             });        
        });
    }else if(err){
         console.log(err);
    }
   }

   //Method will refresh data in browser cache only if there is a change on the server(SF Backend) Side.
   refreshApexData(){
      this.dataLoadProgress = true;
      refreshApex(this.ToDoTaskResponse)
      .finally(() => this.dataLoadProgress = false);
   }

   fetchCheckListDetails(){
    getCheckListDetails()
    .then(result =>{
        console.log('result is'+JSON.stringify(result));
        this.checkListDetail = result;
        this.error = undefined;
        this.isCheckListAvailable = true;
    })
    .catch(error =>{
        console.error('Error in fetching checklist details' + error);
        this.checkListDetail = undefined;
        this.error = error;
    });
   }

   //Get Picklist values for check list type field from Check List object 
   @wire(getPicklistValues,{
    recordTypeId : '012000000000000AAA',
    fieldApiName : CHECKLIST_TYPE
    }) wiredCheckListValues({data,error}){
        if(data){
            console.log('picklist values'+ data);
            this.checkListTypes = data.values;
            this.error = undefined;
        }
        if(error){
             console.log('error in returning picklist values'+ error);
             this.checkListTypes = undefined;
            this.error = error;
        }
    }

    handleCheckListType(event){
        this.typeValue = event.target.value;
        //console.log('selected picklist value is '+this.typeValue);
    }
}