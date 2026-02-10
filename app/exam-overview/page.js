'use client';

import { useState } from 'react';
import styles from './page.module.css';

function Accordion({ title, emoji, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={`${styles.accordion} ${open ? styles.accordionOpen : ''}`}>
            <button className={styles.accordionHeader} onClick={() => setOpen(!open)}>
                <span className={styles.accordionTitle}>
                    <span className={styles.accordionEmoji}>{emoji}</span>
                    {title}
                </span>
                <span className={styles.accordionArrow}>{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className={styles.accordionBody}>{children}</div>}
        </div>
    );
}

export default function ExamOverviewPage() {
    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>🎯 SSC CGL — Exam Overview</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                Everything you need to know about SSC CGL at one place.
            </p>

            {/* Basic Info */}
            <Accordion title="Exam Details" emoji="📋" defaultOpen={true}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Conducting Body</span>
                        <span className={styles.infoValue}>Staff Selection Commission (SSC)</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Full Form</span>
                        <span className={styles.infoValue}>Combined Graduate Level Examination</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Exam Level</span>
                        <span className={styles.infoValue}>National</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Mode</span>
                        <span className={styles.infoValue}>Computer Based Test (CBT)</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Frequency</span>
                        <span className={styles.infoValue}>Once a year</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Official Website</span>
                        <span className={styles.infoValue}>ssc.gov.in</span>
                    </div>
                </div>
            </Accordion>

            {/* Posts & Salary */}
            <Accordion title="Posts & Salary" emoji="💼">
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Post</th>
                                <th>Group</th>
                                <th>Pay Level</th>
                                <th>Salary (approx)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Assistant Audit Officer</td><td>B</td><td>Level 8</td><td>₹47,600 – ₹1,51,100</td></tr>
                            <tr><td>Assistant Section Officer (CSS)</td><td>B</td><td>Level 6</td><td>₹35,400 – ₹1,12,400</td></tr>
                            <tr><td>Inspector (Income Tax)</td><td>C</td><td>Level 7</td><td>₹44,900 – ₹1,42,400</td></tr>
                            <tr><td>Inspector (Preventive Officer)</td><td>C</td><td>Level 7</td><td>₹44,900 – ₹1,42,400</td></tr>
                            <tr><td>Inspector (Examiner)</td><td>C</td><td>Level 7</td><td>₹44,900 – ₹1,42,400</td></tr>
                            <tr><td>Sub Inspector (CBI)</td><td>C</td><td>Level 7</td><td>₹44,900 – ₹1,42,400</td></tr>
                            <tr><td>Tax Assistant (CBDT/CBIC)</td><td>C</td><td>Level 4</td><td>₹25,500 – ₹81,100</td></tr>
                            <tr><td>Auditor (CAG/CGDA)</td><td>C</td><td>Level 5</td><td>₹29,200 – ₹92,300</td></tr>
                            <tr><td>Accountant/Jr. Accountant</td><td>C</td><td>Level 5</td><td>₹29,200 – ₹92,300</td></tr>
                            <tr><td>UDC (Upper Division Clerk)</td><td>C</td><td>Level 4</td><td>₹25,500 – ₹81,100</td></tr>
                        </tbody>
                    </table>
                </div>
                <div className={styles.vacancyNote}>
                    <span className={styles.vacancyIcon}>📊</span>
                    <span>Total Vacancies (CGL 2024): <strong>~17,727</strong> (varies yearly)</span>
                </div>
            </Accordion>

            {/* Exam Pattern */}
            <Accordion title="Exam Pattern (Tier-wise)" emoji="📝">
                <div className={styles.tierCard}>
                    <h4 className={styles.tierTitle}>Tier-I (Prelims)</h4>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Section</th>
                                    <th>Questions</th>
                                    <th>Marks</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Quantitative Aptitude</td><td>25</td><td>50</td><td rowSpan="4">60 min</td></tr>
                                <tr><td>General Intelligence & Reasoning</td><td>25</td><td>50</td></tr>
                                <tr><td>English Language</td><td>25</td><td>50</td></tr>
                                <tr><td>General Awareness</td><td>25</td><td>50</td></tr>
                            </tbody>
                            <tfoot>
                                <tr><td><strong>Total</strong></td><td><strong>100</strong></td><td><strong>200</strong></td><td><strong>60 min</strong></td></tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className={styles.tierCard}>
                    <h4 className={styles.tierTitle}>Tier-II (Mains)</h4>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Paper</th>
                                    <th>Questions</th>
                                    <th>Marks</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Paper I — Maths/Reasoning/English/GK</td><td>Varies</td><td>390</td><td>Varies</td></tr>
                                <tr><td>Paper II — English & Comprehension</td><td>Varies</td><td>200</td><td>Varies</td></tr>
                                <tr><td>Paper III — Statistics (for JSO)</td><td>100</td><td>200</td><td>120 min</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.tierCard}>
                    <h4 className={styles.tierTitle}>Tier-III (Descriptive)</h4>
                    <p className="text-sm text-muted">Pen & Paper — Essay/Letter/Application Writing in English/Hindi</p>
                    <p className="text-sm">100 marks | 60 minutes</p>
                </div>

                <div className={styles.tierCard}>
                    <h4 className={styles.tierTitle}>Tier-IV (Skill Test)</h4>
                    <p className="text-sm text-muted">DEST (Typing) — 2000 key depressions in 15 mins</p>
                    <p className="text-sm">CPT (for specific posts) — Word Processing, Spreadsheets, PPT</p>
                </div>
            </Accordion>

            {/* Marking Scheme */}
            <Accordion title="Marking Scheme" emoji="✅">
                <div className={styles.markingGrid}>
                    <div className={`card ${styles.markCard} ${styles.markCorrect}`}>
                        <div className={styles.markNum}>+2</div>
                        <div className="text-sm">Correct Answer</div>
                    </div>
                    <div className={`card ${styles.markCard} ${styles.markWrong}`}>
                        <div className={styles.markNum}>−0.50</div>
                        <div className="text-sm">Wrong Answer</div>
                    </div>
                    <div className={`card ${styles.markCard} ${styles.markSkip}`}>
                        <div className={styles.markNum}>0</div>
                        <div className="text-sm">Unattempted</div>
                    </div>
                </div>
                <div className={styles.markNote}>
                    <p className="text-sm text-muted">
                        ⚠️ Negative marking of <strong>0.50</strong> marks for each wrong answer in Tier-I.
                        For Tier-II, negative marking varies per section.
                    </p>
                </div>
            </Accordion>

            {/* Normalization */}
            <Accordion title="Normalization Rule" emoji="📐">
                <div className={styles.normSection}>
                    <p className="text-sm">
                        SSC uses <strong>normalization</strong> to ensure fairness across multi-shift exams.
                        Since different shifts have different difficulty levels, raw scores are adjusted using a formula.
                    </p>
                    <div className={`card ${styles.formulaCard}`}>
                        <div className={styles.formulaTitle}>Normalization Formula</div>
                        <div className={styles.formula}>
                            Normalized Score = Mean(all shifts) + (Your Score − Mean(your shift)) × (SD(all shifts) / SD(your shift))
                        </div>
                    </div>
                    <div className={styles.normPoints}>
                        <div className={styles.normPoint}>
                            <span className={styles.normIcon}>📌</span>
                            <span className="text-sm">If your shift was harder, your score goes UP</span>
                        </div>
                        <div className={styles.normPoint}>
                            <span className={styles.normIcon}>📌</span>
                            <span className="text-sm">If your shift was easier, your score may go DOWN</span>
                        </div>
                        <div className={styles.normPoint}>
                            <span className={styles.normIcon}>📌</span>
                            <span className="text-sm">Final cutoff is based on normalized marks, not raw score</span>
                        </div>
                    </div>
                </div>
            </Accordion>

            {/* Cut-off Trends */}
            <Accordion title="Cut-off Trends (Year-wise)" emoji="📊">
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>General</th>
                                <th>OBC</th>
                                <th>SC</th>
                                <th>ST</th>
                                <th>EWS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>2024</td><td>176.21</td><td>165.38</td><td>147.44</td><td>133.63</td><td>162.11</td></tr>
                            <tr><td>2023</td><td>177.05</td><td>167.23</td><td>149.68</td><td>136.47</td><td>164.12</td></tr>
                            <tr><td>2022</td><td>142.23</td><td>130.11</td><td>118.22</td><td>106.86</td><td>133.55</td></tr>
                            <tr><td>2021</td><td>137.50</td><td>126.67</td><td>113.42</td><td>102.19</td><td>128.82</td></tr>
                            <tr><td>2020</td><td>142.06</td><td>132.14</td><td>120.25</td><td>108.33</td><td>134.18</td></tr>
                            <tr><td>2019</td><td>146.10</td><td>136.02</td><td>123.78</td><td>112.50</td><td>—</td></tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
                    * Cutoffs are for Tier-I (normalized). Final cutoff includes Tier-I + Tier-II + Tier-III.
                </p>
            </Accordion>

            {/* Important Dates */}
            <Accordion title="Important Dates & Timeline" emoji="📅">
                <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineDate}>October – November 2025</div>
                            <div className="text-sm">Notification Released</div>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineDate}>November – December 2025</div>
                            <div className="text-sm">Online Application Period</div>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineDate}>March – April 2026</div>
                            <div className="text-sm">Tier-I Exam (Prelims)</div>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineDate}>June – July 2026</div>
                            <div className="text-sm">Tier-II Exam (Mains)</div>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineDate}>August 2026</div>
                            <div className="text-sm">Tier-III (Descriptive)</div>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineDate}>September – October 2026</div>
                            <div className="text-sm">Tier-IV (Skill Test) & Final Result</div>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
                    * Dates are approximate and subject to SSC's official notification.
                </p>
            </Accordion>

            {/* Eligibility */}
            <Accordion title="Eligibility Criteria" emoji="🎓">
                <div className={styles.eligGrid}>
                    <div className={`card ${styles.eligCard}`}>
                        <div className={styles.eligIcon}>🎂</div>
                        <div className={styles.eligTitle}>Age Limit</div>
                        <div className="text-sm">18 – 32 years (varies by post)</div>
                        <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                            Relaxation: OBC (+3), SC/ST (+5), PwD (+10)
                        </div>
                    </div>
                    <div className={`card ${styles.eligCard}`}>
                        <div className={styles.eligIcon}>📚</div>
                        <div className={styles.eligTitle}>Education</div>
                        <div className="text-sm">Bachelor&apos;s Degree from recognized university</div>
                        <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                            Final year students can also apply
                        </div>
                    </div>
                    <div className={`card ${styles.eligCard}`}>
                        <div className={styles.eligIcon}>🔄</div>
                        <div className={styles.eligTitle}>Attempts</div>
                        <div className="text-sm">No limit on attempts</div>
                        <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                            Can attempt till upper age limit is reached
                        </div>
                    </div>
                    <div className={`card ${styles.eligCard}`}>
                        <div className={styles.eligIcon}>🌍</div>
                        <div className={styles.eligTitle}>Nationality</div>
                        <div className="text-sm">Indian citizens</div>
                        <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                            Subjects of Nepal, Bhutan, Tibetan refugees also eligible
                        </div>
                    </div>
                </div>
            </Accordion>
        </div>
    );
}
