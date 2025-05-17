export interface CellTowerInfo {
    cellId: number;
    lac: number;
    mcc: number;
    mnc: number;
    signalStrength: number;
}

declare module 'react-native' {
    interface NativeModulesStatic {
        CellInfoModule: {
            getCellTowerInfo(
                errorCallback: (error: string) => void,
                successCallback: (info: CellTowerInfo) => void
            ): void;
        };
    }
} 