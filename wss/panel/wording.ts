import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { isString } from '@/lib/objects';
import { copy } from './terminology';

/**
 * Presentation-layer wording for text that core authors and passes through primitives the WSS
 * shell presents (empty states, list summaries, error blocks, activity descriptions).
 *
 * Only ever applied to core-authored strings, never to user data (bot names, file names,
 * console output). Patterns are deliberately narrow: "server" is replaced only after a
 * determiner ("this server", "your server's"), so technical phrases such as "SFTP server" or
 * "server:power.start" stay intact. Backend payloads are not changed.
 */
type Replacer = (match: string, ...groups: string[]) => string;

const matchCase = (source: string, word: string): string =>
    source[0] === source[0]?.toUpperCase() ? word[0]!.toUpperCase() + word.slice(1) : word;

const rules: [RegExp, Replacer][] = [
    // "this server", "your servers", "the server's" -> "this bot", "your bots", "the bot's"
    [
        /\b(this|that|your|the|a|each|every|which)(\s+)server(s)?(['’]s)?\b/gi,
        (_, determiner: string, space: string, plural = '', possessive = '') =>
            `${determiner}${space}bot${plural}${possessive}`,
    ],
    // "server backup", "server directory" -> "bot backup", "bot directory"
    [
        /\bserver(\s+)(backup|backups|files?|directory|instance|process)\b/gi,
        (match, space: string, noun: string) => `${matchCase(match, 'bot')}${space}${noun}`,
    ],
    // "subuser" -> "team member" (Team Access)
    [/\bsub-?user(s)?\b/gi, (match, plural = '') => matchCase(match, `team member${plural}`)],
];

// Whole strings core uses as labels and titles that need more than the patterns above.
const phrases = new Map<string, string>([
    ['Change Server Details', copy.settings.detailsTitle],
    ['Server Name', copy.settings.name],
    ['Server Description', copy.settings.description],
    ['Reinstall Server', copy.settings.reinstallTitle],
    ['Startup Command', copy.runtime.launchCommand],
    ['Docker Image', copy.runtime.runtimeImage],
]);

/** Auth screens (WSS AuthCard): core's button and link texts. */
export const authPhrases = new Map<string, string>([
    ['Login', copy.auth.signIn],
    ['Return to Login', copy.auth.returnToSignIn],
    ['Send Email', copy.auth.sendResetLink],
    ['Reset Password', copy.auth.resetPassword],
]);

/** Console performance cards (WSS ChartBlock): core's chart titles. */
export const chartPhrases = new Map<string, string>([
    ['CPU Load', copy.graphs.cpu],
    ['Memory', copy.graphs.memory],
    ['Network', copy.graphs.network],
]);

// Exact titles core uses that need more than the patterns above.
const titles = new Map<string, string>([
    ['Server Suspended', 'Bot Suspended'],
    ['Access Denied', 'Access denied'],
    ['404', 'Page not found'],
]);

const applyRules = (text: string): string =>
    rules.reduce((value, [pattern, replace]) => value.replace(pattern, replace as never), text);

/** Rewords core text; quoted parts ("My server backup") are user data and stay as they are. */
export function reword(text: string): string {
    const phrase = phrases.get(text.trim());
    if (phrase) return phrase;
    return text
        .split(/("[^"]*"|“[^”]*”)/)
        .map((part, index) => (index % 2 === 1 ? part : applyRules(part)))
        .join('');
}

export function rewordTitle(text: string): string {
    return titles.get(text) ?? reword(text);
}

/**
 * Rewords the string children of a core-authored element tree (for example an `Empty` passed
 * as a table's empty state). Elements, keys and props other than `children` are untouched;
 * render-prop children are left alone.
 */
export function rewordNode(node: ReactNode, apply: (text: string) => string = reword): ReactNode {
    if (isString(node)) return apply(node);
    if (Array.isArray(node)) return Children.map(node, (child: ReactNode) => rewordNode(child, apply));
    if (isValidElement<{ children?: ReactNode }>(node)) {
        const { children } = node.props;
        if (children === undefined || children instanceof Function) return node;
        return cloneElement(node, undefined, rewordNode(children, apply));
    }
    return node;
}
