const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');

async function ensureDataDir() {
    const dataDir = path.dirname(PROJECTS_FILE);
    try {
        await fs.access(dataDir);
    } catch (error) {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

async function readProjects() {
    try {
        await fs.access(PROJECTS_FILE);
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeProjects(projects) {
    await ensureDataDir();
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    try {
        const projects = await readProjects();

        if (event.httpMethod === 'POST') {
            // Create new project
            const { name, description, github, demo } = JSON.parse(event.body);

            if (!name || !description || !github) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing required fields' }),
                };
            }

            const newProject = {
                id: uuidv4(),
                name,
                description,
                github,
                demo: demo || null,
                createdAt: new Date().toISOString(),
            };

            projects.push(newProject);
            await writeProjects(projects);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(newProject),
            };
        }

        if (event.httpMethod === 'PUT') {
            // Update existing project
            const { id, name, description, github, demo } = JSON.parse(event.body);

            if (!id || !name || !description || !github) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing required fields' }),
                };
            }

            const projectIndex = projects.findIndex(p => p.id === id);
            if (projectIndex === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Project not found' }),
                };
            }

            projects[projectIndex] = {
                ...projects[projectIndex],
                name,
                description,
                github,
                demo: demo || null,
                updatedAt: new Date().toISOString(),
            };

            await writeProjects(projects);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(projects[projectIndex]),
            };
        }

        if (event.httpMethod === 'DELETE') {
            // Delete project
            const { id } = JSON.parse(event.body);

            if (!id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing project ID' }),
                };
            }

            const projectIndex = projects.findIndex(p => p.id === id);
            if (projectIndex === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Project not found' }),
                };
            }

            projects.splice(projectIndex, 1);
            await writeProjects(projects);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    } catch (error) {
        console.error('Error in admin-projects function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};