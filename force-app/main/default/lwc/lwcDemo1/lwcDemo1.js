import { LightningElement,api } from 'lwc';
export default class LwcDemo1 extends LightningElement {
    
    firstName='';
    LastName='';
    age='';
    @api salary = '';
    showSalary = false;

    handleName(event){
        const val = event.target.name;

        if(val=='firstName'){
            this.firstName = event.target.value
        }else if(val=='LastName'){
            this.LastName = event.target.value
        }
    }

    handleAge(event){
        this.age=event.target.value;
    }

    get uppercasedFullName(){
        return `${this.firstName} ${this.LastName}`.toUpperCase();
    }

    handleSalaryDetails(event){
        //console.log(event.target.checked)
        this.showSalary = event.target.checked;
        this.salary = '500000000';
    }
}