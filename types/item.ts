interface Clue {
  question: string;
  answer: string;
}

export interface Item {
  createdAt: Date;
  clues?: Clue[];
  description?: string;
  email: string;
  isQuickCard: boolean;
  images?: string[];
  tags: string[];
  updatedAt?: Date;
  value?: number,
}

export interface ItemWithId extends Item {
  id: string;
}

export interface ItemToShow extends ItemWithId {
  id: string;
  count: number;
}
