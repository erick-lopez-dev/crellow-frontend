export interface FullBoard {
    _id: string;
    title: string;
    description?: string;
    owner: string;
    members: { userId: string }[];
    lists: List[];
    createdAt: string;
}

export interface List {
    _id: string;
    title: string;
    boardId: string;
    position: number;
    createdAt: string;
    cards: Card[];
}

export interface Card {
    _id: string;
    title: string;
    description?: string;
    listId: string;
    members?: { userId: string }[];
    labelIds?: string[];
    dueDate?: string;
    position: number;
    createdAt: string;
}