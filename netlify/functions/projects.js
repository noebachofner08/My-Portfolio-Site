const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const store = getStore('portfolio-projects');
        const projectsData = await store.get('projects');

        let projects = [];
        if (projectsData) {
            projects = JSON.parse(projectsData);
        } else {
            projects = [
                {
                    id: 'example-project-1',
                    name: 'Beispiel Projekt',
                    description: 'Dies ist ein Beispielprojekt, um die Funktionalität zu demonstrieren.',
                    github: 'https://github.com/username/example-project',
                    demo: 'https://example-project-demo.netlify.app',
                    createdAt: new Date().toISOString()
                }
            ];
            await store.set('projects', JSON.stringify(projects));
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(projects),
        };
    } catch (error) {
        console.error('Error reading projects:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};