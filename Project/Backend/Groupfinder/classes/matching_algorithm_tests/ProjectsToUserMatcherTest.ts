import ProjectsToUserMatcher from '../ProjectsToUserMatcher';
import ProjectMatch from '../../types/matching/projectMatch';
import SimpleDBInterface from './SimpleDBInterface';
const db_conn = require('../../databaseconnection');

/**
 * import this class somewhere and do the following to execute the tests:
 * 
try{
    await ProjectsToUserMatcherTest.executeTests();
}catch(e){
            reject('Test failed');
} 
 */

export default class ProjectsToUserMatcherTest{
    private static async initData(){
        let db = new SimpleDBInterface(db_conn);

        // users (id, firstName, lastName, mail)
        await db.insertNewUser(6000, 'testUser1', '1', 'testUser1@test.com');
        await db.insertNewUser(6001, 'testUser2', '2', 'testUser2@test.com');
        
        // projects (id, creator_id, name, status)
        await db.insertNewProject(7000, 6000, 'testProject1', 0); // testUser1 (6000)
        
        // profiles (id, name, project_id)
        await db.insertNewProfile(8000, 'Profile A', 7000); // testProject1 (7000)
        await db.insertNewProfile(8001, 'Profile B', 7000);
        await db.insertNewProfile(8002, 'Profile C', 7000);
        await db.insertNewProfile(8003, 'Profile weight1', 7000);
        await db.insertNewProfile(8004, 'Profile experience1', 7000);
        await db.insertNewProfile(8005, 'Profile matching perc all', 7000);

        // profile skills (profile_id, skill_name, skill_experience, weight)
        await db.insertNewProfileSkill(8000, 'SKILL ALPHA', 1, 1);  // Profile A
        await db.insertNewProfileSkill(8000, 'SKILL BETA', 1, 1);
        await db.insertNewProfileSkill(8000, 'SKILL TETA', 1, 1);
        
        await db.insertNewProfileSkill(8001, 'SKILL BETA', 1, 1);  // Profile B
        await db.insertNewProfileSkill(8001, 'SKILL TETA', 1, 1);
        await db.insertNewProfileSkill(8001, 'SKILL YETA', 1, 1);
        
        await db.insertNewProfileSkill(8002, 'SKILL GIGA', 1, 1);  // Profile C
        await db.insertNewProfileSkill(8002, 'SKILL MEGA', 1, 1);

        await db.insertNewProfileSkill(8003, 'SKILL ALPHA', 1, 4);  // Profile Weight1
        await db.insertNewProfileSkill(8003, 'SKILL KILO', 1, 1);
        await db.insertNewProfileSkill(8003, 'SKILL TETA', 1, 2);

        await db.insertNewProfileSkill(8004, 'SKILL EPSILON', 7, 1);  // Profile experience1
        await db.insertNewProfileSkill(8004, 'SKILL SIGMA', 5, 1);
        await db.insertNewProfileSkill(8004, 'SKILL PI', 5, 1);
        
        await db.insertNewProfileSkill(8005, 'SKILL LAMBDA', 7, 5);  // Profile matching perc all
        await db.insertNewProfileSkill(8005, 'SKILL ALPHA', 2, 2); 
        await db.insertNewProfileSkill(8005, 'SKILL TETA', 3, 4); 
        await db.insertNewProfileSkill(8005, 'SKILL SIGMA', 3, 3); 

        // user Skills
        await db.insertNewUserSkill(6001, 'SKILL ALPHA', 1);  // testUser2
        await db.insertNewUserSkill(6001, 'SKILL BETA', 1);
        await db.insertNewUserSkill(6001, 'SKILL TETA', 1);   
        await db.insertNewUserSkill(6001, 'SKILL EPSILON', 5);   
        await db.insertNewUserSkill(6001, 'SKILL SIGMA', 3);   
        await db.insertNewUserSkill(6001, 'SKILL PI', 5);   
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

    /**
     * Checks whether given list of matches is sorted
     * @param matches: array of project matches
     */
    private static isSorted(projectMatches: Array<ProjectMatch>): boolean{
        for (let i = 0; i < (projectMatches.length-1); i++){ // matches.length -1 because we need to ensure there is a next elem
            // projects must be sorted in descending order according on their biggest matching percentage
            if (projectMatches[i].matches[0].matchingPercentile < projectMatches[i+1].matches[0].matchingPercentile){
                return false;
            }

            const currentProjectMatches = projectMatches[i].matches;
            for (let j = 0; j < (currentProjectMatches.length - 1); j++){
                // profiles must be sorted in descending order
                if (currentProjectMatches[j].matchingPercentile < currentProjectMatches[j+1].matchingPercentile){
                    return false;
                }
            }
        }
        
        return true;
    }

   public static executeTests(): Promise<void>{
        return new Promise(async (resolve: any, reject: any) => {
            await this.initData();
            
            let results: string = await this.concatAndIndentHelperAsync('Testing class ProjectsToUserMatcher', async () => {
                return await this.concatAndIndentHelperAsync('Testing function getMatchingProjects(userID, dbconn)', async () => {
                    return await this.concatAndIndentHelperAsync('[1] Matching % calculation', async () => {                            
                        try{
                            // matchingResult: Array<ProjectMatch>
                            let matchingResult: Array<ProjectMatch> = await ProjectsToUserMatcher.getMatchingProjects(6001, db_conn);
                            let resultingMsg: string = '';

                            // there must be results
                            if (matchingResult.length === 0){
                                resultingMsg = 'FAILED: no matches returned';
                            }
                            else{
                                // check sorting order
                                if (this.isSorted(matchingResult)){
                                    resultingMsg += '[1.0] SUCCESS\n';
                                }
                                else{
                                    resultingMsg += '[1.0] FAILED\n';
                                }

                                // check matching % with Profiles 
                                const profileMatches = matchingResult[0].matches;

                                // 0% because testUser2 has none of the required skills for profileC
                                resultingMsg += this.equalsHelper(profileMatches[0].matchingPercentile, 100, '[1.1] ');

                                // must be 67% (rounded up) because the testUser2 has 2 of the required skills for profileB
                                resultingMsg += this.equalsHelper(profileMatches[3].matchingPercentile, 67, '[1.2] ');

                                // 0% because testUser2 has none of the required skills for profileC
                                //resultingMsg += this.equalsHelper(profileMatches[2].matchingPercentile, 0, '[1.3] ');

                                // test weights, 3 of the 3 skills match, weights differ: matching weights are 2 and 4, skill with weight 1 doesn't match
                                // result must be: (4+2)/(4+2+1) = 6/7 = 86% (round up)
                                resultingMsg += this.equalsHelper(profileMatches[1].matchingPercentile, 86, '[1.3] ');

                                // matching percentage must be proportional to the ration of possessed skill/required skill
                                // profile experience 1 matching percentage: (5/7 + 3/5 + 5/5) / 3  = 78%
                                resultingMsg += this.equalsHelper(profileMatches[2].matchingPercentile, 78, '[1.4] ');

                                // all at once: Profile matching perc all
                                // (1 + (1/3)*4 + 3) / (5+2+4+3) = (4 + 4/3) / 14 = 39%
                                resultingMsg += this.equalsHelper(profileMatches[4].matchingPercentile, 39, '[1.5] ');
                                
                                // If all tests pass that means all expected profiles came in the expected indexes which means the correct profiles and projects are returned
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