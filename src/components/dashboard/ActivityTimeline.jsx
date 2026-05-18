export default function ActivityTimeline({

                                             logs = []

                                         }) {

    if (logs.length === 0) {

        return (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">

                No recent activity found

            </div>
        )
    }

    return (

        <div className="space-y-4">

            {logs.slice(0, 6).map((log) => (

                <div
                    key={log.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                >

                    <div className="flex items-start justify-between gap-4">

                        <div>

                            <h3 className="font-medium text-white">

                                {log.action}

                            </h3>

                            <p className="mt-1 text-sm text-slate-400">

                                {log.details}

                            </p>

                        </div>

                        <div className="text-right">

                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">

                                {log.role}

                            </p>

                            <p className="mt-1 text-xs text-slate-400">

                                {new Date(
                                    log.timestamp
                                ).toLocaleString()}
                            </p>

                        </div>

                    </div>

                </div>

            ))}

        </div>
    )
}