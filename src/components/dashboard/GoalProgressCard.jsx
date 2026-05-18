function getProgressColor(score = 0) {

    if (score >= 100) {
        return "bg-emerald-400"
    }

    if (score >= 60) {
        return "bg-amber-400"
    }

    return "bg-rose-400"
}

export default function GoalProgressCard({

                                             goal,
                                             checkin

                                         }) {

    const progress =
        checkin?.progress_score || 0

    return (

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

            <div className="flex items-start justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2">

                        <h3 className="text-lg font-semibold text-white">

                            {goal.title}

                        </h3>

                        {goal.is_shared && (

                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-cyan-200">

                                Shared KPI

                            </span>

                        )}

                    </div>

                    <p className="mt-2 text-sm text-slate-400">

                        {goal.description}

                    </p>

                </div>

                <div className="text-right">

                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">

                        Weightage

                    </p>

                    <p className="mt-1 text-lg font-semibold text-white">

                        {goal.weightage}%

                    </p>

                </div>

            </div>

            <div className="mt-6">

                <div className="flex items-center justify-between text-sm">

                    <span className="text-slate-400">

                        Progress

                    </span>

                    <span className="font-medium text-white">

                        {progress.toFixed(1)}%

                    </span>

                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">

                    <div
                        className={`h-full rounded-full ${getProgressColor(progress)}`}
                        style={{
                            width: `${Math.min(progress, 100)}%`
                        }}
                    />

                </div>

                {progress > 100 && (

                    <div className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">

                        Overachieved

                    </div>

                )}

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">

                        Target

                    </p>

                    <p className="mt-2 text-lg font-semibold text-white">

                        {goal.target_value}

                    </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">

                        Actual

                    </p>

                    <p className="mt-2 text-lg font-semibold text-white">

                        {checkin?.actual_value || 0}

                    </p>

                </div>

            </div>

        </div>
    )
}