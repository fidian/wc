export const each = <T>(arr: Iterable<T>, fn: (item: T) => void) => {
    for (const item of arr) {
        fn(item);
    }
}
