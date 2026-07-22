export interface WatchlistEntity {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWatchlistDto {
  name: string;
  symbols: string[];
  isPublic?: boolean;
}
