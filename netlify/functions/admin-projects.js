const { getStore } = require('@netlify/blobs');

function generateId() {
    return 'project-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const store = getStore('portfolio-projects');
        const projectsData = await store.get('projects');
        let projects = projectsData ? JSON.parse(projectsData) : [];

        if (event.httpMethod === 'POST') {
            const { name, description, github, demo } = JSON.parse(event.body);

            if (!name || !description || !github) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing required fields' }),
                };
            }

            const newProject = {
                id: generateId(),
                name,
                description,
                github,
                demo: demo || null,
                createdAt: new Date().toISOString(),
            };

            projects.push(newProject);
            await store.set('projects', JSON.stringify(projects));

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(newProject),
            };
        }

        if (event.httpMethod === 'PUT') {
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

            await store.set('projects', JSON.stringify(projects));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(projects[projectIndex]),
            };
        }

        if (event.httpMethod === 'DELETE') {
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
            await store.set('projects', JSON.stringify(projects));

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