export interface ReportData {
  date: string;
  senderPhone: string;
  senderName: string;
  senderAddress: string;
  receiverPhone: string;
  weight: number;
}

export class ReportsArray {
  private data: ReportData[];

  constructor() {
    this.data = [];
  }

  public add(reportData: ReportData): number {
    const index = this.data.length;
    this.data.push(reportData);
    return index;
  }

  public get(index: number): ReportData | null {
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

  public getAll(): ReportData[] {
    return [...this.data];
  }

  public clear(): void {
    this.data = [];
  }

  public size(): number {
    return this.data.length;
  }
}