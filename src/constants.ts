// ============================================
// MEHAK - Mental Health Companion
// Application Constants
// ============================================

import type { SessionConfig, VoiceType } from './types';

/**
 * AI Persona - System Instructions
 * Bilingual (Urdu-English) empathetic mental health companion
 */
export const MEHAK_SYSTEM_PROMPT = `You are the Hotline Suicide Help Assistant, a compassionate and empathetic mental health companion. Your purpose is to provide emotional support and a safe space for people to express their feelings.

## Your Personality
- Name: Hotline Suicide Help Assistant (symbolizing immediate professional support)
- Voice: Soft, calm, warm, and reassuring
- Demeanor: Patient, non-judgmental, understanding

## Language Guidelines
- Speak in a natural mix of Urdu and English (Hinglish/Urdish)
- Use Urdu for emotional reassurance and warmth:
  - "Main samajh sakti hoon..." (I can understand...)
  - "Aap akele nahi hain..." (You are not alone...)
  - "Yeh mushkil waqt hai, lekin..." (This is a difficult time, but...)
- Use English when clarity is important
- Keep responses conversational, not clinical

## Conversation Guidelines
1. **Listen First**: Let the person express themselves fully before responding
2. **Validate Emotions**: Always acknowledge their feelings as valid
   - "Jo aap mehsoos kar rahe hain, woh bilkul samajh mein aata hai"
3. **Ask Open-Ended Questions**: 
   - "Mujhe aur batayein..." (Tell me more...)
   - "Aap kaise feel kar rahe hain is baare mein?"
4. **Never Judge**: Avoid any language that could feel critical
5. **Maintain Calm Pace**: Don't rush, give pauses for reflection
6. **Offer Gentle Support**: Encourage without pressuring

## Crisis Response (If user mentions self-harm, suicide, or serious distress)
- Stay calm and present
- Acknowledge their pain: "Main samajh sakti hoon aap bahut mushkil mein hain"
- Ask gentle clarifying questions: "Kya aap mujhe aur bata sakte hain jo aap feel kar rahe hain?"
- Remind them of their worth: "Aapki zindagi qeemti hai"
- Encourage professional help: "Professional support lena strength ki nishani hai"
- Never dismiss or minimize their feelings

## Important Reminders
- You are a supportive companion, not a replacement for professional therapy
- Encourage seeking professional help when appropriate
- Maintain confidentiality and create a judgment-free zone
- Use warm, soothing language throughout

Begin each conversation by gently introducing yourself and asking how they're feeling today.`;

/**
 * Voice configuration for Mehak
 * Using 'shimmer' - a warm, soft female voice
 */
export const MEHAK_VOICE: VoiceType = 'shimmer';

/**
 * Default session configuration for OpenAI Realtime API
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
    model: 'gpt-4o-realtime-preview-2024-12-17',
    voice: MEHAK_VOICE,
    instructions: MEHAK_SYSTEM_PROMPT,
    inputAudioTranscription: {
        model: 'whisper-1'
    },
    turnDetection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
    }
};

/**
 * Crisis detection keywords and phrases
 * Includes both English and Urdu/Romanized Urdu
 */
export const CRISIS_KEYWORDS = {
    critical: [
        // English - explicit
        'kill myself',
        'end my life',
        'want to die',
        'commit suicide',
        'suicide',
        'take my own life',
        'hurt myself',
        'cut myself',
        'self harm',
        'self-harm',
        // Urdu/Romanized
        'marr jaana',
        'khudkushi',
        'apni jaan',
        'khud ko maar',
        'khud ko hurt',
        'mera marne ko dill',
        'marne ko dil',
        'nuksan phunchana',
        'nuksan pohanchana',
        'zindagi khatam',
        'khatam karna'
    ],
    warning: [
        // English - concerning but less explicit
        "don't want to live",
        "can't go on",
        'no reason to live',
        'better off dead',
        'hopeless',
        'give up',
        'too much pain',
        "can't take it anymore",
        'no point',
        'what\'s the point',
        'end it all',
        // Urdu/Romanized
        'jeena nahi',
        'koi fayda nahi',
        'bahut takleef',
        'bardasht nahi'
    ]
};

/**
 * Emergency resources (Pakistan-focused for prototype)
 */
export const EMERGENCY_RESOURCES = [
    {
        name: 'Umang Helpline',
        phone: '0311-7786264',
        description: 'Mental health support helpline (Pakistan)'
    },
    {
        name: 'Rozan Counseling',
        phone: '0800-22444',
        description: 'Free counseling service'
    },
    {
        name: 'Emergency Services',
        phone: '1122',
        description: 'Rescue emergency (Pakistan)'
    }
];

/**
 * API Configuration
 */
export const API_CONFIG = {
    REALTIME_API_URL: 'https://api.openai.com/v1/realtime',
    MODEL: 'gpt-4o-realtime-preview-2024-12-17',
    TOKEN_ENDPOINT: '/session', // Local backend endpoint
    WEBSOCKET_TIMEOUT: 30000,
};

/**
 * UI Text Constants
 */
export const UI_TEXT = {
    APP_TITLE: 'Hotline Suicide Help Assistant',
    APP_SUBTITLE: 'A safe space to talk',
    START_CALL: 'Start Conversation',
    END_CALL: 'End Conversation',
    CONNECTING: 'Connecting...',
    CONNECTED: 'Connected',
    LISTENING: 'Listening...',
    SPEAKING: 'Mehak is speaking...',
    IDLE: 'Ready to listen',
    ERROR: 'Connection error',

    // Emergency card
    EMERGENCY_TITLE: 'Crisis Support Needed',
    EMERGENCY_SUBTITLE: 'We noticed you might be going through a difficult time',
    CONTACT_RESCUE: 'Contact Rescue Team',
    ASSIGN_SUPPORT: 'Assign Immediate Support',
    SHOW_RESOURCES: 'Show Emergency Resources',

    // Help Assistant panel
    MEHAK_INTRO: 'Hotline Suicide Help Assistant',
    MEHAK_TAGLINE: 'Compassionate mental health support',
    MEHAK_READY: 'Ready to listen whenever you are',

    // Disclaimer
    DISCLAIMER: 'This is a prototype and not a replacement for professional mental health services. If you are in crisis, please contact emergency services or a mental health professional.'
};

/**
 * Tool definition for the AI to trigger rescue services
 */
export const RESCUE_SERVICE_TOOL = {
    type: 'function',
    name: 'notify_rescue_team',
    description: 'Call this function immediately if the user expresses intent to self-harm, commit suicide, or indicates a life-threatening crisis. This will dispatch emergency services to their location.',
    parameters: {
        type: 'object',
        properties: {
            reason: {
                type: 'string',
                description: 'The specific reason or phrase that triggered this alert.'
            },
            severity: {
                type: 'string',
                enum: ['critical', 'warning'],
                description: 'The severity of the crisis.'
            }
        },
        required: ['reason', 'severity']
    }
};

/**
 * Animation durations in ms
 */
export const ANIMATION_DURATIONS = {
    FADE: 250,
    SLIDE: 400,
    PULSE: 2000,
    WAVEFORM: 100
};
