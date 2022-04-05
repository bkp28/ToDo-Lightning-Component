/*
    Created by : Bhavik Pandya
    Created Date : 4th April,2022
    Class Name : CheckListController
    Description : This class will contain aura enabled methods to work with checklist LWC.
*/

public with sharing class CheckListController {
   
    //Method to retrieve checklist items
    @AuraEnabled(cacheable=true)
    public static List<CheckList_Item__c> getTasks(){
       return [select Id,Task_Description__c,Task_Status__c from CheckList_Item__c
        where CheckList_Detail__c != null and CheckList_Detail__r.OwnerId =: UserInfo.getUserId()];
    }

     //Method to retrieve checkList Details
    @AuraEnabled
    public static CheckList_Detail__c getCheckListDetails(){
        return [select Id,CheckList_Name__c,CheckList_Type__c from CheckList_Detail__c
        where OwnerId =: UserInfo.getUserId() LIMIT 1];
    }

    //Method to insert new checklist item
    @AuraEnabled
    public static CheckList_Item__c insertNewTask(String Description){
        try {
            CheckList_Detail__c chkListObj = getCheckListDetails();
            
            CheckList_Item__c task = new CheckList_Item__c(
                Task_Description__c = Description,
                CheckList_Detail__c = chkListObj.Id,
                Task_Status__c = false
            );

            insert task;

            return task;
        } catch (Exception e) {
            System.debug(e.getMessage());
        }
        return null;
    }

    //Method to delete individual checklist item
    @AuraEnabled
    public static Boolean deleteTask(Id recordId){
        try {
            Database.delete(recordId);
            return true;
        } catch (Exception e) {
            System.debug(e.getMessage());
        }
        return false;
    }

    //Method to insert new checklist detail
    @AuraEnabled
    public static Boolean insertNewCheckList(String title,String type){
        try {
             CheckList_Detail__c chkListObj = new CheckList_Detail__c(
                CheckList_Name__c = title,
                CheckList_Type__c = type,
                OwnerId = UserInfo.getUserId()
            );

            insert chkListObj;
            return true;
        } catch (Exception e) {
            System.debug(e.getMessage());
        }
        return false;
    }
}
