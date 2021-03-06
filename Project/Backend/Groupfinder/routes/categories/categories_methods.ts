const db_conn = require('../../databaseconnection');
import Category from '../../types/category';

/**
 * Manage all interactions with categories in the database
 */
export class CategoryController {
    /**
     * Get category from the database.
     * @param categoryID the id of the category to be searched for
     */
    public getCategory(categoryID: number): Promise<Category> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'SELECT * FROM category WHERE id=?;';
                const params: any[] = [categoryID];
                db_conn.query(query, params, (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else if (rows.length < 1) {
                        console.log('Could not find category.');
                        reject('404');
                    } else {
                        const category: Category = {
                            id: rows[0].id,
                            name: rows[0].name,
                            subcategory: rows[0].subcategory
                        }
                        resolve(category);
                    }
                });
            }
        );
    }
    
    
    /**
     * Get all categories stored in the database.
     * @returns a promise of the list of all categories
     */
    public getAllCategories(): Promise<Category[]> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = "SELECT * FROM category;";
                console.log(query)
                db_conn.query(query, (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else {
                        let categories: Category[] = [];
                        for (let i=0; i < rows.length; i++) {
                            let category: Category = {
                                id: rows[i].id,
                                name: rows[i].name,
                                subcategory: rows[i].subcategory
                            }
                            categories.push(category);
                        }
                        resolve(categories);
                    }
                });
            }
        );
    }
    
    
    /**
     * Update an existing category in the database.
     * @param categoryID the id of the category to be updated
     * @param category the category to be updated
     */
    public updateCategory(categoryID: number, category: Category): Promise<void> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'UPDATE category SET name=? WHERE id=?;';
                const params: any[] = [category.name, categoryID];
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
    
	public getProjectCategories(projectID: number): Promise<string>{
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'SELECT categories FROM project WHERE id=?;';
                const params: any[] = [projectID]
                db_conn.query(query, params, (err: any, rows: any) => {
                    if(err){
                        console.log(err);
                        reject('500');
                    } else if (rows.length < 1) {
                        console.log('Could not find categories of project.');
                        reject('404');
                    } else {
                        console.log("Succesfully gotten categories!")
                        const categories: string = rows[0].categories;
                        resolve(categories)
                    }
                })
            }
        )
    }

    
    /**
     * Insert a new category into the database.
     * @param category the new category
     * @returns a promise of the id of the new category
     */
    public addCategory(category: Category): Promise<number> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'INSERT INTO category (name) VALUES (?);';
                const params: any[] = [category.name];
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else {
                        try{
                            const newCategoryID: number = await this.getCategoryID(category);
                            resolve(newCategoryID);
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            }
        );
    }
    
    
    /**
     * Get the ID of a category
     * @param category the category for which we'll search the id
     */
    public getCategoryID(category: Category): Promise<number> {
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = 'SELECT id FROM category WHERE name=? ORDER BY id DESC;';
                const params: any[] = [category.name];
                db_conn.query(query, params, (err: any, rows: any) => {
                    if (err) {
                        console.log(err);
                        reject('500');
                    } else if (rows.length < 1) {
                        console.log('Could not find id of category.');
                        reject('404');
                    } else {
                        const id: number = rows[0].id;
                        resolve(id);
                    }
                });
            }
        );
    }
    
    /**
     * updates the project table, posts the categories_ids in the table
     * @param categories array of Category objects of chosen categories
     * @param projectID id of the project the categories belong to
     */
    public addCategoriesToProject(categories: Category[], projectID: number): Promise<void>{
        return new Promise(
            (resolve: any, reject: any) => {
                console.log(categories, projectID);
                const query: string = 'UPDATE project SET categories=? WHERE id=?;';
                let categories_ids = "";
                for(let i = 0; i < categories.length; i++){
                    let temp_num = categories[i].id;
                    categories_ids += `${temp_num}`;
                    if(i < categories.length - 1){
                        categories_ids += ",";
                    }
                }
                categories_ids = "[" + categories_ids + "]";
                const params: any[] = [categories_ids, projectID]
                db_conn.query(query, params, async (err: any, rows: any) => {
                    if(err){
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
     * Delete a category from the database.
     * @param categoryID the id of the category to be deleted
     */
    public deleteCategory(categoryID: number): Promise<void>{
        return new Promise(
            (resolve: any, reject: any) => {
                const query: string = "DELETE FROM category WHERE id=?;";
                const params: any[] = [categoryID];
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

}
