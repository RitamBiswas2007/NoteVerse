export const initialMockCircles = [
  {
    id: "1",
    name: "Data Structures",
    slug: "data-structures",
    description: "Master arrays, trees, graphs, and more",
    subjectArea: "Computer Science",
    memberCount: 4500,
    postCount: 892,
    isFeatured: true,
    activities: [
      { id: "a1", user: "Alice", type: "post", content: "Just finished a visualizer for AVL trees! Check it out.", timestamp: "2h ago", likes: 24, comments: 5 },
      { id: "a2", user: "Bob", type: "resource", content: "Shared: 'Cracking the Coding Interview' study guide", timestamp: "5h ago", likes: 156, comments: 12 },
      { id: "a3", user: "Charlie", type: "comment", content: "Wait, isn't the complexity of insertion in a B-Tree O(log n)?", timestamp: "8h ago", likes: 3, comments: 0 }
    ]
  },
  {
    id: "2",
    name: "Thermodynamics",
    slug: "thermodynamics",
    description: "Laws of heat and energy transfer",
    subjectArea: "Physics",
    memberCount: 3200,
    postCount: 456,
    isFeatured: false,
    activities: [
      { id: "b1", user: "Dr. Kelvin", type: "post", content: "Remember: Entropy of an isolated system never decreases.", timestamp: "1d ago", likes: 89, comments: 21 },
      { id: "b2", user: "Newton2.0", type: "post", content: "Anyone has a cheat sheet for the second law?", timestamp: "2d ago", likes: 12, comments: 8 }
    ]
  },
  {
    id: "3",
    name: "Organic Chemistry",
    slug: "organic-chem",
    description: "Reactions, mechanisms, and synthesis",
    subjectArea: "Chemistry",
    memberCount: 2800,
    postCount: 678,
    isFeatured: true,
    activities: [
      { id: "c1", user: "C-Chain", type: "post", content: "Sn1 vs Sn2 mechanism flowchart is up!", timestamp: "4h ago", likes: 45, comments: 3 }
    ]
  },
  {
    id: "4",
    name: "Calculus",
    slug: "calculus",
    description: "Limits, derivatives, and integrals",
    subjectArea: "Mathematics",
    memberCount: 5100,
    postCount: 1200,
    isFeatured: false,
    activities: [
      { id: "d1", user: "IntegrationWhiz", type: "post", content: "Integration by parts masterclass today at 5 PM.", timestamp: "1h ago", likes: 67, comments: 14 }
    ]
  },
];
