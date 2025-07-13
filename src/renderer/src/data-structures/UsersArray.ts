export interface UserData {
  fullName: string;
  address: string;
}

export class UsersArray {
  private data: UserData[];

  constructor() {
    this.data = [];
  }

  public add(userData: UserData): number {
    const index = this.data.length;
    this.data.push(userData);
    return index;
  }

  public get(index: number): UserData | null {
    if (index >= 0 && index < this.data.length) {
      return this.data[index];
    }
    return null;
  }

  public remove(
    index: number
  ): { movedFromIndex: number; newIndex: number } | null {
    if (index < 0 || index >= this.data.length) {
      return null;
    }

    const lastIndex = this.data.length - 1;

    if (index === lastIndex) {
      this.data.pop();
      return null;
    } else {
      this.data[index] = this.data[lastIndex];
      this.data.pop();

      return {
        movedFromIndex: lastIndex,
        newIndex: index,
      };
    }
  }

  public getAll(): UserData[] {
    return [...this.data];
  }

  public clear(): void {
    this.data = [];
  }

  public size(): number {
    return this.data.length;
  }
}
