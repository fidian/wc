export type RefObject<T> = {
    ref: T;
};

export const ref = <T>(ref: T): RefObject<T> => ({ ref });
