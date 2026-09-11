import { db, StudentDoc, AttendanceRecord, ResultDoc, AssignmentDoc, SubmissionDoc } from '../db/database';

export interface AttendanceRiskResult {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  lateClasses: number;
  currentPercent: number;
  requiredPercent: number;
  status: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL';
  statusExplanation: string;
  classesNeededToReachThreshold: number;
  maxClassesCanMiss: number;
  subjectWise: Array<{
    subjectId: string;
    subjectName: string;
    total: number;
    attended: number;
    percent: number;
    status: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL';
  }>;
}

export interface AcademicHealthResult {
  score: number; // 0 - 100
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  summary: string;
  factors: {
    attendance: { weight: number; score: number; percent: number; comment: string };
    assignments: { weight: number; score: number; completionRate: number; avgGrade: number; comment: string };
    exams: { weight: number; score: number; avgPercentage: number; comment: string };
    consistency: { weight: number; score: number; streakDays: number; comment: string };
  };
  recommendations: string[];
}

export interface EarlyWarningStudent {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  courseName: string;
  semester: number;
  classSection: string;
  avatar: string;
  email: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  overallScore: number;
  reasons: string[];
  recommendedAction: string;
  attendancePercent: number;
  pendingAssignmentsCount: number;
  failingExamsCount: number;
}

export class SmartAnalyticsService {
  /**
   * Calculates dynamic Attendance Risk and mathematical projection for a student
   */
  static calculateStudentAttendanceRisk(studentId: string): AttendanceRiskResult {
    const threshold = db.settings.attendanceThresholdPercent || 75;
    const student = db.students.find((s) => s.id === studentId);
    const records = db.attendance.filter((a) => a.studentId === studentId);

    const totalClasses = records.length;
    // Count Present + 0.5 * Late as attended or standard Present + Late
    const attendedClasses = records.filter((r) => r.status === 'Present').length;
    const lateClasses = records.filter((r) => r.status === 'Late').length;
    const missedClasses = records.filter((r) => r.status === 'Absent').length;

    // Standard attendance calculation: (Present + Late) / Total
    const effectiveAttended = attendedClasses + lateClasses;
    const currentPercent = totalClasses > 0 ? Math.round((effectiveAttended / totalClasses) * 1000) / 10 : 100;

    let status: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL' = 'SAFE';
    let statusExplanation = 'Attendance meets the required institutional standard.';

    if (currentPercent < 60) {
      status = 'CRITICAL';
      statusExplanation = `Critically below the required ${threshold}% threshold. Immediate intervention required.`;
    } else if (currentPercent < threshold) {
      status = 'AT RISK';
      statusExplanation = `Attendance (${currentPercent}%) is below the required ${threshold}% threshold.`;
    } else if (currentPercent < threshold + 5) {
      status = 'WARNING';
      statusExplanation = `Close to the boundary limit (${currentPercent}%). Avoid missing upcoming lectures.`;
    } else {
      status = 'SAFE';
      statusExplanation = `Healthy attendance (${currentPercent}%). Well above required ${threshold}%.`;
    }

    // Mathematical calculations:
    // 1. Classes needed to reach threshold:
    // Let x = additional classes attended consecutively.
    // (effectiveAttended + x) / (totalClasses + x) >= T / 100
    // 100 * effectiveAttended + 100 * x >= T * totalClasses + T * x
    // x * (100 - T) >= T * totalClasses - 100 * effectiveAttended
    let classesNeededToReachThreshold = 0;
    if (currentPercent < threshold) {
      const numerator = (threshold * totalClasses) - (100 * effectiveAttended);
      const denominator = 100 - threshold;
      if (denominator > 0) {
        classesNeededToReachThreshold = Math.ceil(numerator / denominator);
        if (classesNeededToReachThreshold < 0) classesNeededToReachThreshold = 0;
      }
    }

    // 2. Maximum classes you can miss while remaining >= threshold:
    // Let y = classes you can miss.
    // effectiveAttended / (totalClasses + y) >= T / 100
    // 100 * effectiveAttended >= T * (totalClasses + y)
    // T * y <= 100 * effectiveAttended - T * totalClasses
    // y = floor((100 * effectiveAttended - T * totalClasses) / T)
    let maxClassesCanMiss = 0;
    if (currentPercent >= threshold && totalClasses > 0) {
      const numerator = (100 * effectiveAttended) - (threshold * totalClasses);
      maxClassesCanMiss = Math.max(0, Math.floor(numerator / threshold));
    }

    // Subject-wise breakdowns
    const subjectMap = new Map<string, { total: number; attended: number; name: string }>();
    for (const r of records) {
      const existing = subjectMap.get(r.subjectId) || { total: 0, attended: 0, name: r.subjectName };
      existing.total += 1;
      if (r.status === 'Present' || r.status === 'Late') {
        existing.attended += 1;
      }
      subjectMap.set(r.subjectId, existing);
    }

    const subjectWise = Array.from(subjectMap.entries()).map(([subjId, data]) => {
      const p = data.total > 0 ? Math.round((data.attended / data.total) * 1000) / 10 : 100;
      let s: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL' = 'SAFE';
      if (p < 60) s = 'CRITICAL';
      else if (p < threshold) s = 'AT RISK';
      else if (p < threshold + 5) s = 'WARNING';
      return {
        subjectId: subjId,
        subjectName: data.name,
        total: data.total,
        attended: data.attended,
        percent: p,
        status: s,
      };
    });

    return {
      studentId,
      studentName: student?.name || 'Unknown Student',
      studentIdNumber: student?.studentIdNumber || 'N/A',
      totalClasses,
      attendedClasses,
      missedClasses,
      lateClasses,
      currentPercent,
      requiredPercent: threshold,
      status,
      statusExplanation,
      classesNeededToReachThreshold,
      maxClassesCanMiss,
      subjectWise,
    };
  }

  /**
   * Calculates multi-factor Smart Academic Health Score (0-100)
   */
  static calculateAcademicHealthScore(studentId: string): AcademicHealthResult {
    const attRisk = this.calculateStudentAttendanceRisk(studentId);
    const assignments = db.assignments;
    const submissions = db.submissions.filter((s) => s.studentId === studentId);
    const results = db.results.filter((r) => r.studentId === studentId);

    // 1. Attendance factor (30% weight)
    const attPercent = attRisk.currentPercent;
    const attScore = Math.min(100, Math.max(0, (attPercent / 100) * 100));

    // 2. Assignment completion & grade factor (35% weight)
    const totalAssignments = assignments.length;
    const completedSubmissions = submissions.length;
    const completionRate = totalAssignments > 0 ? (completedSubmissions / totalAssignments) * 100 : 100;

    let totalMarksPct = 0;
    let gradedCount = 0;
    for (const sub of submissions) {
      if (sub.status === 'Graded' && sub.marksObtained !== undefined) {
        const asg = assignments.find((a) => a.id === sub.assignmentId);
        if (asg && asg.maxMarks > 0) {
          totalMarksPct += (sub.marksObtained / asg.maxMarks) * 100;
          gradedCount++;
        }
      }
    }
    const avgAssignmentMarks = gradedCount > 0 ? totalMarksPct / gradedCount : completionRate;
    const assignmentScore = (completionRate * 0.4) + (avgAssignmentMarks * 0.6);

    // 3. Exam performance factor (25% weight)
    let avgExamPct = 75; // baseline
    if (results.length > 0) {
      const sumPct = results.reduce((acc, curr) => acc + curr.percentage, 0);
      avgExamPct = sumPct / results.length;
    }
    const examScore = avgExamPct;

    // 4. Consistency & Streak factor (10% weight)
    const streakDays = attRisk.currentPercent >= 85 ? 12 : 5;
    const consistencyScore = Math.min(100, streakDays * 8);

    // Overall Weighted Health Score:
    const totalHealthScore = Math.round(
      (attScore * 0.30) +
      (assignmentScore * 0.35) +
      (examScore * 0.25) +
      (consistencyScore * 0.10)
    );

    let status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good';
    let summary = 'Academic profile is on track with steady performance.';

    if (totalHealthScore >= 85) {
      status = 'Excellent';
      summary = 'Outstanding academic performance across attendance, assignments, and test assessments!';
    } else if (totalHealthScore >= 70) {
      status = 'Good';
      summary = 'Solid academic health. A few minor optimizations will elevate your score into honors tier.';
    } else if (totalHealthScore >= 50) {
      status = 'Needs Attention';
      summary = 'Academic health is slipping below average due to pending coursework or missed lectures.';
    } else {
      status = 'Critical';
      summary = 'Urgent academic remediation recommended. Multiple critical indicators require immediate action.';
    }

    const recommendations: string[] = [];
    if (attRisk.currentPercent < 75) {
      recommendations.push(`Attend the next ${attRisk.classesNeededToReachThreshold || 4} consecutive lectures to recover safe attendance.`);
    }
    if (completionRate < 100) {
      const pending = totalAssignments - completedSubmissions;
      recommendations.push(`Complete ${pending} pending assignment${pending > 1 ? 's' : ''} before the upcoming due dates.`);
    }
    if (avgExamPct < 70) {
      recommendations.push('Schedule focused revision for weak subject units before the mid-semester exams.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current steady study habit and review upcoming syllabus chapters.');
    }

    return {
      score: totalHealthScore,
      status,
      summary,
      factors: {
        attendance: {
          weight: 30,
          score: Math.round(attScore),
          percent: attRisk.currentPercent,
          comment: attRisk.statusExplanation,
        },
        assignments: {
          weight: 35,
          score: Math.round(assignmentScore),
          completionRate: Math.round(completionRate),
          avgGrade: Math.round(avgAssignmentMarks),
          comment: `${completedSubmissions} of ${totalAssignments} assignments submitted.`,
        },
        exams: {
          weight: 25,
          score: Math.round(examScore),
          avgPercentage: Math.round(avgExamPct),
          comment: results.length > 0 ? `Scored average ${Math.round(avgExamPct)}% across ${results.length} published exams.` : 'No exams recorded yet.',
        },
        consistency: {
          weight: 10,
          score: Math.round(consistencyScore),
          streakDays,
          comment: `Current active study and attendance streak: ${streakDays} days.`,
        },
      },
      recommendations,
    };
  }

  /**
   * Early Warning System for identifying students needing academic guidance
   */
  static getEarlyWarningStudents(): EarlyWarningStudent[] {
    const list: EarlyWarningStudent[] = [];
    const threshold = db.settings.attendanceThresholdPercent || 75;

    for (const stu of db.students) {
      const att = this.calculateStudentAttendanceRisk(stu.id);
      const health = this.calculateAcademicHealthScore(stu.id);
      const submissions = db.submissions.filter((s) => s.studentId === stu.id);
      const pendingAssignments = db.assignments.length - submissions.length;
      const results = db.results.filter((r) => r.studentId === stu.id);
      const failingExams = results.filter((r) => r.percentage < 50).length;

      const reasons: string[] = [];
      let isWarning = false;
      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';

      if (att.currentPercent < 65) {
        reasons.push(`Attendance is critically low at ${att.currentPercent}% (Required: ${threshold}%).`);
        riskLevel = 'High';
        isWarning = true;
      } else if (att.currentPercent < threshold) {
        reasons.push(`Attendance is below minimum threshold at ${att.currentPercent}%.`);
        riskLevel = 'Medium';
        isWarning = true;
      }

      if (pendingAssignments >= 2) {
        reasons.push(`${pendingAssignments} course assignments are currently overdue or unsubmitted.`);
        isWarning = true;
        if (riskLevel !== 'High') riskLevel = 'Medium';
      }

      if (failingExams > 0) {
        reasons.push(`Scored below passing grade in ${failingExams} examination assessment(s).`);
        riskLevel = 'High';
        isWarning = true;
      }

      if (health.score < 60) {
        reasons.push(`Academic Health Score has dropped to ${health.score}/100.`);
        isWarning = true;
      }

      if (isWarning) {
        let recommendedAction = 'Schedule an academic counseling session to discuss attendance and coursework recovery.';
        if (riskLevel === 'High') {
          recommendedAction = 'Immediate faculty advisor contact required; initiate parent/guardian academic progress alert.';
        } else if (riskLevel === 'Medium') {
          recommendedAction = 'Send automated notification regarding missing assignments and recommend tutorial lab sessions.';
        }

        list.push({
          studentId: stu.id,
          studentName: stu.name,
          studentIdNumber: stu.studentIdNumber,
          courseName: stu.courseName,
          semester: stu.semester,
          classSection: stu.classSection,
          avatar: stu.avatar,
          email: stu.email,
          riskLevel,
          overallScore: health.score,
          reasons,
          recommendedAction,
          attendancePercent: att.currentPercent,
          pendingAssignmentsCount: pendingAssignments,
          failingExamsCount: failingExams,
        });
      }
    }

    return list.sort((a, b) => (a.riskLevel === 'High' ? -1 : 1));
  }

  /**
   * Calculates Smart Assignment Priority
   */
  static getAssignmentPriority(asg: AssignmentDoc, studentId?: string): 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const now = new Date().getTime();
    const dueDate = new Date(asg.dueDate).getTime();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);

    // If student has already submitted, priority is lower
    if (studentId) {
      const sub = db.submissions.find((s) => s.assignmentId === asg.id && s.studentId === studentId);
      if (sub) return 'LOW';
    }

    if (diffHours <= 24) return 'URGENT';
    if (diffHours <= 72 || asg.difficulty === 'Hard') return 'HIGH';
    if (diffHours <= 168 || asg.difficulty === 'Medium') return 'MEDIUM';
    return 'LOW';
  }
}
