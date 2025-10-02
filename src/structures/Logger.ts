import { SymbolsUI } from '@/ui/symbols'
import c from 'ansi-colors'

export type LoggerTextInput = string | ((color: typeof c) => string | undefined);

export type LoggerOptions = {
    prefix?: string | ((color: typeof c) => string);
}

export type LoggerBoxOptions = {
    title?: LoggerTextInput;
    message: LoggerTextInput;
    bottomTitle?: LoggerTextInput;
}

export class Logger {
    private prefix: string | undefined;

    private format(type: string, ...message: unknown[]) {
        const parts = [this.prefix, type, ...message].filter(Boolean);
        console.log(...parts);
    }

    private resolveText(text?: LoggerTextInput): string | undefined {
        if (!text) return undefined;
        return typeof text === 'function' ? text(c) : text;
    }

    constructor(options?: LoggerOptions) {
        this.prefix = this.resolveText(options?.prefix);
    }

    use(options?: LoggerOptions): Logger {
        return new Logger({
            prefix: options?.prefix ?? this.prefix,
        });
    }

    log(...message: unknown[]) {
        this.format('', ...message);
    }

    info(...message: unknown[]) {
        this.format(c.bold.cyan('[INFO]'), ...message);
    }

    warn(...message: unknown[]) {
        this.format(c.bold.yellow('[WARN]'), ...message);
    }

    error(...message: unknown[]) {
        this.format(c.bold.red('[ERROR]'), ...message);
    }

    success(...message: unknown[]) {
        this.format(c.bold.green('[SUCCESS]'), ...message);
    }

    topBorderBox(title?: LoggerTextInput) {
        const cornerTopLeftEmoji = c.yellow(SymbolsUI.box.cornerTopLeft);
        const pointedStarEmoji = c.yellowBright(SymbolsUI.pointedStar);

        const resolvedText = this.resolveText(title);

        const parts = [`${cornerTopLeftEmoji} ${pointedStarEmoji}`];
        if (resolvedText) {
            parts.push(`${resolvedText} ${pointedStarEmoji}`);
        }

        console.log(parts.join(' '));
    }

    borderBox(text: LoggerTextInput) {
        const verticalEmoji = c.yellow(SymbolsUI.box.vertical);
        const resolvedText = this.resolveText(text);

        console.log(`${verticalEmoji} `, resolvedText);
    }

    bottomBorderBox(title?: LoggerTextInput) {
        const cornerBottomLeftEmoji = c.yellow(SymbolsUI.box.cornerBottomLeft);
        const pointedStarEmoji = c.yellowBright(SymbolsUI.pointedStar);

        const resolvedText = this.resolveText(title);

        const parts = [`${cornerBottomLeftEmoji} ${pointedStarEmoji}`];
        if (resolvedText) {
            parts.push(`${resolvedText} ${pointedStarEmoji}`);
        }

        console.log(parts.join(' '));
    }

    box(options: LoggerTextInput | LoggerBoxOptions) {
        let title: LoggerTextInput | undefined;
        let message: LoggerTextInput;
        let bottomTitle: LoggerTextInput | undefined;

        if (typeof options === 'string' || typeof options === 'function') {
            message = options;
        } else {
            title = options.title;
            message = options.message;
            bottomTitle = options.bottomTitle;
        }

        this.topBorderBox(title);
        this.borderBox(message);
        this.bottomBorderBox(bottomTitle);
    }
}