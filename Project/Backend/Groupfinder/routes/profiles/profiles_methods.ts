const db_conn = require('../../databaseconnection');
import Profile from '../../types/profile';


/**
 * Get all profiles of a project.
 * @param projectID search for all profiles of the project with projectID as ID 
 */
function getProjectProfiles(projectID: number): Promise<Profile[]> {
    return new Promise(
        (resolve, reject) => {
            const query: string = 'SELECT * FROM profile WHERE project_id=?;';
            const params: any[] = [projectID];
            db_conn.query(query, params, (err: any, rows: any) => {
                if (err) {
                    console.log(err);
                    reject("500");
                } else {
                    let profiles: Profile[] = [];
                    for (let i=0; i < rows.length; i++){
                        let profile: Profile = {
                            id: rows[i].id,
                            name: rows[i].name,
                            project_id: projectID
                        }
                        profiles.push(profile);
                    }
                    resolve(profiles);
                }
            });
        }
    );
}


/**
 * Update existing profile in the database.
 * @param profileID the id of the profile to be updated
 * @param profile new data of the profile
 */
function updateProfile(profileID: number, profile: Profile): Promise<void> {
    return new Promise(
        (resolve: any, reject: any) => {
            const query: string = 'UPDATE profile SET name=?, project_id=? WHERE id=?;';
            const params: any[] = [profile.name, profile.project_id, profileID];
            db_conn.query(query, params, (err: any, rows: any) => {
                if (err) {
                    console.log(err);
                    reject('500');
                } else {
                    resolve();
                }
            });
        }
    );
}


/**
 * Insert a new profile into the database.
 * @param profile the profile that has to be added into the database.
 * @returns the new id of the profile.
 */
function addProfile(profile: Profile): Promise<number> {
    return new Promise(
        (resolve: any, reject: any) => {
            const query: string = 'INSERT INTO profile (name, project_id) VALUES (?,?);';
            const params: any[] = [profile.name, profile.project_id];
            db_conn.query(query, params, async (err: any, rows: any) => {
                if (err) {
                    console.log(err);
                    reject('500');
                } else {
                    try{
                        const newID: number = await getProfileID(profile);
                        resolve(newID);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        }
    );
}


/**
 * Delete a profile from the database.
 * @param profileID the id of the profile to be deleted
 */
function deleteProfile(profileID: number): Promise<void>{
    return new Promise(
        (resolve:any, reject:any) => {
            const query: string = "DELETE FROM profile WHERE id=?;";
            const params: any[] = [profileID];
            db_conn.query(query, params, (err: any, rows: any) => {
                if (err) {
                    console.log(err);
                    reject('500');
                } else {
                    resolve();
                }
            });
        }
    );
}


/**
 * Get ID of a profile.
 * @param profile the id of this profile will be searched for
 * @returns the id of the profile
 */
function getProfileID(profile: Profile): Promise<number> {
    return new Promise(
        (resolve, reject) => {
            const query: string = 'SELECT id FROM profile WHERE name=? AND project_id=?;';
            const params: any[] = [profile.name, profile.project_id];
            db_conn.query(query, params, (err: any, rows: any) => {
                if (err) {
                    console.log(err);
                    reject('500');
                } else if (rows.length < 1) {
                    console.log("Could not find ID of profile.");
                    reject('404');
                } else {
                    const newID: number = rows[0].id;
                    resolve(newID);
                }
            });
        }
    );
}


module.exports = {
    getProjectProfiles,
    updateProfile,
    addProfile,
    deleteProfile
}