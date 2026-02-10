// Complete SSC CGL Tier-1 Syllabus Data
// Weightage based on PYQ analysis (2019-2024)

const SYLLABUS_DATA = {
    subjects: [
        {
            id: 'qa',
            name: 'Quantitative Aptitude',
            emoji: '🔢',
            color: '#6C63FF',
            topics: [
                {
                    name: 'Number System',
                    weightage: 'high',
                    important: true,
                    pyqCount: 45,
                    subtopics: ['HCF & LCM', 'Divisibility Rules', 'Remainder Theorem', 'Unit Digit', 'Factorization', 'Prime Numbers']
                },
                {
                    name: 'Percentage',
                    weightage: 'high',
                    important: true,
                    pyqCount: 38,
                    subtopics: ['Basic Percentage', 'Successive Change', 'Population Problems', 'Price Increase/Decrease']
                },
                {
                    name: 'Ratio & Proportion',
                    weightage: 'high',
                    important: true,
                    pyqCount: 35,
                    subtopics: ['Simple Ratio', 'Compound Ratio', 'Proportion', 'Mixture & Alligation']
                },
                {
                    name: 'Profit & Loss',
                    weightage: 'high',
                    important: true,
                    pyqCount: 32,
                    subtopics: ['Basic P&L', 'Discount', 'Successive Discount', 'Marked Price', 'Dishonest Dealer']
                },
                {
                    name: 'Simple & Compound Interest',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 28,
                    subtopics: ['Simple Interest', 'Compound Interest', 'Difference between SI & CI', 'Installments']
                },
                {
                    name: 'Time & Work',
                    weightage: 'high',
                    important: true,
                    pyqCount: 40,
                    subtopics: ['Basic Efficiency', 'Pipes & Cisterns', 'Work & Wages', 'Alternate Days']
                },
                {
                    name: 'Time, Speed & Distance',
                    weightage: 'high',
                    important: true,
                    pyqCount: 42,
                    subtopics: ['Average Speed', 'Relative Speed', 'Trains', 'Boats & Streams', 'Circular Track']
                },
                {
                    name: 'Algebra',
                    weightage: 'high',
                    important: true,
                    pyqCount: 50,
                    subtopics: ['Algebraic Identities', 'Factorization', 'Linear Equations', 'Quadratic Equations', 'Surds & Indices']
                },
                {
                    name: 'Geometry',
                    weightage: 'high',
                    important: true,
                    pyqCount: 48,
                    subtopics: ['Triangles', 'Circles', 'Quadrilaterals', 'Coordinate Geometry', 'Similar Triangles', 'Congruent Triangles']
                },
                {
                    name: 'Mensuration',
                    weightage: 'high',
                    important: true,
                    pyqCount: 44,
                    subtopics: ['Area of 2D Shapes', 'Volume of 3D Shapes', 'Surface Area', 'Sphere & Hemisphere', 'Cylinder & Cone']
                },
                {
                    name: 'Trigonometry',
                    weightage: 'high',
                    important: true,
                    pyqCount: 46,
                    subtopics: ['Trigonometric Ratios', 'Height & Distance', 'Trigonometric Identities', 'Maximum & Minimum Values']
                },
                {
                    name: 'Data Interpretation',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 22,
                    subtopics: ['Bar Graph', 'Pie Chart', 'Line Graph', 'Table', 'Mixed DI']
                },
                {
                    name: 'Statistics',
                    weightage: 'low',
                    important: false,
                    pyqCount: 12,
                    subtopics: ['Mean', 'Median', 'Mode', 'Standard Deviation', 'Variance']
                },
                {
                    name: 'Average',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 25,
                    subtopics: ['Simple Average', 'Weighted Average', 'Average Speed', 'Age-based Average']
                },
                {
                    name: 'Partnership',
                    weightage: 'low',
                    important: false,
                    pyqCount: 10,
                    subtopics: ['Simple Partnership', 'Compound Partnership', 'Sleeping Partner']
                }
            ]
        },
        {
            id: 'gir',
            name: 'General Intelligence & Reasoning',
            emoji: '🧠',
            color: '#F59E0B',
            topics: [
                {
                    name: 'Analogy',
                    weightage: 'high',
                    important: true,
                    pyqCount: 55,
                    subtopics: ['Word Analogy', 'Number Analogy', 'Letter Analogy', 'Figure Analogy']
                },
                {
                    name: 'Classification',
                    weightage: 'high',
                    important: true,
                    pyqCount: 48,
                    subtopics: ['Word Classification', 'Number Classification', 'Letter Classification', 'Figure Classification']
                },
                {
                    name: 'Series',
                    weightage: 'high',
                    important: true,
                    pyqCount: 52,
                    subtopics: ['Number Series', 'Alphabet Series', 'Mixed Series', 'Figure Series']
                },
                {
                    name: 'Coding-Decoding',
                    weightage: 'high',
                    important: true,
                    pyqCount: 44,
                    subtopics: ['Letter Coding', 'Number Coding', 'Mixed Coding', 'Condition-based Coding']
                },
                {
                    name: 'Blood Relations',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 30,
                    subtopics: ['Basic Relations', 'Coded Relations', 'Family Tree', 'Mixed Problems']
                },
                {
                    name: 'Direction & Distance',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 28,
                    subtopics: ['Simple Direction', 'Shadow-based', 'Clock-based Direction', 'Distance Calculation']
                },
                {
                    name: 'Syllogism',
                    weightage: 'high',
                    important: true,
                    pyqCount: 35,
                    subtopics: ['Basic Syllogism', 'Either-Or Cases', 'Negative Conclusions', 'Possibility']
                },
                {
                    name: 'Venn Diagram',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 25,
                    subtopics: ['Two Sets', 'Three Sets', 'Region-based Questions']
                },
                {
                    name: 'Matrix & Word Formation',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 20,
                    subtopics: ['Matrix Arrangement', 'Word Formation from Letters', 'Meaningful Word']
                },
                {
                    name: 'Paper Folding & Cutting',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 22,
                    subtopics: ['Paper Folding', 'Paper Cutting', 'Hole Punching']
                },
                {
                    name: 'Mirror & Water Image',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 24,
                    subtopics: ['Mirror Image of Letters', 'Mirror Image of Numbers', 'Water Image', 'Clock Mirror']
                },
                {
                    name: 'Dice & Cube',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 26,
                    subtopics: ['Standard Dice', 'Open Dice', 'Cube Painting', 'Dice Rotation']
                },
                {
                    name: 'Mathematical Operations',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 18,
                    subtopics: ['Symbol Replacement', 'Equation Balancing', 'Sign Interchange']
                },
                {
                    name: 'Statement & Conclusion',
                    weightage: 'low',
                    important: false,
                    pyqCount: 14,
                    subtopics: ['Statement & Conclusion', 'Statement & Assumption', 'Statement & Argument']
                }
            ]
        },
        {
            id: 'eng',
            name: 'English Language',
            emoji: '📖',
            color: '#10B981',
            topics: [
                {
                    name: 'Reading Comprehension',
                    weightage: 'high',
                    important: true,
                    pyqCount: 55,
                    subtopics: ['Passage-based Questions', 'Inference', 'Vocabulary in Context', 'Tone & Purpose']
                },
                {
                    name: 'Fill in the Blanks',
                    weightage: 'high',
                    important: true,
                    pyqCount: 40,
                    subtopics: ['Single Blank', 'Double Blank', 'Sentence Completion']
                },
                {
                    name: 'Error Spotting',
                    weightage: 'high',
                    important: true,
                    pyqCount: 45,
                    subtopics: ['Subject-Verb Agreement', 'Tense Error', 'Preposition Error', 'Article Error', 'Pronoun Error']
                },
                {
                    name: 'Synonyms & Antonyms',
                    weightage: 'high',
                    important: true,
                    pyqCount: 38,
                    subtopics: ['One Word Synonyms', 'One Word Antonyms', 'Context-based Synonyms']
                },
                {
                    name: 'Idioms & Phrases',
                    weightage: 'high',
                    important: true,
                    pyqCount: 42,
                    subtopics: ['Common Idioms', 'Phrase Meanings', 'Sentence Usage']
                },
                {
                    name: 'One Word Substitution',
                    weightage: 'high',
                    important: true,
                    pyqCount: 36,
                    subtopics: ['Person-related', 'Place-related', 'Action-related', 'Science-related']
                },
                {
                    name: 'Sentence Improvement',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 30,
                    subtopics: ['Sentence Correction', 'Phrase Replacement', 'Word Replacement']
                },
                {
                    name: 'Active/Passive Voice',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 22,
                    subtopics: ['Simple Tenses', 'Perfect Tenses', 'Modal Verbs', 'Interrogative']
                },
                {
                    name: 'Direct/Indirect Speech',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 20,
                    subtopics: ['Statements', 'Questions', 'Commands', 'Exclamatory']
                },
                {
                    name: 'Cloze Test',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 25,
                    subtopics: ['Grammar-based Cloze', 'Vocabulary-based Cloze']
                },
                {
                    name: 'Sentence Rearrangement',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 18,
                    subtopics: ['Para Jumbles', 'Sentence Sequencing']
                },
                {
                    name: 'Spelling Correction',
                    weightage: 'low',
                    important: false,
                    pyqCount: 15,
                    subtopics: ['Commonly Misspelt Words', 'Confusing Words']
                }
            ]
        },
        {
            id: 'gk',
            name: 'General Awareness',
            emoji: '🌍',
            color: '#EF4444',
            topics: [
                {
                    name: 'History',
                    weightage: 'high',
                    important: true,
                    pyqCount: 48,
                    subtopics: ['Ancient India', 'Medieval India', 'Modern India', 'Freedom Movement', 'World History']
                },
                {
                    name: 'Geography',
                    weightage: 'high',
                    important: true,
                    pyqCount: 40,
                    subtopics: ['Physical Geography', 'Indian Geography', 'World Geography', 'Climate', 'Rivers & Mountains']
                },
                {
                    name: 'Polity & Constitution',
                    weightage: 'high',
                    important: true,
                    pyqCount: 45,
                    subtopics: ['Fundamental Rights', 'DPSP', 'Parliament', 'Judiciary', 'Constitutional Bodies', 'Amendments']
                },
                {
                    name: 'Economy',
                    weightage: 'high',
                    important: true,
                    pyqCount: 42,
                    subtopics: ['Macro Economics', 'Banking', 'Budget', 'Taxation', 'International Organizations', 'Five Year Plans']
                },
                {
                    name: 'General Science',
                    weightage: 'high',
                    important: true,
                    pyqCount: 50,
                    subtopics: ['Physics Basics', 'Chemistry Basics', 'Biology Basics', 'Human Body', 'Diseases', 'Inventions']
                },
                {
                    name: 'Physics',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 30,
                    subtopics: ['Motion & Force', 'Energy', 'Light', 'Sound', 'Electricity', 'Magnetism']
                },
                {
                    name: 'Chemistry',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 28,
                    subtopics: ['Elements', 'Compounds', 'Acids & Bases', 'Periodic Table', 'Chemical Reactions']
                },
                {
                    name: 'Biology',
                    weightage: 'medium',
                    important: true,
                    pyqCount: 32,
                    subtopics: ['Cell Biology', 'Plant Biology', 'Animal Biology', 'Genetics', 'Ecology']
                },
                {
                    name: 'Current Affairs',
                    weightage: 'high',
                    important: true,
                    pyqCount: 55,
                    subtopics: ['National News', 'International News', 'Awards & Honors', 'Sports', 'Books & Authors', 'Appointments']
                },
                {
                    name: 'Static GK',
                    weightage: 'medium',
                    important: false,
                    pyqCount: 25,
                    subtopics: ['Countries & Capitals', 'Currencies', 'National Symbols', 'Important Days', 'First in India/World']
                },
                {
                    name: 'Computer Awareness',
                    weightage: 'low',
                    important: false,
                    pyqCount: 12,
                    subtopics: ['Computer Basics', 'Software', 'Internet', 'Networking']
                },
                {
                    name: 'Art & Culture',
                    weightage: 'low',
                    important: false,
                    pyqCount: 15,
                    subtopics: ['Classical Dances', 'Music Forms', 'Paintings', 'Festivals', 'UNESCO Sites']
                }
            ]
        }
    ]
};

export default SYLLABUS_DATA;
