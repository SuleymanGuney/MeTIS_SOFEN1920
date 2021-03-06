import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import UserData from '../../components/UserData/UserData';
import ProjectsOfUser from '../../components/ProjectsOfUser/ProjectsOfUser';
import SkillsOfUser from '../../components/SkillsOfUser/SkillsOfUser';
import User from '../../types/user';
import axios from 'axios';
import api from '@/helpers/Api';

@Component({
    components: {
        UserData,
        ProjectsOfUser,
        SkillsOfUser
    }
})
export default class UserPage extends Vue {
    // DATA
    private user: User|null = null;
    

    // LIFECYCLE HOOKS
    private async created(){
        try{
            let url = api(`users/${this.$route.params.id}`);
            const response = await this.$axios.get(url);
            //const response = await this.$axios.get(`http://localhost:4000/users/${this.$route.params.id}`);
            this.user = response.data.user;
        } catch (err) {
            console.log(err);
        }
    }
}
