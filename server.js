/**
 * Ephemeral Token Server for OpenAI Realtime API
 * 
 * This Express server generates ephemeral tokens for secure WebRTC
 * connections to OpenAI's Realtime API. The API key is kept server-side
 * to prevent exposure in the browser.
 * 
 * Run: node server.js
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

/**
 * GET /session
 * 
 * Generates an ephemeral token for the OpenAI Realtime API.
 * This token is short-lived and safe to send to the browser.
 */
app.get('/session', async (req, res) => {
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
                voice: 'shimmer' // Mehak's voice - soft, warm female
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
        res.json(data);

        console.log('Ephemeral token generated successfully');
    } catch (error) {
        console.error('Error generating ephemeral token:', error);
        res.status(500).json({
            error: 'Failed to generate session token'
        });
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Mehak Token Server',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🟣 Mehak Token Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Session: http://localhost:${PORT}/session\n`);
});
