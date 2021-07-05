export function alert(title: any, text: any): {
    container: HTMLElement;
    okListener: () => void;
    cancelListener: () => void;
    hide: () => void;
};
export function prompt(title: any, text: any, inputValue: any, ok: any, cancel: any, focus: any): void;
export function promptPassphrase(title: any, text: any, inputValue: any, ok: any, cancel: any): void;
export function promptPassphraseCreation(ok: any, cancel: any): {
    container: HTMLElement;
    okListener: () => void;
    cancelListener: () => void;
    hide: () => void;
};
export function promptMulti({ title, text, inputValue }: {
    title: any;
    text: any;
    inputValue: any;
}, ok: any, cancel: any): {
    container: HTMLElement;
    okListener: () => void;
    cancelListener: () => void;
    hide: () => void;
};
export function confirm(title: any, text: any, ok: any, cancel: any): {
    container: HTMLElement;
    okListener: () => void;
    cancelListener: () => void;
    hide: () => void;
};
