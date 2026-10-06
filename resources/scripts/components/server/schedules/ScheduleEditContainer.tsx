// WSS core patch: the schedule detail page is owned by WSS (wss/panel/schedules/ScheduleDetail.tsx),
// which reuses core's schedule query, task table columns and schedule/task actions. Upstream version: see wss/core-patches.json.
export { WssScheduleDetail as default } from '@/wss/schedules';
