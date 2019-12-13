import ProfileUserMatch from '../types/matching/profileUserMatch';
import Profile from '../types/profile';
import UserMatch from '../types/matching/userMatch';
import ProfileSkill from '../types/profileSkill';
import User from '../types/user';
import UserSkill from '../types/userSkill';

export default class UsersToProjectMatcher{

    /**
     * Returns table with columns:
     *     profile_id	profile_name	profile_skill_name	profile_skill_experience	skill_weight	user_id	first_name	last_name	user_skill_experience
     * 
     * The rows are sorted by profile then by name, so per profile you first get all rows of one user with matching skills then
     * you get the rows of for the same profile (if there are users left) the rows of the next user with matching skills. Example:
     *
     * -----------------------------------------------------------------------------------------------------------------------
     * |profile_id  profile_name                profile_skill_name  user_id first_name  last_name   user_skill_experience    |
     * -----------------------------------------------------------------------------------------------------------------------
     * |6	        Software engineer windows	AGILE	   	        6	    Robert	    Louwes	    5                        |
     * |6	        Software engineer windows	C++	       	        6	    Robert	    Louwes	    7                        |
     * |6	        Software engineer windows	AGILE	   	        5	    Willem	    Kreijkes	5                        |
     * |6	        Software engineer windows	C++	       	        5	    Willem	    Kreijkes	7                        |
     * |7	        Software engineer linux	    C++	       	        6	    Robert	    Louwes	    7                        |
     * |7	        Software engineer linux	    Linux OS	        6	    Robert	    Louwes	    3                        |
     * |7	        Software engineer linux	    AGILE	   	        6	    Robert	    Louwes	    5                        |
     * |7	        Software engineer linux	    AGILE	   	        5	    Willem	    Kreijkes	5                        |
     * |7	        Software engineer linux	    C++	       	        5	    Willem	    Kreijkes	7                        |
     * -----------------------------------------------------------------------------------------------------------------------
     */
    private static queryMatchingUserSkills: string = `
        select project_skills.*, user_skills.user_id, first_name, last_name, user_skills.user_skill_experience
        from
            (
                select profile.id profile_id, profile.name profile_name, prosk.skill_name profile_skill_name, prosk.skill_experience profile_skill_experience, prosk.weight skill_weight
                  from project, profile, profile_skill prosk
                  where prosk.profile_id = profile.id
                      and profile.project_id = project.id
                      and project.id = ?
                  order by profile_id
            ) as project_skills
            inner join
            (
                select user.id user_id, concat(user.first_name, ' ', user.last_name) user_name, skill_name  user_skill_name, skill_experience user_skill_experience, user.first_name, user.last_name
                  from user join user_skill on user_skill.user_id = user.id 
            ) user_skills
            on project_skills.profile_skill_name = user_skills.user_skill_name
        order by profile_id, user_name
    `;

    /**
     * Returns all profiles along with all profile_skills of one project
     */
    private static queryProjectSkills: string = `
        select profile.id profile_id, profile.name profile_name, prosk.skill_name profile_skill_name, prosk.skill_experience profile_skill_experience, prosk.weight skill_weight
        from project, profile, profile_skill prosk
        where prosk.profile_id = profile.id
            and profile.project_id = project.id
            and project.id = ?
        order by profile_id
    `;

    /**
     * Creates a Profile object and returns it
     * @param id 
     * @param name 
     * @param projectID 
     */
    private static createNewProfile(id: number, name: string, projectID: number): Profile{
        return {
            id: id,
            name: name,
            project_id: projectID
        }
    }

    /**
     * Returns a User object
     * @param userID 
     * @param firstName 
     * @param lastName 
     */
    private static createNewUser(userID: number, firstName: string, lastName: string): User{
        let user: User = {
            id: userID,
            first_name: firstName,
            last_name: lastName,
            mail: '',
            address: '',
            zip: '',
            city: '',
            tel: '',
            website: '',
            social_media: ''
        }
        return user;
    }

    /**
     * Makes a list of (profile, profile_skills) elements where profile is a profile object
     * and profile_skills is a list of corresponding skills.
     * @param rows: result of the query queryProjectSkills
     * @param projectID: ID of the project the profiles (in rows) belong to
     * @returns as described above
     */
    private static preprocessProfileSkills(rows: any, projectID: number): Array<{profile: Profile, skills: Array<ProfileSkill>}>{
        // Got profile and skill rows of the project, preprocess the rows into a list.
        // The list contains elements each having a profile and a list of skills.
        let cumulatedSkills: Array<ProfileSkill> = [];
        let profiles: Array<{profile: Profile, skills: Array<ProfileSkill>}> = [];
        let currentProdileID: number = null; // this is used to check if a new profile has been encountered

        // assign first profile id
        if (rows.length > 0){
            currentProdileID = rows[0].profile_id;
        }

        // Rows are sorted by profile, so collect all profile skills and when you encounter a new profile
        // add old profile and collected skills into the list profiles.
        for (let i = 0; i < rows.length; i++){
            // check if current profile is a new one
            if (currentProdileID !== rows[i].profile_id){
                // At this point i must be at least 1 because currentProfileID is initially set
                // to the profile id in the first row so the if statement above is going to be 
                // always false in the first iteration. Therefore we can check rows[i-1] without
                // a problem.

                // add current profile and reset cumulatedSkills
                let newProfile: Profile = this.createNewProfile(rows[i-1].profile_id, rows[i-1].profile_name, projectID); 

                // add profile to list
                profiles.push({profile: newProfile, skills: cumulatedSkills});

                // reset cumulated skills and update current id
                cumulatedSkills = [];
                currentProdileID = rows[i].profile_id;
            }

            // add current skill to cumulated skills
            let newProfileSkill: ProfileSkill = {
                name: rows[i].profile_skill_name,
                experience: rows[i].profile_skill_experience,
                weigth: rows[i].skill_weight
            }

            cumulatedSkills.push(newProfileSkill);
        }

        // if there are some unadded skills, make a profile for those and add it
        if (cumulatedSkills.length > 0){
            // make a profile with the information in the last row
            let lastIndex = rows.length - 1;
            let newProfile: Profile = this.createNewProfile(rows[lastIndex].profile_id, rows[lastIndex].profile_name, projectID); 
            profiles.push({profile: newProfile, skills: cumulatedSkills});
            cumulatedSkills = []; // reset so that the last added list cannot be accidentally edited after this
        }

        return profiles;
    }

    /**
     * Creates a MatchingUserSkill object from the given rows.
     * @param userRows: rows about 1 user whose skills match with a profiles' skills, each row represents a matching user skill.
     * @pre userRows must contain all data about a user and profile skills that match with the users' skills
     * @ pre userRows.length > 0 
     */
    private static createMatchingUserSkill(userRows: any): MatchingUserSkill{
        let matchingUserSkill: MatchingUserSkill = {
            user: this.createNewUser(userRows[0].user_id,userRows[0].first_name,userRows[0].last_name),
            matchingSkills: []
        }

        // create a skill out of each row and add it to matchingUserSkill.matchingSkills
        for (let i in userRows){
            let userSkill: UserSkill = {
                name: userRows[i].profile_skill_name,
                experience: userRows[i].user_skill_experience
            }
            matchingUserSkill.matchingSkills.push(userSkill);
        }

        return matchingUserSkill;
    }

    /**
     * Creates a MatchingUserProfileSkill from the given rows about a specific profile.
     * @param profileRows rows of data of 1 profile
     * @param projectID id of project that owns the profile (profile on which these rows belong to)
     * @pre The rows must contain only data about 1 profile and all rows of that profile must be included,
     *      otherwise the result will be incorrect.
     * @pre rows.length > 0
     */
    private static createMatchingUserProfileSkill(profileRows: any, projectID: number): MatchingUserProfileSkill{
        let result: MatchingUserProfileSkill = {
            profile: this.createNewProfile(profileRows[0].profile_id, profileRows[0].profile_name, projectID),
            users: []
        }
        
        // separate rows of each user and create a MatchingUserSkill for each set of rows, then add those to
        // result.users
        let userRows: Array<any> = [];
        for (let i = 0; i < profileRows.length; i++){
            // if current row is of a different user
            if (userRows.length > 0 && userRows[userRows.length-1].user_id != profileRows[i].user_id){
                // encountered a new user row, make a MatchingUserSkill object of the collected rows
                // and reset cumulated rows
                result.users.push(this.createMatchingUserSkill(userRows));
                userRows = []; // reset
            }

            // add current row to userRows
            userRows.push(profileRows[i]);
        }

        // if there are userRows left, add those too
        if (userRows.length > 0){
            result.users.push(this.createMatchingUserSkill(userRows));
            userRows = []; // reset
        }

        return result;
    }

    /**
     * Returns a list of MatchingUserProfileSkill objects (contains a profile with a list of users 
     * that have matching skills with the profile).
     * @param rows 
     * @param projectID 
     */
    private static preprocessUserSkills(rows: any, projectID: number): Array<MatchingUserProfileSkill>{
        // First separate each profile rows such that each set contains exactly all rows of one profile. (1 set of rows / profile)
        let profileRows: Array<any> = [];
        let preprocessedProfiles: Array<MatchingUserProfileSkill> = [];

        // cumulate rows of the same profile, when all rows of a profile are collected create a 
        // MatchingUserProfileSkill and add it to the result (preprocessedProfiles)
        for (let i = 0; i < rows.length; i++){
            // check if current profile is a new one
            if (profileRows.length > 0 && profileRows[profileRows.length-1].profile_id !== rows[i].profile_id){
                // create a MatchingUserProfileSkill object and save it
                preprocessedProfiles.push(this.createMatchingUserProfileSkill(profileRows, projectID));
                profileRows = [] // reset because a new profile has occured
            }

            // add current row to list
            profileRows.push(rows[i]);
        }

        // add the remaining profile if any
        if (profileRows.length > 0){
            preprocessedProfiles.push(this.createMatchingUserProfileSkill(profileRows, projectID));
            profileRows = [] // reset
        }

        return preprocessedProfiles;
    }

    /**
     * 
     * @param projectID 
     * @param dbconn 
     */
    //Promise<Array<ProfileUserMatch>>
    static getMatchingUsers(projectID: number, dbconn: any): Promise<any>{
        return new Promise((resolve: any, reject: any) => {
            const paramsProjectSkills: any[] = [projectID];
            dbconn.query(this.queryProjectSkills, paramsProjectSkills, async (err: any, rows: any) => {
                if (err) {
                    console.log(`Error while fetching matching projects from the database.\n${err}`);
                    reject("500");
                } else {
                    let projectProfiles: Array<{profile: Profile, skills: Array<ProfileSkill>}> = this.preprocessProfileSkills(rows, projectID);
                    
                    // execute the query to get the user skills that match with the profile skills
                    const paramsMatchingUserSkills: any[] = [projectID];
                    dbconn.query(this.queryMatchingUserSkills, paramsMatchingUserSkills, async (err: any, userSkillRows: any) => {
                        if (err) {
                            console.log(`Error while fetching matching projects from the database.\n${err}`);
                            reject("500");
                        } else {
                            let userSkillsPerProfile: Array<MatchingUserProfileSkill> = this.preprocessUserSkills(userSkillRows, projectID);
                            resolve(userSkillsPerProfile)
                        }
                    });

                }
            });
        });
    }
}

interface MatchingUserProfileSkill{
    profile: Profile,
    users: Array<MatchingUserSkill>
}

interface MatchingUserSkill{
    user: User,
    matchingSkills: Array<UserSkill>
}