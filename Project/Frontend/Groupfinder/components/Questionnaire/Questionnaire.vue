<template>
<div>
    <b-modal :id="'modal' + id" @hide="onModalClose" ok-only>
        <p>
            Use a questionnaire to ask specific questions to users who want to apply for this profile.
        </p>
        <b-input-group v-for="(question, index) in local_questions" v-bind:key="index" class="mt-3">
            <b-form-input v-model="local_questions[index]" placeholder="Question"></b-form-input>
            <b-input-group-append>
                <b-button @click="deleteQuestion(index)" variant="outline-danger">Delete</b-button>
            </b-input-group-append>
        </b-input-group>

        <b-input-group class="mt-3">
            <b-form-input v-model="inputText" placeholder="Question"></b-form-input>
            <b-input-group-append>
                <b-button @click="addQuestion" variant="primary">Add</b-button>
            </b-input-group-append>
        </b-input-group>

        <template v-slot:modal-footer="{ }">
            <b-dropdown text="Import questions">
                <b-dropdown-item v-for="(questionnaire, index) in userQuestionnaireList" v-bind:key="index" v-model="userQuestionnaireList[index]">
                    {{ questionnaire.name }}
                    <b-button @click="importQuestions(index)">Import</b-button>
                </b-dropdown-item>
            </b-dropdown>
        </template>
    </b-modal>
</div>
</template>

<script lang="ts" src="./Questionnaire.ts">
</script>
