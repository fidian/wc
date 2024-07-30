export const attributeList: (n: Node) => Attr[] = (n: Node) => [
    ...(n as HTMLElement).attributes,
];
