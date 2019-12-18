import ProjectsToUserMatcher from '../ProjectsToUserMatcher';
import ProjectMatch from '../../types/matching/projectMatch';
const db_conn = require('../../databaseconnection');

export default class ProjectsToUserMatcherTest{
    private static async initData(){
        function dbQueryHelper(query: string, params: any[]): Promise<void>{
            return new Promise((resolve: any, reject: any) => {
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if (err){
                        reject();
                    }
                });
                resolve();
            });
        }

        async function addNewUser(id: number, firstName: string, lastName: string, mail: string){
            const query = `
                INSERT INTO user (id, first_name, last_name, mail) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    first_name = ?, 
                    last_name = ?, 
                    mail = ?;
            `;
            let params = [id, firstName, lastName, mail, firstName, lastName, mail];
    
            try{
                dbQueryHelper(query, params);            
            }catch(e){}
        }
    
        async function addNewProject(id: number, creator_id: number, name: string, status: number){
            const query = `
                INSERT INTO project (id, creator_id, name, status) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    creator_id = ?, 
                    name = ?, 
                    status = ?;
            `;
            let params = [id, creator_id, name, status, creator_id, name, status];
    
            try{
                dbQueryHelper(query, params);            
            }catch(e){}            
        }
    
        async function addNewProfile(id: number, name: string, project_id: number){
            /* 
            8000, 'Profile A', 7000
                INSERT INTO profile (id, name, project_id) 
                VALUES (8000, 'Profile A', 7000) 
                ON DUPLICATE KEY UPDATE
                    name = 'Profile A',
                    project_id = 7000;
            */
            const query = `
                INSERT INTO profile (id, name, project_id) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE
                    name = ?,
                    project_id = ?; 
            `;
            let params = [id, name, project_id, name, project_id];
    
            try{
                dbQueryHelper(query, params);            
            }catch(e){}          
        }
    
        async function addNewProfileSkill(profile_id: number, skill_name: string, skill_experience: number, weight: number){
        /*
        8001, 'SKILL BETA', 1, 1
                INSERT INTO profile_skill (profile_id, skill_name, skill_experience, weight)
                VALUES (8001, 'SKILL BETA', 1, 1) 
                ON DUPLICATE KEY UPDATE 
                    skill_name = 'SKILL BETA', 
                    skill_experience = 1, 
                    weight = 1;
        */    
            
            
            const query = `
                INSERT INTO profile_skill (profile_id, skill_name, skill_experience, weight)
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    skill_name = ?, 
                    skill_experience = ?, 
                    weight = ?;
            `;
            let params = [profile_id, skill_name, skill_experience, weight, skill_name, skill_experience, weight];
    
            try{
                dbQueryHelper(query, params);            
            }catch(e){}        
        }
    
        async function addNewUserSkill(user_id: number, skill_name: string, skill_experience: number){
            const query = `
                INSERT INTO user_skill (user_id, skill_name, skill_experience)
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    skill_name = ?, 
                    skill_experience = ?;
            `;
            let params = [user_id, skill_name, skill_experience, skill_name, skill_experience];
    
            try{
                dbQueryHelper(query, params);            
            }catch(e){}        
        }

        // users (id, firstName, lastName, mail)
        await addNewUser(6000, 'testUser1', '1', 'testUser1@test.com');
        await addNewUser(6001, 'testUser2', '2', 'testUser2@test.com');
        
        // projects (id, creator_id, name, status)
        await addNewProject(7000, 6000, 'testProject1', 0); // testUser1 (6000)
        
        // profiles (id, name, project_id)
        await addNewProfile(8000, 'Profile A', 7000); // testProject1 (7000)
        await addNewProfile(8001, 'Profile B', 7000);
        await addNewProfile(8002, 'Profile C', 7000);
        
        // profile skills (profile_id, skill_name, skill_experience, weight)
        await addNewProfileSkill(8000, 'SKILL ALPHA', 1, 1);  // Profile A
        await addNewProfileSkill(8000, 'SKILL BETA', 1, 1);
        await addNewProfileSkill(8000, 'SKILL TETA', 1, 1);
        
        await addNewProfileSkill(8001, 'SKILL BETA', 1, 1);  // Profile B
        await addNewProfileSkill(8001, 'SKILL TETA', 1, 1);
        await addNewProfileSkill(8001, 'SKILL YETA', 1, 1);
        
        await addNewProfileSkill(8002, 'SKILL GIGA', 1, 1);  // Profile C
        await addNewProfileSkill(8002, 'SKILL MEGA', 1, 1);
        
        // user Skills
        await addNewUserSkill(6001, 'SKILL ALPHA', 1);  // testUser2
        await addNewUserSkill(6001, 'SKILL BETA', 1);
        await addNewUserSkill(6001, 'SKILL TETA', 1);   
    }

    /**
     * retuns msg and msgToIndent concatenated by a newline and each line of msgToIndent is indented by a tab
     * @param msg: msg on first line
     * @param msgToIndent: msg beneath 'msg' that is indented by a tab
     */
    private static concatAndIndent(msg: string, msgToIndent: string): string{
        let result: string = msg + '\n'; // the message to be indented must start from the next line
        let lines: string[] = msgToIndent.split(/\r?\n/); // separate the string into strings delimitted by a newline character

        for (let line of lines){
            result += '    ' + line + '\n'; // indent the line, concat it with the result and end it with a newline
        }

        return result;
    }

    /**
     * Helper function, executes msgToIndentFunction() to get msgToIndent parameter
     * @param msg 
     * @param msgToIndentFunction 
     */
    private static concatAndIndentHelper(msg: string, msgToIndentFunction: () => string): string{
        return this.concatAndIndent(msg, msgToIndentFunction());
    }

    /**
     * Helper function, executes msgToIndentFunction() to get msgToIndent parameter
     * @param msg 
     * @param msgToIndentFunction 
     */
    private static async concatAndIndentHelperAsync(msg: string, msgToIndentFunction: () => Promise<string>): Promise<string>{
        return this.concatAndIndent(msg, await msgToIndentFunction());
    }

    /**
     * Returns a string for the testcase, 
     *      - if Object.is(value1, value2) is true: return 
     * @param value1 
     * @param value2 
     */
    private static equalsHelper(value1: any, value2: any, prefix: string = ''): string{
        if (Object.is(value1, value2)){
            return prefix + 'SUCCESS\n';
        }
        else{
            return prefix + 'FAILED\n';
        }
    }

   public static executeTests(): Promise<void>{
        return new Promise(async (resolve: any, reject: any) => {
            console.log('##################################################################################################')

            await this.initData();
            
            let results: string = await this.concatAndIndentHelperAsync('Testing class ProjectsToUserMatcher', async () => {
                return await this.concatAndIndentHelperAsync('Testing function getMatchingProjects(userID, dbconn)', async () => {
                    return await this.concatAndIndentHelperAsync('[1] Matching % calculation', async () => {                            
                        try{
                            // matchingResult: Array<ProjectMatch>
                            let matchingResult: Array<ProjectMatch> = await ProjectsToUserMatcher.getMatchingProjects(6001, db_conn);
                            let resultingMsg: string = '';

                            // There must be results
                            if (matchingResult.length === 0){
                                resultingMsg = '[1.0] FAILED: no matches returned';
                            }
                            else{
                                // Check matching % with Profiles 
                                const profileMatches = matchingResult[0].matches;
                                
                                // 0% because testUser2 has none of the required skills for profileC
                                resultingMsg += this.equalsHelper(profileMatches[0].matchingPercentile, 100, '[1.1] ');

                                // must be 67% (rounded up) because the testUser2 has 2 of the required skills for profileB
                                resultingMsg += this.equalsHelper(profileMatches[1].matchingPercentile, 67, '[1.2] ');

                                // 0% because testUser2 has none of the required skills for profileC
                                //resultingMsg += this.equalsHelper(profileMatches[2].matchingPercentile, 0, '[1.3] ');
                            }

                            return resultingMsg;
                        }catch(err){
                            return '!FAILED TO EXECUTE TESTS SUCCESSFULLY: ' + err.toString();
                        }
                    });
                });
            });
            
            console.log(results);
            resolve();
            console.log('##################################################################################################')

        });
    }
}

/*
describe('Testing class ProjectsToUserMatcher', () => {
    describe('Testing function getMatchingProjects(userID, dbconn)', () => {
        describe('[1] Matching % calculation', () => {
            test('Matching % proportional to # of matching skills', async () => {
                // result: Array<ProjectMatch>
                const result = await ProjectsToUserMatcher.getMatchingProjects(6001, db_conn);
                
                // There must be results
                expect(result.length).toBeGreaterThan(0); 

                // Check matching % with Profiles 
                const profileMatches = result[0].matches;
                expect(profileMatches[0].matchingPercentile).toBe(100); // must be 100% because the testUser2 has all required skills for profileA
                expect(profileMatches[1].matchingPercentile).toBe(67); // must be 67% (rounded up) because the testUser2 has 2 of the required skills for profileB
                expect(profileMatches[2].matchingPercentile).toBe(0); // 0% because testUser2 has none of the required skills for profileC
            });
        });
    });
});

*/