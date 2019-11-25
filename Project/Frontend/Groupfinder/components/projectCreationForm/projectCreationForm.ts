import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import User from '@/types/user.ts';
import axios from 'axios';
import profileForm from '~/components/profileForm/profileForm.vue'

@ Component({
    components: {profileForm}
})
export default class projectCreationForm extends Vue {
    // Data
    profilesList: Array<String> = [];
    form: Object = {
        projectName: "",
        pitch: "",
        category: null
    }
    categories: Array<any> = [{text:"Select One", value: null}, "Website", "Native Application", "Smartphone Application"]
    profile_id: String = ""
    index: Number = 0
    /*
    components: {
        'profileFormComponent': profileForm
    }*/

    created(){
        // this.addProfile();
    }

    // Methods
    addProfile(){
        this.index = this.index.valueOf() + 1
        let new_profile_id = "Profile-" + this.index.toString()
        this.profilesList.push(new_profile_id);
    }

    deleteProfileForm(value: string){
        let index = this.profilesList.indexOf(value, 0)
        if(index > -1){
            this.profilesList.splice(index, 1)
        }
    }
}

