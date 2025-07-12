export interface PackageData {
  receiverPhone: string;
  weight: number;
  date: string;
}

export class PackagesArray {
  private data: PackageData[];

  constructor() {
    this.data = [];
  }

  public add(packageData: PackageData): number {
    const index = this.data.length;
    this.data.push(packageData);
    return index;
  }

  public get(index: number): PackageData | null {
    if (index >= 0 && index < this.data.length) {
      return this.data[index];
    }
    return null;
  }

  public update(index: number, packageData: PackageData): boolean {
    if (index >= 0 && index < this.data.length) {
      this.data[index] = packageData;
      return true;
    }
    return false;
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

  public getAll(): PackageData[] {
    return [...this.data];
  }

  public clear(): void {
    this.data = [];
  }

  public size(): number {
    return this.data.length;
  }

  public isValidIndex(index: number): boolean {
    return index >= 0 && index < this.data.length;
  }
}
