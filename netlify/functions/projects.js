const fs = require('fs').promises;
const path = require('path');

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');

async function readProjects() {
    try {
        await fs.access(PROJECTS_FILE);
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // File doesn't exist, return empty array
        return [];
    }
}

exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const projects = await readProjects();
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