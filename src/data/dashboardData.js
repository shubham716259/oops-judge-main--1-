/**
 * Dashboard Data Service
 * Provides typed mock data for Code Karo student dashboard.
 * Designed to be dropped-in with live backend API without component refactoring.
 */

function generateHeatmapDays(totalWeeks = 18) {
  const days = [];
  const now = new Date(2026, 9, 19); // 2026-10-19 reference
  const totalDays = totalWeeks * 7;

  // Pattern with realistic activity: clusters, occasional missed days, active streak in last 12 days
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    let count = 0;
    const isRecentStreak = i < 12; // active streak
    if (isRecentStreak) {
      count = ((i * 3 + 2) % 5) + 1; // 1 to 5
    } else {
      const randSeed = (i * 17 + 7) % 10;
      if (randSeed > 4) {
        count = (randSeed % 4) + 1;
      }
    }

    let level = 0;
    if (count >= 4) level = 4;
    else if (count === 3) level = 3;
    else if (count === 2) level = 2;
    else if (count === 1) level = 1;

    days.push({
      date: dateStr,
      dayOfWeek: d.getDay(),
      count,
      level,
    });
  }

  return days;
}

const POPULATED_DATA = {
  streak: {
    current: 12,
    longest: 28,
    totalActiveDays: 74,
    heatmap: generateHeatmapDays(18),
  },
  performance: {
    accepted: 47,
    attempted: 77,
    acceptanceRate: 61.0,
    medianRuntimeMs: 84,
    totalTestsRun: 412,
  },
  oopMastery: [
    {
      id: "inheritance",
      title: "Inheritance",
      solved: 14,
      total: 18,
      conceptKey: "Extends, super, method overriding",
    },
    {
      id: "polymorphism",
      title: "Polymorphism",
      solved: 11,
      total: 15,
      conceptKey: "Dynamic dispatch, overloading, interfaces",
    },
    {
      id: "abstraction",
      title: "Abstraction",
      solved: 9,
      total: 12,
      conceptKey: "Abstract classes, contract boundaries",
    },
    {
      id: "encapsulation",
      title: "Encapsulation",
      solved: 13,
      total: 14,
      conceptKey: "Access mutators, immutable objects",
    },
  ],
  recentSubmissions: [
    {
      id: "sub-104",
      problem: "Bank Account with Inheritance",
      problemId: "class-student",
      language: "Java 17",
      verdict: "Accepted",
      verdictType: "accepted",
      runtimeMs: 72,
      timeAgo: "14m ago",
    },
    {
      id: "sub-103",
      problem: "Shape Hierarchy with Abstract Classes",
      problemId: "employee",
      language: "Java 17",
      verdict: "Wrong Answer",
      verdictType: "error",
      runtimeMs: 96,
      timeAgo: "2h ago",
    },
    {
      id: "sub-102",
      problem: "Thread Safe Counter Lock",
      problemId: "daily-loss-counter",
      language: "Java 17",
      verdict: "Accepted",
      verdictType: "accepted",
      runtimeMs: 64,
      timeAgo: "5h ago",
    },
    {
      id: "sub-101",
      problem: "Matrix Transpose Parallel",
      problemId: "matrix-transpose",
      language: "Java 17",
      verdict: "Time Limit Exceeded",
      verdictType: "warning",
      runtimeMs: 2010,
      timeAgo: "1d ago",
    },
    {
      id: "sub-100",
      problem: "Custom Stack with Exception Handling",
      problemId: "custom-exception-power",
      language: "Java 17",
      verdict: "Runtime Error",
      verdictType: "error",
      runtimeMs: 88,
      timeAgo: "2d ago",
    },
  ],
  recommended: [
    {
      id: "rec-1",
      title: "Employee Salary Hierarchy",
      problemId: "employee",
      difficulty: "medium",
      topic: "Inheritance",
      estimatedMin: 25,
      submissionsCount: 1420,
    },
    {
      id: "rec-2",
      title: "Dynamic Dispatch Shape Area",
      problemId: "class-student",
      difficulty: "easy",
      topic: "Polymorphism",
      estimatedMin: 15,
      submissionsCount: 2310,
    },
    {
      id: "rec-3",
      title: "Interface Notification Pipeline",
      problemId: "custom-exception-power",
      difficulty: "medium",
      topic: "Abstraction",
      estimatedMin: 30,
      submissionsCount: 980,
    },
    {
      id: "rec-4",
      title: "Immutable Value Object Pattern",
      problemId: "daily-loss-counter",
      difficulty: "hard",
      topic: "Encapsulation",
      estimatedMin: 45,
      submissionsCount: 610,
    },
  ],
};

const EMPTY_DATA = {
  streak: {
    current: 0,
    longest: 0,
    totalActiveDays: 0,
    heatmap: [],
  },
  performance: {
    accepted: 0,
    attempted: 0,
    acceptanceRate: 0,
    medianRuntimeMs: 0,
    totalTestsRun: 0,
  },
  oopMastery: [],
  recentSubmissions: [],
  recommended: [],
};

/**
 * Fetch dashboard data with simulated latency.
 * Supports "populated", "loading", "empty", and "error" test states.
 */
export async function getDashboardData(state = "populated") {
  // Artificial delay for loading simulation (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (state === "error") {
    throw new Error("Unable to load dashboard metrics from Code Karo service. Verify network connection and retry.");
  }

  if (state === "empty") {
    return EMPTY_DATA;
  }

  return POPULATED_DATA;
}
