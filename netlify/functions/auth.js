const crypto = require('crypto');

// Sicherer Hash des Admin-Passworts (wird über Umgebungsvariable gesetzt)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Method not allowed' }),
        };
    }

    try {
        const { password } = JSON.parse(event.body);

        if (!password || !ADMIN_PASSWORD_HASH) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Invalid request' }),
            };
        }

        const hashedPassword = hashPassword(password);
        const isValid = hashedPassword === ADMIN_PASSWORD_HASH;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: isValid }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Internal server error' }),
        };
    }
};