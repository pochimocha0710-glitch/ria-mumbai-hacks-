import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "@/lib/firebase.config";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, Timestamp, getDoc } from "firebase/firestore";
import { insertTaskSchema, updateTaskSchema, type Task } from "@shared/taskSchema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task Management Routes

  // Get all tasks for a user
  app.get("/api/tasks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const tasksRef = collection(db, "tasks");
      const q = query(tasksRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const tasks: Task[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          scheduledTime: data.scheduledTime.toDate(),
          duration: data.duration,
          completed: data.completed,
          notificationSent: data.notificationSent || false,
          xpReward: data.xpReward,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Task;
      });

      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const { userId, ...taskData } = req.body;

      // Validate input
      const validatedData = insertTaskSchema.parse({
        ...taskData,
        scheduledTime: new Date(taskData.scheduledTime),
      });

      const tasksRef = collection(db, "tasks");
      const now = Timestamp.now();

      const newTask = {
        userId,
        ...validatedData,
        scheduledTime: Timestamp.fromDate(validatedData.scheduledTime),
        completed: false,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(tasksRef, newTask);

      const createdTask = {
        id: docRef.id,
        ...newTask,
        scheduledTime: validatedData.scheduledTime,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      // Try to sync to Google Calendar (non-blocking)
      try {
        await syncTaskToCalendar(userId, createdTask);
      } catch (calendarError) {
        console.log("Calendar sync failed (non-critical):", calendarError);
        // Don't fail the task creation if calendar sync fails
      }

      res.json(createdTask);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(400).json({ error: error.message || "Failed to create task" });
    }
  });

  // Helper function to sync task to Google Calendar
  async function syncTaskToCalendar(userId: string, task: any) {
    // This will be called from the client side using the Google Calendar API
    // We'll add a calendar event ID field to track synced tasks
    // For now, we'll just log it - the client will handle the actual sync
    console.log(`Task ${task.id} ready for calendar sync for user ${userId}`);
  }

  // Update a task
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate input
      const validatedData = updateTaskSchema.parse(updates);

      const taskRef = doc(db, "tasks", id);
      const updateData: any = {
        ...validatedData,
        updatedAt: Timestamp.now(),
      };

      if (validatedData.scheduledTime) {
        updateData.scheduledTime = Timestamp.fromDate(validatedData.scheduledTime);
      }

      await updateDoc(taskRef, updateData);

      res.json({ success: true, id });
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(400).json({ error: error.message || "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const taskRef = doc(db, "tasks", id);
      await deleteDoc(taskRef);

      res.json({ success: true, id });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Mark task as complete
  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const taskRef = doc(db, "tasks", id);

      // Get the task to retrieve XP reward
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        return res.status(404).json({ error: "Task not found" });
      }

      await updateDoc(taskRef, {
        completed: true,
        updatedAt: Timestamp.now(),
      });

      const taskData = taskSnap.data();
      res.json({
        success: true,
        id,
        xpReward: taskData.xpReward || 50
      });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // AI-powered task creation endpoint
  app.post("/api/ai/parse-task", async (req, res) => {
    try {
      const { userId, prompt } = req.body;

      if (!prompt || !userId) {
        return res.status(400).json({ error: "Missing prompt or userId" });
      }

      // Call Gemini AI API
      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyAHmMKu-ZCwfZ8K6PNCBUKVHJ75K9pmzNk",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a task parsing assistant. Parse the following user request into a structured task format.

User request: "${prompt}"

Current date and time: ${new Date().toISOString()}

Return ONLY a JSON object with these exact fields (no markdown, no explanation):
{
  "title": "brief task title",
  "description": "optional description",
  "scheduledTime": "ISO 8601 datetime string",
  "duration": number in minutes (default 30),
  "xpReward": number between 10-100 based on task complexity
}

If the time is relative (e.g., "tomorrow at 6pm", "in 2 hours"), calculate the absolute datetime.
If no time is specified, default to tomorrow at 9am.
Be smart about context - "workout" might be 45-60 minutes, "quick call" might be 15 minutes.`
              }]
            }]
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error("Gemini API request failed");
      }

      const geminiData = await geminiResponse.json();
      const aiText = geminiData.candidates[0]?.content?.parts[0]?.text;

      if (!aiText) {
        throw new Error("No response from AI");
      }

      // Parse the JSON from AI response (remove markdown if present)
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse AI response");
      }

      const parsedTask = JSON.parse(jsonMatch[0]);

      // Validate the parsed data
      const validatedData = insertTaskSchema.parse({
        title: parsedTask.title,
        description: parsedTask.description || "",
        scheduledTime: new Date(parsedTask.scheduledTime),
        duration: parsedTask.duration || 30,
        xpReward: parsedTask.xpReward || 50,
      });

      // Create the task
      const tasksRef = collection(db, "tasks");
      const now = Timestamp.now();

      const newTask = {
        userId,
        ...validatedData,
        scheduledTime: Timestamp.fromDate(validatedData.scheduledTime),
        completed: false,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(tasksRef, newTask);

      res.json({
        id: docRef.id,
        ...newTask,
        scheduledTime: validatedData.scheduledTime,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      });
    } catch (error: any) {
      console.error("Error parsing task with AI:", error);
      res.status(500).json({ error: error.message || "Failed to parse task" });
    }
  });

  // Gemini AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get user context (optional)
      let userContext = "";
      if (userId) {
        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            userContext = `User info: Level ${userData.level}, ${userData.xp} XP, ${userData.tasksCompleted || 0} tasks completed.`;
          }
        } catch (e) {
          console.log("Could not fetch user context");
        }
      }

      // First, check if the message is a task creation request
      const taskDetectionPrompt = `Analyze this message and determine if the user wants to create a task or schedule something. 
User message: "${message}"

Respond with ONLY a JSON object:
{
  "isTaskRequest": true/false,
  "taskData": {
    "title": "task title if applicable",
    "description": "description if applicable",
    "scheduledTime": "ISO 8601 datetime string or null",
    "duration": number in minutes or null,
    "xpReward": number or null
  }
}

If it's a task request, extract task details. If not, set isTaskRequest to false and taskData to null.`;

      const taskDetectionResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyAHmMKu-ZCwfZ8K6PNCBUKVHJ75K9pmzNk",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: taskDetectionPrompt }]
            }]
          }),
        }
      );

      let createdTask = null;
      if (taskDetectionResponse.ok) {
        const taskDetectionData = await taskDetectionResponse.json();
        const taskDetectionText = taskDetectionData.candidates[0]?.content?.parts[0]?.text;
        if (taskDetectionText) {
          const jsonMatch = taskDetectionText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const taskDetection = JSON.parse(jsonMatch[0]);
              if (taskDetection.isTaskRequest && taskDetection.taskData && userId) {
                // Create the task
                const taskData = taskDetection.taskData;
                const scheduledTime = taskData.scheduledTime 
                  ? new Date(taskData.scheduledTime)
                  : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

                const validatedData = insertTaskSchema.parse({
                  title: taskData.title || "New Task",
                  description: taskData.description || "",
                  scheduledTime: scheduledTime,
                  duration: taskData.duration || 30,
                  xpReward: taskData.xpReward || 50,
                });

                const tasksRef = collection(db, "tasks");
                const now = Timestamp.now();

                const newTask = {
                  userId,
                  ...validatedData,
                  scheduledTime: Timestamp.fromDate(validatedData.scheduledTime),
                  completed: false,
                  notificationSent: false,
                  createdAt: now,
                  updatedAt: now,
                };

                const docRef = await addDoc(tasksRef, newTask);
                createdTask = {
                  id: docRef.id,
                  ...newTask,
                  scheduledTime: validatedData.scheduledTime,
                };
              }
            } catch (e) {
              console.log("Could not parse task detection:", e);
            }
          }
        }
      }

      // Generate chat response
      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyAHmMKu-ZCwfZ8K6PNCBUKVHJ75K9pmzNk",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are Ria, a supportive and empathetic AI wellness assistant. You help users with:
- Posture and exercise guidance
- Mood tracking and emotional support
- Task management and productivity
- Health and wellness tips
- Motivation and encouragement

${userContext}

User message: "${message}"

${createdTask ? `IMPORTANT: I just created a task for the user: "${createdTask.title}" scheduled for ${createdTask.scheduledTime.toLocaleString()}. Acknowledge this in your response.` : ''}

Respond in a warm, friendly, and helpful manner. Keep responses concise (2-4 sentences). Be encouraging and actionable.`
              }]
            }]
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error("Gemini API request failed");
      }

      const geminiData = await geminiResponse.json();
      const reply = geminiData.candidates[0]?.content?.parts[0]?.text;

      if (!reply) {
        throw new Error("No response from AI");
      }

      res.json({ reply, taskCreated: createdTask });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({
        error: "Failed to get response",
        reply: "I'm having trouble connecting right now. Please try again in a moment!"
      });
    }
  });

  // Automatic Weekly Planner endpoint
  app.post("/api/planner/generate", async (req, res) => {
    try {
      const { userId, preferences } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      const today = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Get user info for context including profile data
      let userContext = "beginner level";
      let userProfile = {
        age: null,
        height: null,
        weight: null,
        healthIssues: [] as string[],
        mentalHealth: [] as string[]
      };
      
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          userContext = `Level ${userData.level} user with ${userData.xp} XP`;
          userProfile = {
            age: userData.age || null,
            height: userData.height || null,
            weight: userData.weight || null,
            healthIssues: userData.healthIssues || [],
            mentalHealth: userData.mentalHealth || []
          };
        }
      } catch (e) {
        console.log("Using default context");
      }

      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyAHmMKu-ZCwfZ8K6PNCBUKVHJ75K9pmzNk",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a personalized 7-day wellness plan with daily tasks. Today is ${daysOfWeek[today.getDay()]}, ${today.toLocaleDateString()}.
                
User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Height: ${userProfile.height || 'Not specified'} cm
- Weight: ${userProfile.weight || 'Not specified'} kg
- Health Issues: ${userProfile.healthIssues.length > 0 ? userProfile.healthIssues.join(', ') : 'None specified'}
- Mental Health Concerns: ${userProfile.mentalHealth.length > 0 ? userProfile.mentalHealth.join(', ') : 'None specified'}
- Level: ${userContext}

IMPORTANT: Generate tasks based on the user's profile:
${userProfile.healthIssues.includes('Back/Posture Problems') ? '- Include daily posture correction exercises and reminders' : ''}
${userProfile.healthIssues.includes('Anxiety/Stress') || userProfile.mentalHealth.includes('Anxiety') ? '- Include stress management activities, breathing exercises, meditation' : ''}
${userProfile.healthIssues.includes('Depression/Mood Issues') || userProfile.mentalHealth.includes('Depression') ? '- Include mood-boosting activities, social interactions, light exercise' : ''}
${userProfile.healthIssues.includes('Sleep Issues') ? '- Include sleep hygiene tasks, evening routines, relaxation' : ''}

For EACH day (today through next 6 days), create 2-3 tasks covering:
- Morning routine (stretching, exercise, meditation based on user needs)
- Mid-day wellness check (posture, mood, hydration)
- Evening wellness (posture check, mood reflection, relaxation)

Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "day": "Monday",
    "date": "2025-11-29",
    "tasks": [
      {
        "title": "Morning Yoga Session",
        "description": "15 min gentle yoga",
        "time": "07:00",
        "duration": 15,
        "category": "wellness",
        "xpReward": 30
      }
    ]
  }
]

Make times realistic (morning 7-9am, afternoon 2-4pm, evening 7-9pm). Duration 15-60min. XP 20-80 based on effort.`
              }]
            }]
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error("Gemini API request failed");
      }

      const geminiData = await geminiResponse.json();
      const aiText = geminiData.candidates[0]?.content?.parts[0]?.text;

      if (!aiText) {
        throw new Error("No response from AI");
      }

      // Parse JSON from response
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not parse AI response");
      }

      const weekPlan = JSON.parse(jsonMatch[0]);

      // Save all tasks to database
      const tasksRef = collection(db, "tasks");
      const createdTasks: any[] = [];

      for (const dayPlan of weekPlan) {
        for (const task of dayPlan.tasks) {
          const taskDate = new Date(dayPlan.date);
          const [hours, minutes] = task.time.split(':');
          taskDate.setHours(parseInt(hours), parseInt(minutes));

          const newTask = {
            userId,
            title: task.title,
            description: task.description,
            scheduledTime: Timestamp.fromDate(taskDate),
            duration: task.duration,
            xpReward: task.xpReward,
            category: task.category,
            completed: false,
            notificationSent: false,
            autoGenerated: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          const docRef = await addDoc(tasksRef, newTask);
          createdTasks.push({
            id: docRef.id,
            ...newTask,
            scheduledTime: taskDate,
          });
        }
      }

      res.json({
        success: true,
        weekPlan,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
      });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      res.status(500).json({ error: error.message || "Failed to generate plan" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
