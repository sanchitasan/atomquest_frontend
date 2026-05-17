import { useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"

import { getAuditLogs } from "../api/auditApi"

function AuditLogs() {

    const [logs, setLogs] = useState([])

    useEffect(() => {

        fetchLogs()

    }, [])

    const fetchLogs = async () => {

        try {

            const data = await getAuditLogs()

            setLogs(data)

        } catch (error) {

            console.log(error)
        }
    }

    return (

        <MainLayout>

            <h1 className="text-4xl font-bold mb-8">
                Audit Logs
            </h1>

            <div className="bg-white p-6 rounded-xl shadow">

                <table className="w-full">

                    <thead>

                    <tr className="border-b">

                        <th className="text-left py-3">
                            Action
                        </th>

                        <th className="text-left py-3">
                            Performed By
                        </th>

                        <th className="text-left py-3">
                            Role
                        </th>

                        <th className="text-left py-3">
                            Entity
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                    {logs.map((log) => (

                        <tr
                            key={log.id}
                            className="border-b"
                        >

                            <td className="py-3">
                                {log.action}
                            </td>

                            <td className="py-3">
                                {log.performed_by}
                            </td>

                            <td className="py-3">
                                {log.role}
                            </td>

                            <td className="py-3">
                                {log.entity}
                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        </MainLayout>
    )
}

export default AuditLogs