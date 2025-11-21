declare module "jspdf" {
    interface jsPDF {
        autoTable: (arg: any, options?: any) => void;
        previousAutoTable?: { finalY: number };
    }
}
