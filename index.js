function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    try {
     
      console.log("Course Info:", courseInfo);
      console.log("Assignment Group:", assignmentGroup);
      console.log("Learner Submissions:", learnerSubmissions);
  
      if (courseInfo.id !== assignmentGroup.course_id) {
        throw new Error("Course and assignment group don't match");
      }
  
      const weightedAssignments = assignmentGroup.assignments.map((assignment) => {
        if (typeof assignment.points_possible !== 'number' || assignment.points_possible <= 0) {
          throw new Error(`Invalid points_possible value for assignment ${assignment.id}`);
        }
  
        console.log(`Processing assignment ${assignment.id}:`, assignment);
  
        return {
          id: assignment.id,
          name: assignment.name,
          weight: (assignment.points_possible * assignmentGroup.group_weight) / 100,
          dueAt: new Date(assignment.due_at),
          pointsPossible: assignment.points_possible,
        };
      });
  
      const learnersData = {};
  
      for (const submission of learnerSubmissions) {
        const { learner_id, assignment_id, submission: { submitted_at, score } } = submission;
        const learner = learnersData[learner_id] || { id: learner_id, scores: {}, totalWeight: 0, totalScore: 0 };
  
        const assignment = weightedAssignments.find((a) => a.id === assignment_id);
        if (!assignment) {
          console.error(`Assignment ${assignment_id} not found for learner ${learner_id}`);
          continue; // Skip this iteration if assignment not found
        }
  
        const currentDate = new Date();
        if (currentDate < assignment.dueAt) {
          console.log(`Skipping assignment ${assignment_id} for learner ${learner_id} (not yet due)`);
          continue; // Skip this iteration as the assignment is not yet due
        }
  
        const isLate = new Date(submitted_at) > assignment.dueAt;
        const adjustedScore = isLate ? score * 0.9 : score;
  
        console.log(`Learner ${learner_id} score for assignment ${assignment_id}:`, adjustedScore, `(Late: ${isLate})`);
  
        learner.scores[assignment_id] = (adjustedScore / assignment.pointsPossible) * 100;
        learner.totalWeight += assignment.weight;
        learner.totalScore += (adjustedScore / assignment.pointsPossible) * assignment.weight;
  
        learnersData[learner_id] = learner;
      }
  
      console.log("Intermediate Learner Data:", learnersData);
  
      const output = Object.values(learnersData).map((learner) => {
        const learnerResult = {
          id: learner.id,
          avg: learner.totalWeight > 0 ? (learner.totalScore / learner.totalWeight) * 100 : 0,
          ...learner.scores,
        };
  
        console.log(`Final result for learner ${learner.id}:`, learnerResult);
  
        return learnerResult;
      });
  
      console.log("Final Output:", output);
      return output;
  
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return [];
    }
  }
  
  const courseInfo = { id: 1, name: "SBA 308" };
  const assignmentGroup = {
    id: 1,
    name: "Homework",
    course_id: 1,
    group_weight: 50,
    assignments: [
      { id: 1, name: "HW1", due_at: "2024-08-11", points_possible: 100 },
      { id: 2, name: "HW2", due_at: "2024-10-15", points_possible: 100 }
    ],
  };
  const learnerSubmissions = [
    {
      learner_id: 1,
      assignment_id: 1,
      submission: { submitted_at: "2024-10-04", score: 80 }
    },
    {
      learner_id: 1,
      assignment_id: 2,
      submission: { submitted_at: "2024-10-12", score: 90 }
    }
  ];
  
  getLearnerData(courseInfo, assignmentGroup, learnerSubmissions);
  