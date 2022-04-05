/*
    Created by : Bhavik Pandya
    Created Date : 4th April,2022
    Class Name : CheckListControllerTest
    Description : Test class for CheckListController class.
*/

@isTest
public with sharing class CheckListControllerTest {
    @TestSetup
    static void makeData(){
    
        //Insert CheckList Detail 
        CheckList_Detail__c chkListDetailSo = new CheckList_Detail__c();
        chkListDetailSo.CheckList_Name__c = 'Test CheckList';
        chkListDetailSo.CheckList_Type__c = 'Travel';
        insert chkListDetailSo;

        //Insert CheckList item details
        List<CheckList_Item__c> lstCheckListItems = new List<CheckList_Item__c>();
        
        CheckList_Item__c chkListItemSo1 = new CheckList_Item__c();
        chkListItemSo1.CheckList_Detail__c = chkListDetailSo.Id;
        chkListItemSo1.Task_Description__c = 'Task1';
        chkListItemSo1.Task_Status__c = true;

        CheckList_Item__c chkListItemSo2 = new CheckList_Item__c();
        chkListItemSo2.CheckList_Detail__c = chkListDetailSo.Id;
        chkListItemSo2.Task_Description__c = 'Task2';
        chkListItemSo2.Task_Status__c = false;

        lstCheckListItems.add(chkListItemSo1);
        lstCheckListItems.add(chkListItemSo2);
        insert lstCheckListItems;
    }  
    
    @isTest 
    static void getTasksTest(){
        Test.startTest();
            List<CheckList_Item__c> tasks = CheckListController.getTasks();
        Test.stopTest();
        System.assertEquals(2,tasks.size(),'Total tasks should be 2');
    }

    @isTest 
    static void getCheckListDetailsTest(){
        Test.startTest();
            CheckList_Detail__c checkListDetail = CheckListController.getCheckListDetails();
        Test.stopTest();
        System.assertEquals('Test CheckList',checkListDetail.CheckList_Name__c,'correct checklist name check');
    }

    @isTest 
    static void insertNewTaskTest(){
        
        Test.startTest();

        CheckList_Detail__c chkListDetailSo1 = new CheckList_Detail__c();
        chkListDetailSo1.CheckList_Name__c = 'Test CheckList 1';
        chkListDetailSo1.CheckList_Type__c = 'Music';
        insert chkListDetailSo1;

        CheckList_Item__c chkListItemObj = CheckListController.insertNewTask('Task3');

        Test.stopTest();

        List<CheckList_Item__c> chkListItems = [select Id from CheckList_Item__c];
        System.assertEquals(3,chkListItems.size(),'size should be 3');
    }

    @isTest 
    static void insertNewCheckListTest(){
        Test.startTest();
        Boolean isInserted = CheckListController.insertNewCheckList('Test checkList A','Travel');
        Test.stopTest();
        System.assertEquals(true,isInserted,'record should return true');
    }

    @isTest 
    static void deleteTaskTest(){
        Test.startTest();

        List<CheckList_Item__c> itemToDelete = [select Id from CheckList_Item__c
        where Task_Description__c='Task1' LIMIT 1];

        Id deleteRecordId = itemToDelete[0].Id;
        Boolean isDeleted = CheckListController.deleteTask(deleteRecordId);
        Test.stopTest();
        System.assertEquals(true,isDeleted,'record should return true');
    }
}
