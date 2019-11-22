import express from 'express';
const router = express.Router();
import Project from '../../types/project';
const $project_methods = require('./project_methods');

/**
 * Middleware that is specific to this router
 */
router.use((req: any, res: any, next: Function) => {
    console.log(`Projects middleware is triggered`);
    next()
});

/////////////////////////////////////////////////////////////////////////////////////
// Define routes
/////////////////////////////////////////////////////////////////////////////////////

/**
 * Get project with specific ID from the database.
 */
router.get('/:project_id', async (req: any, res: any) => {
    const project_id: number = parseInt(req.params.project_id);
    try{
        const project: Project = await $project_methods.getProject(project_id);
        res.status(200).json({project});
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while fetching project from the database.");
    }    
});


/**
 * Get all projects sorted from newest to oldest from the database.
 */
router.get('/', async (req: any, res: any) => {
    try {
        const projects: Project[] = await $project_methods.getAllProjects();
        res.status(200).json(projects);
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while fetching all projects from the database.");
    }
});


/**
 * Update existing project in the database.
 * @pre body of http request contains the project (type: Project) in JSON format
 */
router.put('/:project_id', async (req: any, res: any) => {
    const projectID: number = parseInt(req.params.project_id);
    const project: Project = req.body.project;
    try{
        await $project_methods.updateProject(projectID, project);
        res.status(200).send('Successfully updated project in the database.');
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while updating project in the database.");
    }
});


/**
 * Insert new project into the database. All profiles of the project will be added too.
 * @pre body of http request contains new project (type: Project) in JSON format
 */
router.post('/', async (req: any, res: any) => {
    const project: Project = req.body.project;
    try{
        const newProjectID: number = await $project_methods.addProject(project);
        res.status(200).json({id: newProjectID});
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while inserting new project into the database.");
    }
});


/**
 * Delete project from the database. All profiles of the project will be deleted too.
 */
router.delete('/:project_id', async (req: any, res: any) => {
    const projectID: number = parseInt(req.params.project_id);
    try{
        await $project_methods.deleteProject(projectID);
        res.status(200).send("Successfully deleted project from the database.");
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while deleting project from the database.");
    }
});

module.exports = router;