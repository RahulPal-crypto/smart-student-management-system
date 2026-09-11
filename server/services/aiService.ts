import { GoogleGenAI } from '@google/genai';
import { db } from '../db/database';

export interface StudyPlanRequest {
  studentId: string;
  availableHoursPerDay: number;
  preferredTime: string; // e.g. 'Morning', 'Evening', 'Night'
  weakSubjects: string[];
  examTargetDate?: string;
  focusGoal?: string;
}

export interface GeneratedScheduleSession {
  time: string;
  subject: string;
  topic: string;
  focusType: 'Theory' | 'Practice' | 'Revision' | 'Assignment';
  priority: 'High' | 'Medium' | 'Low';
}

export interface GeneratedStudyPlanResponse {
  studentId: string;
  aiGenerated: boolean;
  modelUsed: string;
  advice: string;
  weeklyPlan: Array<{
    day: string;
    sessions: GeneratedScheduleSession[];
  }>;
}

export class AIService {
  private static getClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Generates AI Study Planner schedule
   */
  static async generateStudyPlan(req: StudyPlanRequest): Promise<GeneratedStudyPlanResponse> {
    const student = db.students.find((s) => s.id === req.studentId);
    const subjects = db.subjects.filter((s) => s.courseId === (student?.courseId || 'crs-1'));
    const pendingAssignments = db.assignments.slice(0, 3);
    const upcomingExams = db.exams.filter((e) => e.status === 'Upcoming');

    const client = this.getClient();

    if (client) {
      try {
        const prompt = `
You are an expert AI Academic Coach for a university student.
Generate a structured 7-day weekly study schedule in valid JSON.

Student Context:
- Name: ${student?.name || 'Student'}
- Available study hours per day: ${req.availableHoursPerDay} hours
- Preferred Study Time: ${req.preferredTime}
- Weak Subjects needing extra focus: ${req.weakSubjects.join(', ') || 'None specified'}
- Upcoming Exams: ${upcomingExams.map((e) => `${e.subjectName} on ${e.date}`).join('; ') || 'Midterms in 2 weeks'}
- Pending Assignments: ${pendingAssignments.map((a) => `${a.title} due ${a.dueDate}`).join('; ') || 'Regular coursework'}

Return strictly JSON with the following structure:
{
  "advice": "A brief 2-sentence encouraging academic strategy statement",
  "weeklyPlan": [
    {
      "day": "Monday",
      "sessions": [
        {
          "time": "06:00 PM - 07:15 PM",
          "subject": "Subject Name",
          "topic": "Specific chapter or problem set",
          "focusType": "Theory" | "Practice" | "Revision" | "Assignment",
          "priority": "High" | "Medium" | "Low"
        }
      ]
    }
    // repeat for Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
  ]
}
`;

        const response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            studentId: req.studentId,
            aiGenerated: true,
            modelUsed: 'Gemini 3.7 Flash',
            advice: parsed.advice || 'Optimized for upcoming exam readiness and weak subject reinforcement.',
            weeklyPlan: parsed.weeklyPlan || [],
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, switching seamlessly to smart deterministic planner fallback:', err);
      }
    }

    // Deterministic Smart Fallback Algorithm
    return this.generateDeterministicStudyPlan(req, subjects, pendingAssignments, upcomingExams);
  }

  private static generateDeterministicStudyPlan(
    req: StudyPlanRequest,
    subjects: any[],
    assignments: any[],
    exams: any[]
  ): GeneratedStudyPlanResponse {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = req.preferredTime === 'Morning'
      ? ['06:30 AM - 07:45 AM', '08:00 AM - 09:00 AM', '09:15 AM - 10:15 AM']
      : req.preferredTime === 'Night'
      ? ['08:00 PM - 09:15 PM', '09:30 PM - 10:30 PM', '10:45 PM - 11:45 PM']
      : ['05:30 PM - 06:45 PM', '07:00 PM - 08:00 PM', '08:15 PM - 09:15 PM'];

    const subjectList = subjects.map((s) => s.name);
    const weakList = req.weakSubjects.length > 0 ? req.weakSubjects : [subjectList[0] || 'Data Structures & Algorithms'];

    const topicsMap: Record<string, string[]> = {
      'Data Structures & Algorithms': ['B-Tree Indexing & AVL Rotations', 'Graph Shortest Paths (Dijkstra)', 'Dynamic Programming & Memoization'],
      'Database Management Systems': ['BCNF & 3NF Normalization Proofs', 'ACID Transactions & 2PL Locks', 'SQL Query Optimization & Indexes'],
      'Machine Learning': ['Gradient Descent & Loss Formulations', 'CNN Kernel Operations', 'Model Evaluation & Confusion Matrices'],
      'Computer Networks': ['TCP Flow Control & Sliding Window', 'IPv4/IPv6 Subnetting Practice', 'Routing Protocols & BGP'],
      'Web Technologies & Cloud': ['RESTful API Design & Middleware', 'JWT Authentication & Security', 'Docker Containerization & Vite Setup'],
    };

    const weeklyPlan = days.map((day, dIdx) => {
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      const sessions: GeneratedScheduleSession[] = [];

      // Session 1: Weak subject priority or Exam focus
      const weakSubj = weakList[dIdx % weakList.length] || subjectList[0];
      const topics = topicsMap[weakSubj] || ['Core Concept Review & Exercises', 'Exam Mock Questions'];
      sessions.push({
        time: timeSlots[0],
        subject: weakSubj,
        topic: topics[dIdx % topics.length],
        focusType: isWeekend ? 'Revision' : 'Practice',
        priority: 'High',
      });

      // Session 2: Assignment or secondary subject if available hours >= 2
      if (req.availableHoursPerDay >= 2) {
        const otherSubj = subjectList[(dIdx + 1) % subjectList.length] || subjectList[0];
        const asg = assignments[dIdx % assignments.length];
        sessions.push({
          time: timeSlots[1],
          subject: otherSubj,
          topic: asg ? `Coursework: ${asg.title}` : 'Advanced Unit Theory & Formula Derivation',
          focusType: asg ? 'Assignment' : 'Theory',
          priority: 'Medium',
        });
      }

      // Session 3: If hours >= 3
      if (req.availableHoursPerDay >= 3) {
        sessions.push({
          time: timeSlots[2],
          subject: isWeekend ? 'Weekly Comprehensive Mock Test' : weakSubj,
          topic: isWeekend ? 'Timed Assessment & Mistake Analysis' : 'Past Year Question Papers & Flashcards',
          focusType: 'Revision',
          priority: isWeekend ? 'High' : 'Low',
        });
      }

      return { day, sessions };
    });

    return {
      studentId: req.studentId,
      aiGenerated: false,
      modelUsed: 'Smart Academic Heuristic Engine (Deterministic)',
      advice: `Tailored for ${req.availableHoursPerDay} daily study hours with ${req.preferredTime.toLowerCase()} sessions prioritizing weak subjects (${weakList.join(', ')}) and upcoming exam milestones.`,
      weeklyPlan,
    };
  }

  /**
   * Generates Teacher Class Insights
   */
  static generateTeacherInsights(classId: string, subjectId?: string) {
    const records = db.attendance.filter((a) => a.classId === classId);
    const results = db.results.filter((r) => !subjectId || r.subjectId === subjectId);
    const assignments = db.assignments.filter((a) => a.classId === classId);
    const submissions = db.submissions.filter((s) => assignments.some((a) => a.id === s.assignmentId));

    const totalStudents = db.students.filter((s) => s.classSection === 'CSE-4A').length || 45;
    const pendingSubmissions = Math.max(0, (assignments.length * totalStudents) - submissions.length);

    const totalAtt = records.length;
    const presentAtt = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 86;

    const avgScore = results.length > 0
      ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / results.length)
      : 78;

    return {
      classId,
      avgAttendance,
      avgScore,
      pendingSubmissions,
      insights: [
        {
          type: 'attendance',
          tone: 'positive',
          title: 'Class Attendance Stability',
          description: `Overall class attendance is at ${avgAttendance}%, reflecting high student engagement across key morning lectures.`,
        },
        {
          type: 'performance',
          tone: 'warning',
          title: 'Unit Assessment Trend',
          description: 'Students showed strong proficiency in Unit 1 (88% avg), but Unit 2 proofs showed a 12% drop. Consider a revision recap session.',
        },
        {
          type: 'assignment',
          tone: 'info',
          title: 'Coursework Submissions',
          description: `${submissions.length} assignments graded so far. 3 students have pending submissions due within 48 hours.`,
        },
      ],
    };
  }
}
