// Google Calendar API integration service
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES =
  "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";

let gapi = null;
let tokenClient = null;
let accessToken = null;

// Token persistence
const TOKEN_STORAGE_KEY = "google_calendar_token";
const TOKEN_EXPIRY_KEY = "google_calendar_token_expiry";

// Initialize Google API
export const initializeGoogleAPI = async () => {
  try {
    console.log("🔄 Initializing Google API...");

    // Load both gapi and gsi
    await Promise.all([loadGoogleAPI(), loadGoogleIdentityServices()]);

    gapi = window.gapi;

    // Initialize gapi client
    await new Promise((resolve) => {
      gapi.load("client", resolve);
    });

    await gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });

    // Initialize token client for OAuth
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        console.log("✅ Token received:", tokenResponse);
        accessToken = tokenResponse.access_token;
        gapi.client.setToken({ access_token: accessToken });

        // Store token with expiry time
        const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      },
    });

    // Check for existing valid token
    await restoreStoredToken();

    console.log("✅ Google API initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing Google API:", error);
    return false;
  }
};

// Load Google API script
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load Google Identity Services
const loadGoogleIdentityServices = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Restore stored token if valid
const restoreStoredToken = async () => {
  try {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!storedToken || !storedExpiry) {
      console.log("🔍 No stored token found");
      return false;
    }

    const expiryTime = parseInt(storedExpiry);
    const now = Date.now();

    if (now >= expiryTime) {
      console.log("⏰ Stored token expired");
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return false;
    }

    console.log("✅ Restored valid token from storage");
    accessToken = storedToken;
    gapi.client.setToken({ access_token: accessToken });
    return true;
  } catch (error) {
    console.error("❌ Error restoring token:", error);
    return false;
  }
};

// Sign in user
export const signInGoogle = async () => {
  return new Promise(async (resolve) => {
    try {
      console.log("🔐 Starting Google sign in...");
      if (!tokenClient) {
        console.log("⚙️ Initializing Google API first...");
        await initializeGoogleAPI();
      }

      // Set up callback for this specific sign-in
      tokenClient.callback = (tokenResponse) => {
        if (tokenResponse.error) {
          console.error("❌ OAuth error:", tokenResponse);
          resolve({
            isSignedIn: false,
            error: tokenResponse.error,
          });
          return;
        }

        console.log("✅ Sign in successful!", tokenResponse);
        accessToken = tokenResponse.access_token;
        gapi.client.setToken({ access_token: accessToken });

        // Store token with expiry time
        const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

        resolve({
          isSignedIn: true,
          user: { email: "user@example.com" }, // We'll get real user info after
          accessToken: accessToken,
        });
      };

      console.log("🚀 Opening OAuth flow...");
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (error) {
      console.error("❌ Error signing in:", error);
      resolve({
        isSignedIn: false,
        error: error.message,
      });
    }
  });
};

// Sign out user
export const signOutGoogle = async () => {
  try {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken);
      accessToken = null;
      gapi.client.setToken(null);

      // Clear stored tokens
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

// Check if user is signed in
export const isUserSignedIn = () => {
  return !!accessToken && !!gapi?.client?.getToken();
};

// Check if we have a stored token (for checking on page load)
export const hasStoredToken = () => {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!storedToken || !storedExpiry) {
    return false;
  }

  const expiryTime = parseInt(storedExpiry);
  const now = Date.now();

  return now < expiryTime;
};

// Get current user
export const getCurrentUser = () => {
  return isUserSignedIn() ? { email: "authenticated" } : null;
};

// Fetch calendar events
export const fetchGoogleCalendarEvents = async (timeMin, timeMax) => {
  try {
    console.log("📅 Fetching Google Calendar events...");
    if (!isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    // Calculate time range in IST
    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const response = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin || now.toISOString(),
      timeMax: timeMax || thirtyDaysLater.toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 250,
      orderBy: "startTime",
      timeZone: "Asia/Kolkata", // Force Indian timezone in API response
    });

    console.log("✅ Events fetched:", response.result.items?.length || 0);
    return response.result.items || [];
  } catch (error) {
    console.error("❌ Error fetching calendar events:", error);
    return [];
  }
};

// Convert Google Calendar event to our meeting format
export const convertGoogleEventToMeeting = (googleEvent) => {
  const startDateTime = googleEvent.start.dateTime || googleEvent.start.date;
  const endDateTime = googleEvent.end.dateTime || googleEvent.end.date;

  // Handle all-day events
  const isAllDay = !googleEvent.start.dateTime;

  let startTime, endTime, date;

  if (isAllDay) {
    // All-day event - use date as-is
    date = googleEvent.start.date;
    startTime = "00:00";
    endTime = "23:59";
  } else {
    // Timed event - convert everything to Indian Standard Time (IST)
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    // Convert to Indian timezone (Asia/Kolkata)
    const istOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    // Get date and time in IST
    const startIST = startDate.toLocaleString("en-CA", istOptions);
    const endIST = endDate.toLocaleString("en-CA", istOptions);

    console.log(`🔍 DEBUG - Event: ${googleEvent.summary}`);
    console.log(`🔍 Raw startDateTime: ${startDateTime}`);
    console.log(`🔍 Raw endDateTime: ${endDateTime}`);
    console.log(`🔍 JavaScript Date object: ${startDate}`);
    console.log(`🔍 IST formatted string: ${startIST}`);
    console.log(`🔍 Split result: [${startIST.split(", ")}]`);

    // Extract date (YYYY-MM-DD format)
    date = startIST.split(", ")[0];

    // Extract time (HH:MM format)
    startTime = startIST.split(", ")[1];
    endTime = endIST.split(", ")[1];

    console.log(`🕐 Event: ${googleEvent.summary}`);
    console.log(`🌍 Original: ${startDateTime} → 🇮🇳 IST: ${date} ${startTime}`);
    console.log(
      `📊 API Response Timezone: ${
        googleEvent.start.timeZone || "Not specified"
      }`
    );
    console.log(`📊 Final date used: ${date}`);
    console.log(`📊 Final time used: ${startTime}`);
    console.log(`--------------------------------------------------`);
  }

  return {
    id: `google_${googleEvent.id}`,
    title: googleEvent.summary || "Untitled Event",
    date: date,
    startTime: startTime,
    endTime: endTime,
    attendees: googleEvent.attendees?.map((attendee) => attendee.email) || [
      "No attendees",
    ],
    location: googleEvent.location || "No location specified",
    description: googleEvent.description || "",
    source: "google", // Mark as Google Calendar event
    isAllDay: isAllDay,
  };
};

// Create a new Google Calendar event
export const createGoogleCalendarEvent = async (eventData) => {
  try {
    console.log("📅 Creating Google Calendar event:", eventData);

    if (!isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    // Convert local date/time to ISO format for Google Calendar
    const startDateTime = `${eventData.date}T${eventData.startTime}:00`;
    const endDateTime = `${eventData.date}T${eventData.endTime}:00`;

    const event = {
      summary: eventData.title,
      description: eventData.description || "",
      location: eventData.location || "",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      attendees: eventData.attendees?.map((email) => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 15 }, // 15 minutes before
        ],
      },
    };

    console.log("📤 Sending event to Google Calendar:", event);

    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all", // Send invitations to attendees
      resource: event,
    });

    console.log("✅ Event created successfully:", response.result);

    return {
      success: true,
      event: response.result,
      id: response.result.id,
    };
  } catch (error) {
    console.error("❌ Error creating event:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update an existing Google Calendar event
export const updateGoogleCalendarEvent = async (eventId, eventData) => {
  try {
    console.log("📅 Updating Google Calendar event:", eventId, eventData);

    if (!isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    const startDateTime = `${eventData.date}T${eventData.startTime}:00`;
    const endDateTime = `${eventData.date}T${eventData.endTime}:00`;

    const event = {
      summary: eventData.title,
      description: eventData.description || "",
      location: eventData.location || "",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      attendees: eventData.attendees?.map((email) => ({ email })) || [],
    };

    const response = await gapi.client.calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      sendUpdates: "all",
      resource: event,
    });

    console.log("✅ Event updated successfully:", response.result);

    return {
      success: true,
      event: response.result,
    };
  } catch (error) {
    console.error("❌ Error updating event:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete a Google Calendar event
export const deleteGoogleCalendarEvent = async (eventId) => {
  try {
    console.log("🗑️ Deleting Google Calendar event:", eventId);

    if (!isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    await gapi.client.calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
      sendUpdates: "all",
    });

    console.log("✅ Event deleted successfully");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
