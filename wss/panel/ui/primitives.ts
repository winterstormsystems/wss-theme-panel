import type { WssPrimitives } from '@/wss';
import ActivityEntry from './ActivityEntry';
import ChartBlock from './ChartBlock';
import ContentBox from './ContentBox';
import DataTable from './DataTable';
import ListToolbar from './ListToolbar';
import StateBlock from './StateBlock';

/**
 * WSS presentations of core primitives, provided to the seams through the shell context
 * (`useWssPrimitive`). Outside the shell (admin) the seams render core's own markup.
 */
export const primitives: WssPrimitives = {
    DataTable,
    ListToolbar,
    ActivityLogEntry: ActivityEntry,
    ScreenBlock: StateBlock,
    ContentBox,
    ChartBlock,
};
