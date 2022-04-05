public with sharing class TaskController {

    //musct keep cacheable = true when using @wire decorator as it will try to optimize the performance by looking 
    //for the data into cache first and then go for control to fetch from server
    @AuraEnabled(cacheable=true)
    public static List<Task__c> getTasks(){
       return [select Id,Description__c,status__c from Task__c 
                where Check_List__c!= null and Check_List__r.OwnerId =: UserInfo.getUserId()];
    }

    @AuraEnabled
    public static Task__c insertNewTask(String Description){
        try {
            Check_List__c chkListObj = getCheckListDetails();
            
            Task__c task = new Task__c(
                Description__c = Description,
                Check_List__c = chkListObj.Id,
                status__c = false
            );

            insert task;

            return task;
        } catch (Exception e) {
            
        }
        return null;
    }

    @AuraEnabled
    public static Check_List__c getCheckListDetails(){
        return [select Id,Check_List_Name__c,Check_List_Type__c from Check_List__c where OwnerId =: UserInfo.getUserId() LIMIT 1];
    }

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
    
    @AuraEnabled
    public static Boolean insertNewCheckList(String title,String type){
        try {
             Check_List__c chkListObj = new Check_List__c(
                Check_List_Name__c = title,
                Check_List_Type__c = type,
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
