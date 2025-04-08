export interface Page {
  _id: string;
  title: string;
  content: string;
  icon: string;
  parent: string | null;
  createdAt: number;
  updatedAt: number;
}

export type Workspace = {
  workspaceId: string;
  name: string;
  icon: string;
  members: string[];
  ownerUsername: string;
}