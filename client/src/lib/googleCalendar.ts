// Google Calendar API Service
// This service handles OAuth authentication and calendar operations

const CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Note: You need to add these to your .env file:
// VITE_GOOGLE_CLIENT_ID=your_client_id_here
// VITE_GOOGLE_API_KEY=your_google_api_key
// Get it from: https://console.cloud.google.com/apis/credentials

// Default client ID (can be overridden by env variable)
const DEFAULT_CLIENT_ID = '734179532245-n3fmch2r1848q63c133phc6de2kfnta9.apps.googleusercontent.com';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize the Google API client
 */
export async function initializeGoogleCalendar() {
    try {
        // Load the Google API client
        await loadGapi();
        await loadGis();

        return true;
    } catch (error) {
        console.error('Error initializing Google Calendar:', error);
        return false;
    }
}

/**
 * Load Google API Platform Library
 */
function loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            (window as any).gapi.load('client', async () => {
                try {
                    await (window as any).gapi.client.init({
                        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                        discoveryDocs: [DISCOVERY_DOC],
                    });
                    gapiInited = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

/**
 * Load Google Identity Services
 */
function loadGis(): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID,
                scope: CALENDAR_SCOPES,
                callback: '', // defined later
            });
            gisInited = true;
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

/**
 * Request access token and authenticate user
 */
export function authenticateGoogleCalendar(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!gapiInited || !gisInited) {
            reject(new Error('Google API not initialized'));
            return;
        }

        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                reject(resp);
            } else {
                resolve();
            }
        };

        if ((window as any).gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

/**
 * Sign out from Google Calendar
 */
export function signOutGoogleCalendar() {
    const token = (window as any).gapi.client.getToken();
    if (token !== null) {
        (window as any).google.accounts.oauth2.revoke(token.access_token);
        (window as any).gapi.client.setToken('');
    }
}

/**
 * Get user's calendar events
 */
export async function getCalendarEvents(timeMin?: Date, timeMax?: Date): Promise<any[]> {
    try {
        const request = {
            calendarId: 'primary',
            timeMin: timeMin ? timeMin.toISOString() : new Date().toISOString(),
            timeMax: timeMax?.toISOString(),
            showDeleted: false,
            singleEvents: true,
            maxResults: 50,
            orderBy: 'startTime',
        };

        const response = await (window as any).gapi.client.calendar.events.list(request);
        return response.result.items || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
    }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    location?: string;
}): Promise<any> {
    try {
        const request = {
            calendarId: 'primary',
            resource: event,
        };

        const response = await (window as any).gapi.client.calendar.events.insert(request);
        return response.result;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(eventId: string, event: any): Promise<any> {
    try {
        const request = {
            calendarId: 'primary',
            eventId: eventId,
            resource: event,
        };

        const response = await (window as any).gapi.client.calendar.events.update(request);
        return response.result;
    } catch (error) {
        console.error('Error updating calendar event:', error);
        throw error;
    }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
    try {
        await (window as any).gapi.client.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
    }
}

/**
 * Find free time slots in the calendar
 */
export async function findFreeTimeSlots(
    startDate: Date,
    endDate: Date,
    durationMinutes: number = 60
): Promise<{ start: Date; end: Date }[]> {
    try {
        const events = await getCalendarEvents(startDate, endDate);
        const freeSlots: { start: Date; end: Date }[] = [];

        let currentTime = new Date(startDate);
        const endTime = new Date(endDate);

        // Sort events by start time
        events.sort((a, b) =>
            new Date(a.start.dateTime || a.start.date).getTime() -
            new Date(b.start.dateTime || b.start.date).getTime()
        );

        for (const event of events) {
            const eventStart = new Date(event.start.dateTime || event.start.date);

            // If there's a gap before this event
            if (currentTime < eventStart) {
                const gapDuration = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);
                if (gapDuration >= durationMinutes) {
                    freeSlots.push({
                        start: new Date(currentTime),
                        end: new Date(Math.min(eventStart.getTime(), currentTime.getTime() + durationMinutes * 60 * 1000))
                    });
                }
            }

            // Move current time to end of this event
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            currentTime = new Date(Math.max(currentTime.getTime(), eventEnd.getTime()));
        }

        // Check for free time after last event
        if (currentTime < endTime) {
            const gapDuration = (endTime.getTime() - currentTime.getTime()) / (1000 * 60);
            if (gapDuration >= durationMinutes) {
                freeSlots.push({
                    start: new Date(currentTime),
                    end: new Date(Math.min(endTime.getTime(), currentTime.getTime() + durationMinutes * 60 * 1000))
                });
            }
        }

        return freeSlots;
    } catch (error) {
        console.error('Error finding free time slots:', error);
        throw error;
    }
}

/**
 * Add a routine to Google Calendar
 */
export async function addRoutineToCalendar(routine: {
    title: string;
    tasks: Array<{
        name: string;
        duration: number; // in minutes
        time?: string; // HH:MM format
    }>;
    startDate: Date;
    daysCount: number;
}): Promise<void> {
    try {
        const events = [];

        for (let day = 0; day < routine.daysCount; day++) {
            const currentDate = new Date(routine.startDate);
            currentDate.setDate(currentDate.getDate() + day);

            for (const task of routine.tasks) {
                const [hours, minutes] = task.time ? task.time.split(':').map(Number) : [9, 0];

                const startTime = new Date(currentDate);
                startTime.setHours(hours, minutes, 0, 0);

                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + task.duration);

                const event = {
                    summary: `${routine.title}: ${task.name}`,
                    description: `Part of your ${routine.title} routine`,
                    start: {
                        dateTime: startTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        dateTime: endTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 10 },
                        ],
                    },
                };

                events.push(event);
            }
        }

        // Create all events
        for (const event of events) {
            await createCalendarEvent(event);
        }
    } catch (error) {
        console.error('Error adding routine to calendar:', error);
        throw error;
    }
}
