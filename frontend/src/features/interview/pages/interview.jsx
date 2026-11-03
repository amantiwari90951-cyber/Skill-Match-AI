import { useState } from 'react'
import "../style/interview.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'

const Interview = () => {
    const navigate = useNavigate()
    const { interviewId } = useParams()
    const { loading, report, getResumePdf } = useInterview()
    const [activeTab, setActiveTab] = useState('technical')

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    if (!report) {
        return (
            <main className='loading-screen'>
                <h1>Interview report not found.</h1>
                <button className='generate-btn' onClick={() => navigate('/')}>Back to home</button>
            </main>
        )
    }

    const technicalQuestions = report.technicalQuestions || []
    const behavioralQuestions = report.behavioralQuestions || []
    const preparationPlan = report.preparationPlan || []
    const skillGaps = report.skillGaps || []
    const matchScore = report.matchScore ?? 0

    const navItems = [
        { key: 'technical', label: 'Technical Questions', icon: '⌃', count: technicalQuestions.length },
        { key: 'behavioral', label: 'Behavioral Questions', icon: '◫', count: behavioralQuestions.length },
        { key: 'roadmap', label: 'Road Map', icon: '↘', count: preparationPlan.length }
    ]

    const renderQuestionList = (items) => (
        <div className='question-list'>
            {items.map((item, index) => (
                <div key={`${item.question}-${index}`} className='question-card'>
                    <div className='question-card__header'>
                        <span className='question-card__index'>Q{index + 1}</span>
                        <p className='question-card__question'>{item.question}</p>
                        <span className='question-card__chevron'>⌄</span>
                    </div>
                    <div className='question-card__body'>
                        <div className='question-card__section'>
                            <span className='question-card__tag question-card__tag--intention'>Intention</span>
                            <p>{item.intention}</p>
                        </div>
                        <div className='question-card__section'>
                            <span className='question-card__tag question-card__tag--answer'>Answer</span>
                            <p>{item.answer}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    const renderRoadMap = () => (
        <div className='roadmap-list'>
            {preparationPlan.map((dayPlan, index) => (
                <div key={`${dayPlan.focus}-${index}`} className='roadmap-day'>
                    <div className='roadmap-day__header'>
                        <span className='roadmap-day__badge'>Day {dayPlan.day}</span>
                        <h3>{dayPlan.focus}</h3>
                    </div>
                    <ul>
                        {(dayPlan.tasks || []).map((task, taskIndex) => (
                            <li key={`${task}-${taskIndex}`}>{task}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )

    return (
        <main className='report-page'>
            <div className='report-layout'>
                <aside className='report-sidebar'>
                    <div className='report-sidebar__label'>Sections</div>
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            type='button'
                            className={`report-sidebar__item ${activeTab === item.key ? 'report-sidebar__item--active' : ''}`}
                            onClick={() => setActiveTab(item.key)}
                        >
                            <span className='report-sidebar__icon'>{item.icon}</span>
                            <span>{item.label}</span>
                            <span className='report-sidebar__count'>{item.count}</span>
                        </button>
                    ))}
                </aside>

                <main className='report-content'>
                    <div className='content-header'>
                        <h1>{report.title || 'Technical Interview Plan'}</h1>
                        <span className='content-header__count'>
                            {activeTab === 'technical' ? `${technicalQuestions.length} questions` : activeTab === 'behavioral' ? `${behavioralQuestions.length} questions` : `${preparationPlan.length} days`}
                        </span>
                    </div>

                    {activeTab === 'technical' && renderQuestionList(technicalQuestions)}
                    {activeTab === 'behavioral' && renderQuestionList(behavioralQuestions)}
                    {activeTab === 'roadmap' && renderRoadMap()}

                    <div className='download-wrapper'>
                        <button type='button' className='download-btn' onClick={() => getResumePdf(interviewId)}>
                            Download Resume
                        </button>
                    </div>
                </main>

                <aside className='report-summary'>
                    <div className='match-card'>
                        <div className='match-score'>
                            <span>{matchScore}</span>
                            <small>%</small>
                        </div>
                        <p>Strong match for this role</p>
                    </div>

                    <div className='skill-card'>
                        <h3>Skill Gaps</h3>
                        {skillGaps.length > 0 ? (
                            <ul>
                                {skillGaps.map((skill, index) => (
                                    <li key={`${skill.skill}-${index}`} className={`skill-pill skill-pill--${skill.severity || 'medium'}`}>
                                        {skill.skill}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className='empty-state'>No major gaps identified.</p>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    )
}

export default Interview