import { LightningElement, api, track} from 'lwc';
import {
    FlowAttributeChangeEvent,
    FlowNavigationNextEvent,
} from 'lightning/flowSupport';

export default class LwcDemo2 extends LightningElement {
    @api
    availableActions = [];

    @api
    get todos() {
        return this._todos;
    }

    set todos(todos = []) {
        this._todos = [...todos];
    }

    @track _todos = [];

    get todosList() {
        return this._todos.map((todo) => {
            return { text: todo, id: Date.now().toString() };
        });
    }

    get hasTodos() {
        return this._todos && this._todos.length > 0;
    }

    handleUpdatedText(event) {
        this._text = event.detail.value;
    }

    handleAddTodo() {
        this.template.querySelector('.toDoInput').value="";
        this._todos.push(this._text);
        
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            'todos',
            this._todos
            
        );
        
        this.dispatchEvent(attributeChangeEvent);

    }

}