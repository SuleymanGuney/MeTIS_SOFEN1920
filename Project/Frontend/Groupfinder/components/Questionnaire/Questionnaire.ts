import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import Questionnaire from '~/types/questionnaire';

@ Component
export default class Questionnaire_Component extends Vue {
    @Prop({default: {}}) id: Boolean;
    @Prop({default: {}}) questions: string[];
    @Prop({default: {}}) userQuestionnaireList: Questionnaire[] = [];

    // Data
    // This list will contain all the questions and their id's
    // questionsList: Array<String> = [];
    inputText: string = "";

    /**
     * Import the questions of another questionnaire
     * @param questionnaire_index the index of the questionnaire in userQuestionnaireList that has to be imported
     */
    importQuestions(questionnaire_index: number){
        console.log(this.userQuestionnaireList[questionnaire_index].questions);
        this.questions = this.questions.concat(this.userQuestionnaireList[questionnaire_index].questions);
        this.$forceUpdate();
    }

    addQuestion(){
        let value: string = this.inputText;
        // Check if the question is already asked or if the question is emty
        if (this.questions.indexOf(value) <= -1 && value !== "" && value){
            this.questions.push(value);

            this.clearInputText();
        }
    }

    deleteQuestion(index: number){
        this.questions.splice(index, 1);
    }

    clearInputText(){
        this.inputText = "";
    }

    modalId(){
        return 'modal' + this.id;
    }

    created(){
    }
}
