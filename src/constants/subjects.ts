export interface SubjectContent {
  id: string;
  name: string;
  category: string;
  description: string;
  sampleNotes: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  learningObjectives: string[];
  flashcards: Array<{ id: string; question: string; answer: string; tag: string }>;
  quizQuestions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  summarySections: Array<{
    title: string;
    content: string;
    keyTakeaway: string;
  }>;
  mnemonics: Array<{
    title: string;
    acronymOrPhrase: string;
    breakdown: string[];
    explanation: string;
  }>;
}

export const SUBJECT_CHIPS: SubjectContent[] = [
  {
    id: 'os',
    name: 'Operating Systems',
    category: 'Computer Science',
    description: 'Process Synchronization, Semaphores, Deadlocks, & Memory Management',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    sampleNotes: `Operating Systems Notes: Process Synchronization & Deadlocks

1. Critical Section Problem:
A critical section is a piece of code that accesses shared resources (such as shared variables, files, or hardware).
Must satisfy three conditions:
- Mutual Exclusion: Only one process inside CS at a time.
- Progress: Selection of next process entering CS cannot be postponed indefinitely.
- Bounded Waiting: Bound on number of times other processes enter CS after request made.

2. Semaphores:
Synchronization tool invented by Dijkstra.
- Counting Semaphore: Integer value over unrestricted domain.
- Binary Semaphore (Mutex): Integer value 0 or 1.
- Operations: wait() / P() decrements, signal() / V() increments.

3. Deadlocks:
A situation where a set of processes are blocked because each process holds a resource and waits for another resource held by another process.
Four Coffman Conditions required for Deadlock:
1. Mutual Exclusion
2. Hold and Wait
3. No Preemption
4. Circular Wait

Deadlock Handling Strategies:
- Prevention: Eliminate at least one Coffman condition.
- Avoidance: Banker's Algorithm (Safe State verification).
- Detection & Recovery: Resource Allocation Graph (RAG) cycle detection & process termination.`,
    learningObjectives: [
      'Understand the 3 criteria for solving the Critical Section Problem',
      'Differentiate between Binary Semaphores (Mutex) and Counting Semaphores',
      'Memorize and evaluate the 4 Coffman Conditions for Deadlocks',
      'Apply Banker\'s Algorithm for Deadlock Avoidance'
    ],
    flashcards: [
      {
        id: 'os-1',
        question: 'What are the 3 mandatory conditions to solve the Critical Section problem?',
        answer: 'Mutual Exclusion, Progress, and Bounded Waiting.',
        tag: 'Process Sync'
      },
      {
        id: 'os-2',
        question: 'What are the four Coffman conditions for a deadlock to occur?',
        answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.',
        tag: 'Deadlocks'
      },
      {
        id: 'os-3',
        question: 'What is the primary difference between a Mutex and a Counting Semaphore?',
        answer: 'A Mutex is a binary semaphore (value 0 or 1) used for mutual exclusion. A Counting Semaphore can take any non-negative integer value to control access to a finite pool of resources.',
        tag: 'Semaphores'
      },
      {
        id: 'os-4',
        question: 'How does Banker\'s Algorithm avoid deadlocks?',
        answer: 'It dynamically checks resource allocation requests by verifying if granting the allocation leaves the system in a safe state where all processes can eventually complete.',
        tag: 'Algorithms'
      }
    ],
    quizQuestions: [
      {
        id: 'os-q1',
        question: 'Which condition ensures that if no process is executing in its critical section, only processes not executing in their remainder sections can participate in deciding who enters next?',
        options: ['Mutual Exclusion', 'Progress', 'Bounded Waiting', 'Starvation Prevention'],
        correctIndex: 1,
        explanation: 'Progress guarantees that selection cannot be postponed indefinitely and processes outside their remainder section decide entry.'
      },
      {
        id: 'os-q2',
        question: 'Which Coffman condition is violated when a process holding resources can have them forcibly taken away?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'],
        correctIndex: 2,
        explanation: 'Allowing preemptive resource preemptions eliminates the "No Preemption" condition, preventing deadlock.'
      },
      {
        id: 'os-q3',
        question: 'In Unix/Linux, what kernel mechanism atomically decrements a semaphore value and blocks if the result is negative?',
        options: ['signal() / V()', 'wait() / P()', 'fork()', 'exec()'],
        correctIndex: 1,
        explanation: 'wait() (also called P() from Dutch proberen) decrements the semaphore counter and blocks if resources are unavailable.'
      }
    ],
    summarySections: [
      {
        title: 'Critical Section & Mutual Exclusion',
        content: 'Processes sharing memory must synchronize access to critical regions to prevent race conditions. Systems use hardware atomic operations (TestAndSet, Swap) or software algorithms (Peterson\'s) alongside OS primitives.',
        keyTakeaway: 'Always ensure Mutual Exclusion, Progress, and Bounded Waiting to avoid race conditions and indefinite postponement.'
      },
      {
        title: 'Deadlock Characterization & Coffman Conditions',
        content: 'Deadlocks require four simultaneous conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. Interrupting any single condition breaks deadlock possibility.',
        keyTakeaway: 'Banker\'s Algorithm avoids deadlocks by simulating maximum allocation safety states before granting resources.'
      }
    ],
    mnemonics: [
      {
        title: 'Coffman Deadlock Conditions',
        acronymOrPhrase: 'M H N C ("Must Have No Constraints")',
        breakdown: [
          'M - Mutual Exclusion',
          'H - Hold and Wait',
          'N - No Preemption',
          'C - Circular Wait'
        ],
        explanation: 'Memorize MHNC to quickly list all four required conditions for deadlock formation.'
      }
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    category: 'Computer Science',
    description: 'OSI 7-Layer Model, TCP/IP Suite, Subnetting & Routing Protocols',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    sampleNotes: `Computer Networks Study Guide: OSI Model & TCP vs UDP

1. OSI 7-Layer Model:
Layer 7: Application (HTTP, FTP, DNS)
Layer 6: Presentation (SSL/TLS, Data encryption, JPEG)
Layer 5: Session (RPC, Session establishment)
Layer 4: Transport (TCP, UDP, Port numbers)
Layer 3: Network (IP, ICMP, Routers, IP Packets)
Layer 2: Data Link (Ethernet, MAC addresses, Switches, Frames)
Layer 1: Physical (Cables, Bits, Hubs, Signal transmission)

2. TCP vs UDP:
- TCP (Transmission Control Protocol): Connection-oriented, 3-way handshake (SYN, SYN-ACK, ACK), reliable delivery, flow control (sliding window), congestion control.
- UDP (User Datagram Protocol): Connectionless, lightweight, low latency, no ACK guarantees (used for DNS, Video streaming, VOIP).

3. TCP 3-Way Handshake:
1. Client sends SYN (Synchronize Sequence Number)
2. Server responds with SYN-ACK
3. Client sends ACK (Acknowledge)`,
    learningObjectives: [
      'Map protocols and network devices to all 7 OSI Layers',
      'Contrast TCP reliability mechanisms with UDP latency advantages',
      'Detail the step-by-step TCP 3-way handshake process',
      'Calculate IPv4 CIDR subnets and broadcast addresses'
    ],
    flashcards: [
      {
        id: 'cn-1',
        question: 'What are the 7 layers of the OSI model in order from bottom (Layer 1) to top (Layer 7)?',
        answer: 'Physical, Data Link, Network, Transport, Session, Presentation, Application.',
        tag: 'OSI Model'
      },
      {
        id: 'cn-2',
        question: 'What packets are exchanged during a TCP 3-way handshake?',
        answer: '1. SYN (Client → Server)\n2. SYN-ACK (Server → Client)\n3. ACK (Client → Server)',
        tag: 'TCP'
      },
      {
        id: 'cn-3',
        question: 'Which OSI layer handles MAC addresses and frame formatting?',
        answer: 'Layer 2 — Data Link Layer.',
        tag: 'Layers'
      }
    ],
    quizQuestions: [
      {
        id: 'cn-q1',
        question: 'At which OSI layer do routers primarily operate using IP addresses?',
        options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
        correctIndex: 1,
        explanation: 'Routers operate at Layer 3 (Network Layer) to route packets across logical networks via IP addresses.'
      }
    ],
    summarySections: [
      {
        title: 'OSI vs TCP/IP Reference Models',
        content: 'The OSI model provides a 7-layer framework for protocol standardization, whereas the TCP/IP suite compresses Session and Presentation layers into Application layer protocols.',
        keyTakeaway: 'Layer 4 manages end-to-end ports and reliability; Layer 3 routes packets between IP hosts.'
      }
    ],
    mnemonics: [
      {
        title: 'OSI 7 Layers (Bottom to Top)',
        acronymOrPhrase: 'Please Do Not Throw Sausage Pizza Away',
        breakdown: [
          'P - Physical (1)',
          'D - Data Link (2)',
          'N - Network (3)',
          'T - Transport (4)',
          'S - Session (5)',
          'P - Presentation (6)',
          'A - Application (7)'
        ],
        explanation: 'Classic mnemonic to remember layer numbers 1 through 7 in correct sequence.'
      }
    ]
  },
  {
    id: 'dbms',
    name: 'DBMS',
    category: 'Databases',
    description: 'Relational Model, Normalization (1NF to BCNF), ACID Properties & Indexing',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    sampleNotes: `Database Management Systems: Normalization & ACID Properties

1. ACID Properties of Transactions:
- Atomicity: "All or Nothing". Transactions complete fully or roll back completely.
- Consistency: Database moves from one valid state to another, maintaining constraints.
- Isolation: Concurrent transactions execute without interfering with each other (Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable).
- Durability: Once committed, changes persist even in system crashes.

2. Database Normalization:
Goal: Eliminate data redundancy and update anomalies.
- 1NF: Atomic values in columns, no repeating groups.
- 2NF: 1NF + No partial dependencies (all non-key attributes fully dependent on candidate key).
- 3NF: 2NF + No transitive dependencies (A → B and B → C).
- BCNF: 3NF + For every functional dependency X → Y, X must be a super key.

3. Indexing & B+ Trees:
- B+ Trees store data pointers only in leaf nodes, keeping internal nodes small and enabling range scans via linked leaves.`,
    learningObjectives: [
      'Define ACID properties and transaction isolation levels',
      'Perform normalization step-by-step from 1NF through BCNF',
      'Explain B+ Tree index structures and range query efficiency'
    ],
    flashcards: [
      {
        id: 'db-1',
        question: 'What does each letter in the ACID acronym stand for?',
        answer: 'Atomicity, Consistency, Isolation, Durability.',
        tag: 'Transactions'
      },
      {
        id: 'db-2',
        question: 'What is a Transitive Dependency and which normal form eliminates it?',
        answer: 'A transitive dependency occurs when a non-prime attribute depends on another non-prime attribute (X → Y and Y → Z). 3NF eliminates transitive dependencies.',
        tag: 'Normalization'
      }
    ],
    quizQuestions: [
      {
        id: 'db-q1',
        question: 'In BCNF (Boyce-Codd Normal Form), what condition must hold for every non-trivial functional dependency X → Y?',
        options: ['Y must be a prime attribute', 'X must be a super key', 'X and Y must be atomic', 'Y must be a candidate key'],
        correctIndex: 1,
        explanation: 'BCNF strictly requires that the left-hand side X of any functional dependency X → Y must be a super key.'
      }
    ],
    summarySections: [
      {
        title: 'Transaction Guarantees & Isolation',
        content: 'ACID guarantees database reliability during concurrent transactions and failures. Higher isolation levels prevent dirty reads, non-repeatable reads, and phantom reads at the cost of concurrency speed.',
        keyTakeaway: 'Use 3NF/BCNF to prevent insertion/deletion anomalies and B+ tree indexing for fast lookup.'
      }
    ],
    mnemonics: [
      {
        title: 'ACID Guarantees',
        acronymOrPhrase: 'ACID ("All Changes In Database")',
        breakdown: [
          'A - Atomicity (All or nothing)',
          'C - Consistency (Rules preserved)',
          'I - Isolation (No concurrency interference)',
          'D - Durability (Persisted across crashes)'
        ],
        explanation: 'Core transaction properties required in enterprise relational databases.'
      }
    ]
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend Engineering',
    description: 'Component Lifecycle, Hooks, State Management, Fiber Reconciliation & Virtual DOM',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    sampleNotes: `React Deep Dive: Hooks, Virtual DOM, & Re-rendering

1. React Fiber & Virtual DOM:
- Virtual DOM is an in-memory representation of real DOM nodes.
- React Fiber is the reconciliation engine introduced in React 16. It enables incremental rendering by splitting rendering work into units called fibers.

2. Core React Hooks Rules:
- Call hooks ONLY at the top level (never inside loops, conditions, or nested functions).
- Call hooks ONLY from React function components or custom hooks.

3. Essential Hooks:
- useState: Local state management.
- useEffect: Side-effects management (fetching, subscriptions, DOM mutations).
- useMemo: Caches calculated computation values between re-renders.
- useCallback: Caches function instances between re-renders to prevent unnecessary child re-renders.
- useRef: Persists mutable values across renders without causing re-renders; provides direct DOM node access.`,
    learningObjectives: [
      'Understand Fiber reconciliation and Virtual DOM diffing algorithm',
      'Apply custom hooks for modular logic separation',
      'Optimize re-renders using useMemo, useCallback, and React.memo'
    ],
    flashcards: [
      {
        id: 'r-1',
        question: 'What is the primary difference between useMemo and useCallback?',
        answer: 'useMemo returns the memoized result of executing a calculation function, whereas useCallback returns the memoized function reference itself.',
        tag: 'Hooks'
      },
      {
        id: 'r-2',
        question: 'Why must React hooks be called only at the top level of a component?',
        answer: 'React relies on the exact call order of hooks across re-renders to match internal state arrays to the correct hook.',
        tag: 'Hook Rules'
      }
    ],
    quizQuestions: [
      {
        id: 'r-q1',
        question: 'Which hook should be used to store a value that persists across component renders WITHOUT triggering a re-render when mutated?',
        options: ['useState', 'useMemo', 'useRef', 'useReducer'],
        correctIndex: 2,
        explanation: 'Mutating ref.current in useRef does not trigger component re-renders.'
      }
    ],
    summarySections: [
      {
        title: 'React Rendering Pipeline & Memoization',
        content: 'React renders in two main phases: Render phase (pure calculation of fiber nodes) and Commit phase (DOM updates). Use memoization strategically when prop references change frequently.',
        keyTakeaway: 'State updates trigger component function execution. Keep state minimal and close to where it is consumed.'
      }
    ],
    mnemonics: [
      {
        title: 'React Hook Rules',
        acronymOrPhrase: 'T O P ("Top Only Please")',
        breakdown: [
          'T - Top Level only (no loops/conditionals)',
          'O - Only React Functions / Custom Hooks',
          'P - Preserve Call Order consistency'
        ],
        explanation: 'Ensures hooks preserve internal index references correctly across re-renders.'
      }
    ]
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    category: 'Artificial Intelligence',
    description: 'Supervised vs Unsupervised, Gradient Descent, Overfitting & Model Evaluation',
    difficulty: 'Advanced',
    estimatedMinutes: 35,
    sampleNotes: `Machine Learning Fundamentals: Supervised Learning & Optimization

1. ML Paradigms:
- Supervised Learning: Training data includes input features and target labels (e.g. Linear Regression, Decision Trees, SVMs).
- Unsupervised Learning: Discovering hidden patterns in unlabeled data (e.g. K-Means Clustering, PCA, Autoencoders).
- Reinforcement Learning: Agent learns optimal actions via rewards and penalties in an environment (e.g. Q-Learning, PPO).

2. Overfitting & Underfitting (Bias-Variance Tradeoff):
- High Bias (Underfitting): Model is too simple to capture underlying data patterns.
- High Variance (Overfitting): Model fits training data noise and performs poorly on unseen test data.
- Mitigation for Overfitting: Regularization (L1 Lasso, L2 Ridge), Cross-Validation, Dropout, Early Stopping.

3. Gradient Descent:
Optimization algorithm to minimize loss function L(θ):
θ = θ - α * ∇L(θ)
Where α is the learning rate and ∇L(θ) is the gradient of loss with respect to parameters.`,
    learningObjectives: [
      'Compare Supervised, Unsupervised, and Reinforcement Learning paradigms',
      'Explain the Bias-Variance tradeoff and apply L1/L2 regularization',
      'Derive parameter update steps for Gradient Descent optimization'
    ],
    flashcards: [
      {
        id: 'ml-1',
        question: 'What is the main difference between L1 (Lasso) and L2 (Ridge) regularization?',
        answer: 'L1 adds the absolute sum of weights (|w|) to the loss, driving unused weights strictly to zero (sparse feature selection). L2 adds squared weights (w²), shrinking weights toward zero without forcing absolute zero.',
        tag: 'Regularization'
      },
      {
        id: 'ml-2',
        question: 'What does a high variance model indicate in machine learning?',
        answer: 'High variance indicates overfitting — the model learned training noise and performs poorly on unseen test data.',
        tag: 'Bias-Variance'
      }
    ],
    quizQuestions: [
      {
        id: 'ml-q1',
        question: 'Which hyperparameter in Gradient Descent controls the step size taken towards the minimum of the loss function?',
        options: ['Batch Size', 'Learning Rate (α)', 'Momentum', 'Epoch Count'],
        correctIndex: 1,
        explanation: 'Learning rate α scales the gradient vector to set step distance per iteration.'
      }
    ],
    summarySections: [
      {
        title: 'Supervised Learning & Model Generalization',
        content: 'Machine learning models aim to minimize empirical risk while maintaining strong generalization on unseen test distributions. Hyperparameter tuning and validation splits prevent overfitting.',
        keyTakeaway: 'Balance model complexity against dataset size to maintain optimal bias-variance equilibrium.'
      }
    ],
    mnemonics: [
      {
        title: 'Overfitting Solutions',
        acronymOrPhrase: 'R E A D ("Read To Generalize")',
        breakdown: [
          'R - Regularization (L1 / L2)',
          'E - Early Stopping',
          'A - Augmentation of Data',
          'D - Dropout Layers'
        ],
        explanation: 'Four core techniques to reduce model variance and prevent overfitting.'
      }
    ]
  },
  {
    id: 'java',
    name: 'Java',
    category: 'Programming Languages',
    description: 'OOP Principles, JVM Architecture, Garbage Collection, & Multithreading',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    sampleNotes: `Java Core Fundamentals: OOP & JVM Memory Model

1. Four Pillars of OOP:
- Encapsulation: Hiding internal object state via private fields and public getters/setters.
- Inheritance: Subclass inheriting attributes and methods from superclass (extends).
- Polymorphism: Method Overloading (compile-time) and Method Overriding (runtime).
- Abstraction: Hiding implementation details using Abstract Classes and Interfaces.

2. JVM Memory Structure:
- Heap Memory: Stores all created objects and instance variables (garbage collected).
- Method Area (Metaspace): Stores class structures, constant pool, static methods.
- JVM Stack: Thread-specific frame storing primitive local variables and method call references.
- PC Register & Native Method Stack.

3. Garbage Collection (GC):
Automatic memory management identifying unreferenced objects on Heap (G1GC, ZGC).`,
    learningObjectives: [
      'Illustrate the 4 pillars of Object-Oriented Programming with code examples',
      'Distinguish between JVM Heap, Stack, and Metaspace memory regions',
      'Explain Java Garbage Collection mark-and-sweep phases'
    ],
    flashcards: [
      {
        id: 'j-1',
        question: 'What is the key difference between Method Overloading and Method Overriding in Java?',
        answer: 'Overloading happens within the same class (same method name, different parameter signature, compile-time). Overriding happens in a subclass replacing a superclass method (same name and parameters, runtime polymorphism).',
        tag: 'OOP'
      },
      {
        id: 'j-2',
        question: 'Where are Java local primitive variables stored compared to Object instances?',
        answer: 'Local primitives are stored on the thread Stack frame; Object instances are stored on the JVM Heap.',
        tag: 'JVM Memory'
      }
    ],
    quizQuestions: [
      {
        id: 'j-q1',
        question: 'Which keyword prevents a Java class from being extended by any subclass?',
        options: ['static', 'abstract', 'final', 'synchronized'],
        correctIndex: 2,
        explanation: 'Declaring a class as final prevents inheritance and class extension.'
      }
    ],
    summarySections: [
      {
        title: 'JVM Architecture & Object Lifecycles',
        content: 'Java bytecodes compiled by javac execute on the Java Virtual Machine. Automatic Garbage Collectors track unreachable objects on Heap to free memory.',
        keyTakeaway: 'Stack memory handles quick primitive call execution; Heap handles long-lived objects.'
      }
    ],
    mnemonics: [
      {
        title: '4 Pillars of OOP',
        acronymOrPhrase: 'A P I E ("A Piece of Pie")',
        breakdown: [
          'A - Abstraction',
          'P - Polymorphism',
          'I - Inheritance',
          'E - Encapsulation'
        ],
        explanation: 'The four fundamental tenets of Object-Oriented Programming.'
      }
    ]
  },
  {
    id: 'dsa',
    name: 'Data Structures',
    category: 'Computer Science',
    description: 'Arrays, Linked Lists, Trees, Graphs, Sorting & Dynamic Programming',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    sampleNotes: `Data Structures & Algorithms: Complexity & Core Structures

1. Big-O Complexity Hierarchy (Fastest to Slowest):
O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2ⁿ) < O(N!)

2. Core Data Structures Time Complexities:
- Hash Table: Average Search O(1), Insertion O(1), Deletion O(1). Worst case O(N) on collision overload.
- Binary Search Tree (Balanced AVL / Red-Black): Search O(log N), Insertion O(log N).
- Array vs Linked List:
  - Array: Access O(1), Insertion/Deletion O(N).
  - Linked List: Access O(N), Insertion/Deletion at head O(1).

3. Graph Algorithms:
- Breadth-First Search (BFS): Queue-based, shortest path in unweighted graph, O(V + E).
- Depth-First Search (DFS): Stack/Recursion-based, topological sorting, O(V + E).`,
    learningObjectives: [
      'Analyze Big-O time and space complexity for core data structures',
      'Compare Arrays vs Linked Lists for memory allocation and random access',
      'Implement BFS and DFS graph traversals for pathfinding problems'
    ],
    flashcards: [
      {
        id: 'dsa-1',
        question: 'What is the average and worst-case time complexity of searching in a Hash Table?',
        answer: 'Average case is O(1). Worst case is O(N) when all keys hash to the same bucket causing severe collisions.',
        tag: 'Hash Tables'
      },
      {
        id: 'dsa-2',
        question: 'Which traversal algorithm (BFS or DFS) is guaranteed to find the shortest path in an unweighted graph?',
        answer: 'BFS (Breadth-First Search) using a Queue level-by-level traversal.',
        tag: 'Graph Traversal'
      }
    ],
    quizQuestions: [
      {
        id: 'dsa-q1',
        question: 'Which sorting algorithm guarantees O(N log N) worst-case time complexity while performing in-place partition swaps?',
        options: ['Bubble Sort', 'Quick Sort', 'Heap Sort', 'Insertion Sort'],
        correctIndex: 2,
        explanation: 'Heap Sort guarantees O(N log N) time complexity in all cases including worst case with O(1) space.'
      }
    ],
    summarySections: [
      {
        title: 'Algorithmic Efficiency & Selection',
        content: 'Choosing optimal data structures depends on operational trade-offs: contiguous memory access vs dynamic pointers, search speed vs insertion overhead.',
        keyTakeaway: 'Always choose data structures aligned with dominant query operations (e.g. hash maps for lookups, trees for ordered range queries).'
      }
    ],
    mnemonics: [
      {
        title: 'Big-O Growth Order',
        acronymOrPhrase: 'C L N L N S E ("Can Learners Notice Linear Notation Speed Exponentials")',
        breakdown: [
          'C - Constant O(1)',
          'L - Logarithmic O(log N)',
          'N - Linear O(N)',
          'L - Log-Linear O(N log N)',
          'S - Quadratic O(N²)',
          'E - Exponential O(2ⁿ)'
        ],
        explanation: 'Hierarchy of execution growth rates from fastest to slowest.'
      }
    ]
  }
];
