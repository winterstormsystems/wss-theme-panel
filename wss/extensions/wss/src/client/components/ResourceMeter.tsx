import { toneBackground, usageRatio, usageTone } from '../status';

interface Props {
    label: string;
    /** Current value, already formatted. */
    value: string;
    /** Limit, already formatted; omitted when unlimited. */
    limit?: string;
    current: number;
    max: number;
    /** The panel's own alarm flag for this metric. */
    alarm: boolean;
}

/** Compact usage: label and value, a thin bar, then the limit. Unlimited resources show no bar. */
export default function ResourceMeter({ label, value, limit, current, max, alarm }: Props) {
    const ratio = usageRatio(current, max);
    const tone = usageTone(ratio, alarm);
    const percent = ratio === null ? null : Math.round(ratio * 100);

    return (
        <div className={'wss:min-w-0'}>
            <div className={'wss:flex wss:items-baseline wss:justify-between wss:gap-2 wss:text-xs'}>
                <span className={'wss:text-muted-foreground'}>{label}</span>
                <span
                    className={`wss:truncate wss:font-medium wss:tabular-nums ${
                        tone === 'danger' ? 'wss:text-destructive' : 'wss:text-foreground'
                    }`}
                >
                    {value}
                </span>
            </div>
            <div
                className={'wss:mt-1 wss:h-1.5 wss:overflow-hidden wss:rounded-full wss:bg-muted'}
                role={percent === null ? undefined : 'meter'}
                aria-label={percent === null ? undefined : `${label} usage`}
                aria-valuemin={percent === null ? undefined : 0}
                aria-valuemax={percent === null ? undefined : 100}
                aria-valuenow={percent ?? undefined}
                aria-valuetext={percent === null ? undefined : `${value} of ${limit} (${percent}%)`}
            >
                {percent !== null && (
                    <div
                        className={`wss:h-full wss:rounded-full wss:transition-[width] wss:duration-500 wss:motion-reduce:transition-none ${toneBackground[tone]}`}
                        style={{ width: `${Math.max(percent, current > 0 ? 2 : 0)}%` }}
                    />
                )}
            </div>
            <p className={'wss:mt-1 wss:truncate wss:text-[0.6875rem] wss:text-muted-foreground'}>
                {limit ? `of ${limit}` : 'No limit'}
            </p>
        </div>
    );
}
