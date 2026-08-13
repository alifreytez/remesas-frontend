export const headerState = $state({
    title: '',
    showBack: false,
    backUrl: '',
    onBack: null as (() => void) | null
});

export function setHeader(title: string, showBack = false, backUrl = '', onBack: (() => void) | null = null) {
    headerState.title = title;
    headerState.showBack = showBack;
    headerState.backUrl = backUrl;
    headerState.onBack = onBack;
}
