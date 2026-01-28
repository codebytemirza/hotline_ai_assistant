/**
 * Vercel Serverless Function: GET /session
 * 
 * Generates an ephemeral token for the OpenAI Realtime API.
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return res.status(500).json({
                error: 'Server configuration error: API key missing'
            });
        }

        // Request ephemeral token from OpenAI
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2024-12-17',
                voice: 'shimmer'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            return res.status(response.status).json({
                error: `OpenAI API error: ${response.statusText}`
            });
        }

        const data = await response.json();

        // Return the ephemeral client secret
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error generating ephemeral token:', error);
        return res.status(500).json({
            error: 'Failed to generate session token'
        });
    }
}
