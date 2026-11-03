import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const nextReport = response?.interviewReport ?? response
            setReport(nextReport)
            return nextReport
        } catch (error) {
            console.log(error)
            return null
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            const nextReport = response?.interviewReport ?? response
            setReport(nextReport)
            return nextReport
        } catch (error) {
            console.log(error)
            return null
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            const nextReports = response?.interviewReports ?? []
            setReports(nextReports)
            return nextReports
        } catch (error) {
            console.log(error)
            return []
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const pdfBlob = response?.data ?? response
            const blob = pdfBlob instanceof Blob ? pdfBlob : new Blob([pdfBlob], { type: 'application/pdf' })
            const fileUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            const contentDisposition = response?.headers?.['content-disposition'] || response?.headers?.['Content-Disposition'] || ''
            const matches = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/) ?? null
            const filename = matches?.[1] || `resume_${interviewReportId}.pdf`

            link.href = fileUrl
            link.download = filename
            link.rel = 'noopener'
            document.body.appendChild(link)
            link.click()
            link.remove()

            setTimeout(() => window.URL.revokeObjectURL(fileUrl), 1500)
        } catch (error) {
            console.log(error)
            window.alert('Unable to download the resume PDF right now. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId, getReportById, getReports])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}