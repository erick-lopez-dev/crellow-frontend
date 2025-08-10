export interface FullBoard {
    _id: string;
    title: string;
    description?: string;
    owner: string;
    members: { userId: string }[];
    lists: List[];
    createdAt: string;
}

interface List {
    _id: string;
    title: string;
    boardId: string;
    position: number;
    createdAt: string;
    cards: Card[];
}

interface Card {
    _id: string;
    title: string;
    description?: string;
    listId: string;
    memebers?: {userId: string}[];
    labelIds?: string[];
    dueDate?: string;
    position: number;
    createdAt: string;
}