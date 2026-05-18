export default function MetricCard({

                                       title,
                                       value

                                   }) {

    return (

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(15,23,42,0.35)] backdrop-blur-xl">

            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">

                {title}

            </p>

            <h2 className="mt-4 text-3xl font-bold text-white">

                {value}

            </h2>

        </div>
    )
}