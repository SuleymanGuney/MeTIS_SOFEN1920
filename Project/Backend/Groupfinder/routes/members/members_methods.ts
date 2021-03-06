const db_conn = require('../../databaseconnection');
import User from '../../types/user';
import Project from '../../types/project';
import { ProjectController } from '../projects/project_methods';

let projectcontroller: ProjectController = new ProjectController();

/**
 * Manage all interactions with members in the database
 */
export class MemberController {
    /**
    * Adds a member to the profile of a project
    * @param user_id the id of the user
    * @param project_id the id of the project
    * @param profile_id the id of the profile
    */
    public addMember(user_id: number, project_id: number, profile_id: number): Promise<void> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'INSERT INTO member (user_id, profile_id, project_id) VALUES (?,?,?);';
                const params: any[] = [user_id, profile_id, project_id];
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else {
                        resolve();
                    }
                })
            }
        );
    }


    /**
    * Returns all the users that are a memver of this profile
    * @param profile_id the id of the profile
    * @returns A list of User objects containing all the users that are a member of this profile
    */
    public getMembersProfile(profile_id: number): Promise<User[]> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'SELECT * FROM user LEFT JOIN member ON user.id=member.user_id WHERE member.profile_id=?;';
                const params: any[] = [profile_id];
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else {
                        let users: User[] = [];
                        for (let i = 0; i < rows.length; i++){
                            let user: User = {
                                id: rows[i].id,
                                first_name: rows[i].first_name,
                                last_name: rows[i].last_name,
                                is_admin: rows[i].is_admin,
                                mail: rows[i].mail,
                                address: rows[i].address,
                                zip: rows[i].zip,
                                city: rows[i].city,
                                tel: rows[i].tel,
                                website: rows[i].website,
                                social_media: rows[i].social_media,
                                available: rows[i].available,
                                private: rows[i].private
                            }
                            users.push(user);
                        }
                        resolve(users);
                    }
                })
            }
        )
    }


    /**
    * Removes a member from a profile of a project
    * @param user_id The id of the user
    * @param project_id The id of the project
    * @param profile_id The id of the profile
    */
    public deleteMember(user_id: number, project_id: number, profile_id: number): Promise<void> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'DELETE FROM member WHERE user_id=? AND profile_id=? AND project_id=?;';
                const params: any[] = [user_id, profile_id, project_id];
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else {
                        resolve();
                    }
                })
            }
        )
    }


    /**
    * Get all the projects the user is a member of
    * @param user_id the id of the user
    * @returns A list of Project objects containing all the projects the user is a member of
    */
    public getProjectsUser(user_id: number): Promise<Project[]> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'SELECT * FROM member WHERE user_id=?;';
                const params: any[] = [user_id];
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else {
                        let projects: Project[] = [];
                        for (let i = 0; i < rows.length; i++){
                            let project: Project = await projectcontroller.getProject(rows[i].project_id);
                            projects.push(project);
                        }
                        resolve(projects);
                    }
                })
            }
        )
    }
}
